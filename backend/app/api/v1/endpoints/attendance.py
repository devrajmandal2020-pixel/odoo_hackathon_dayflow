from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, datetime, timezone
import uuid
from typing import List, Dict, Any

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceResponse, AttendanceRecordResponse, UserAttendanceStatus

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/check-in", response_model=AttendanceResponse)
async def check_in(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    
    # Check if already checked in today
    result = await db.execute(
        select(Attendance).where(and_(Attendance.user_id == current_user.id, Attendance.date == today))
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        if existing.check_in:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already checked in today"
            )
        else:
            existing.check_in = datetime.now(timezone.utc)
            existing.status = "present"
            await db.commit()
            await db.refresh(existing)
            return existing
            
    # Create new record
    new_attendance = Attendance(
        user_id=current_user.id,
        date=today,
        check_in=datetime.now(timezone.utc),
        status="present"
    )
    db.add(new_attendance)
    await db.commit()
    await db.refresh(new_attendance)
    return new_attendance

@router.post("/check-out", response_model=AttendanceResponse)
async def check_out(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    
    result = await db.execute(
        select(Attendance).where(and_(Attendance.user_id == current_user.id, Attendance.date == today))
    )
    attendance = result.scalar_one_or_none()
    
    if not attendance or not attendance.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must check in first"
        )
        
    if attendance.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked out today"
        )
        
    attendance.check_out = datetime.now(timezone.utc)
    
    # Calculate work hours
    time_diff = attendance.check_out - attendance.check_in
    attendance.work_hours = round(time_diff.total_seconds() / 3600, 2)
    
    # Simple extra hours logic
    if attendance.work_hours > 8:
        attendance.extra_hours = round(attendance.work_hours - 8, 2)
    
    await db.commit()
    await db.refresh(attendance)
    return attendance

@router.get("/today", response_model=Dict[uuid.UUID, UserAttendanceStatus])
async def get_today_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    
    # Get active users
    users_result = await db.execute(select(User).where(User.is_active == True))
    active_users = users_result.scalars().all()
    
    # Get today's attendance
    attendance_result = await db.execute(
        select(Attendance).where(Attendance.date == today)
    )
    attendances = attendance_result.scalars().all()
    attendance_map = {a.user_id: a.status for a in attendances}
    
    status_dict = {}
    for user in active_users:
        status = attendance_map.get(user.id, "absent")
        status_dict[user.id] = UserAttendanceStatus(status=status)
        
    return status_dict

@router.get("/records", response_model=List[AttendanceRecordResponse])
async def get_records(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role == "admin" or current_user.role == "hr":
        result = await db.execute(
            select(Attendance, User).join(User, Attendance.user_id == User.id)
        )
        records = result.all()
        
        response = []
        for attendance, user in records:
            record_dict = {
                "id": attendance.id,
                "user_id": attendance.user_id,
                "date": attendance.date,
                "check_in": attendance.check_in,
                "check_out": attendance.check_out,
                "status": attendance.status,
                "work_hours": attendance.work_hours,
                "extra_hours": attendance.extra_hours,
                "user_name": user.full_name,
                "user_email": user.email
            }
            response.append(AttendanceRecordResponse(**record_dict))
        return response
    else:
        result = await db.execute(
            select(Attendance, User).join(User, Attendance.user_id == User.id)
            .where(Attendance.user_id == current_user.id)
        )
        records = result.all()
        
        response = []
        for attendance, user in records:
            record_dict = {
                "id": attendance.id,
                "user_id": attendance.user_id,
                "date": attendance.date,
                "check_in": attendance.check_in,
                "check_out": attendance.check_out,
                "status": attendance.status,
                "work_hours": attendance.work_hours,
                "extra_hours": attendance.extra_hours,
                "user_name": user.full_name,
                "user_email": user.email
            }
            response.append(AttendanceRecordResponse(**record_dict))
        return response
