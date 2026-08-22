from datetime import date, datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.leave import LeaveRequest, LeaveBalance
from app.models.notification import Notification
from app.schemas.leave import (
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveRequestUpdate,
    LeaveBalanceResponse,
)

router = APIRouter()

import os
import shutil
from fastapi import Form, UploadFile, File

@router.post("/request", response_model=LeaveRequestResponse)
async def create_leave_request(
    leave_type: str = Form(...),
    start_date: date = Form(...),
    end_date: date = Form(...),
    reason: str = Form(...),
    medical_certificate: Optional[UploadFile] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if leave_type == "sick" and not medical_certificate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medical certificate is mandatory for sick leave."
        )

    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after or equal to start date"
        )
        
    days_requested = (end_date - start_date).days + 1
    current_year = start_date.year
    
    # Check for overlapping requests
    overlap_stmt = select(LeaveRequest).where(
        and_(
            LeaveRequest.user_id == current_user.id,
            LeaveRequest.status.in_(["pending", "approved"]),
            LeaveRequest.start_date <= end_date,
            start_date <= LeaveRequest.end_date
        )
    )
    overlapping_request = await db.scalar(overlap_stmt)
    if overlapping_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a leave request during this date range."
        )
    
    balance_result = await db.execute(
        select(LeaveBalance).where(
            and_(
                LeaveBalance.user_id == current_user.id,
                LeaveBalance.year == current_year
            )
        )
    )
    balance = balance_result.scalar_one_or_none()
    
    if not balance:
        balance = LeaveBalance(
            user_id=current_user.id,
            year=current_year,
            sick_total=10, sick_used=0,
            casual_total=10, casual_used=0,
            paid_total=15, paid_used=0
        )
        db.add(balance)
        await db.flush()
        
    remaining = 0
    if leave_type == "sick":
        remaining = balance.sick_total - balance.sick_used
    elif leave_type == "casual":
        remaining = balance.casual_total - balance.casual_used
    elif leave_type == "paid":
        remaining = balance.paid_total - balance.paid_used
        
    if days_requested > remaining:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient {leave_type} leave balance. You only have {remaining} days left."
        )
        
    medical_certificate_url = None
    if medical_certificate:
        os.makedirs("uploads/medical", exist_ok=True)
        filename = f"{current_user.id}_{medical_certificate.filename}"
        file_path = os.path.join("uploads", "medical", filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(medical_certificate.file, buffer)
        medical_certificate_url = f"/api/v1/static/medical/{filename}"
    
    new_request = LeaveRequest(
        user_id=current_user.id,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        reason=reason,
        status="pending",
        medical_certificate_url=medical_certificate_url
    )
    
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    
    # We must return it with the user loaded for Pydantic to not crash
    result = await db.execute(
        select(LeaveRequest)
        .options(selectinload(LeaveRequest.user))
        .where(LeaveRequest.id == new_request.id)
    )
    return result.scalar_one()

@router.get("/my-requests", response_model=List[LeaveRequestResponse])
async def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(LeaveRequest)
        .options(selectinload(LeaveRequest.user))
        .where(LeaveRequest.user_id == current_user.id)
        .order_by(LeaveRequest.created_at.desc())
    )
    return result.scalars().all()

@router.get("/my-balance", response_model=LeaveBalanceResponse)
async def get_my_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    current_year = date.today().year
    
    result = await db.execute(
        select(LeaveBalance)
        .where(and_(LeaveBalance.user_id == current_user.id, LeaveBalance.year == current_year))
    )
    balance = result.scalar_one_or_none()
    
    if not balance:
        balance = LeaveBalance(
            user_id=current_user.id,
            year=current_year,
            sick_total=10, sick_used=0,
            casual_total=10, casual_used=0,
            paid_total=15, paid_used=0
        )
        db.add(balance)
        await db.commit()
        await db.refresh(balance)
        
    return balance

from fastapi import Query

@router.get("/all", response_model=List[LeaveRequestResponse])
async def get_all_requests(
    status_filter: str | None = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ("admin", "hr"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    stmt = select(LeaveRequest).options(selectinload(LeaveRequest.user))
    
    if status_filter:
        stmt = stmt.where(LeaveRequest.status == status_filter)
        
    stmt = stmt.order_by(LeaveRequest.created_at.desc())
        
    result = await db.execute(stmt)
    return result.scalars().all()

@router.put("/{request_id}/review", response_model=LeaveRequestResponse)
async def review_leave_request(
    request_id: UUID,
    update_data: LeaveRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ("admin", "hr"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    result = await db.execute(
        select(LeaveRequest)
        .options(selectinload(LeaveRequest.user))
        .where(LeaveRequest.id == request_id)
    )
    leave_request = result.scalar_one_or_none()
    
    if not leave_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
        
    if leave_request.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request is already reviewed")
        
    leave_request.status = update_data.status
    leave_request.reviewer_id = current_user.id
    leave_request.reviewed_at = datetime.now(timezone.utc)
    
    if update_data.status == "approved":
        current_year = leave_request.start_date.year
        days_requested = (leave_request.end_date - leave_request.start_date).days + 1
        
        balance_result = await db.execute(
            select(LeaveBalance).where(
                and_(
                    LeaveBalance.user_id == leave_request.user_id,
                    LeaveBalance.year == current_year
                )
            )
        )
        balance = balance_result.scalar_one_or_none()
        
        if not balance:
            balance = LeaveBalance(
                user_id=leave_request.user_id,
                year=current_year,
                sick_total=10, sick_used=0,
                casual_total=10, casual_used=0,
                paid_total=15, paid_used=0
            )
            db.add(balance)
            await db.flush()
            
        remaining = 0
        if leave_request.leave_type == "sick":
            remaining = balance.sick_total - balance.sick_used
        elif leave_request.leave_type == "casual":
            remaining = balance.casual_total - balance.casual_used
        elif leave_request.leave_type == "paid":
            remaining = balance.paid_total - balance.paid_used
            
        if days_requested > remaining:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot approve. Employee only has {remaining} days of {leave_request.leave_type} leave left."
            )
            
        if leave_request.leave_type == "sick":
            balance.sick_used += days_requested
        elif leave_request.leave_type == "casual":
            balance.casual_used += days_requested
        elif leave_request.leave_type == "paid":
            balance.paid_used += days_requested
            
    # Create notification
    notification = Notification(
        user_id=leave_request.user_id,
        title=f"Leave request {update_data.status}",
        message=f"Your leave request for {leave_request.start_date} to {leave_request.end_date} has been {update_data.status}.",
        type="leave"
    )
    db.add(notification)
            
    await db.commit()
    await db.refresh(leave_request)
    
    return leave_request
