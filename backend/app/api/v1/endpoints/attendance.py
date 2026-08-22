from fastapi import APIRouter, Depends, HTTPException, status, Query
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
            existing.check_in = datetime.now(timezone.utc).replace(tzinfo=None)
            existing.status = "present"
            await db.commit()
            await db.refresh(existing)
            return existing
            
    # Create new record
    new_attendance = Attendance(
        user_id=current_user.id,
        date=today,
        check_in=datetime.now(timezone.utc).replace(tzinfo=None),
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
        
    attendance.check_out = datetime.now(timezone.utc).replace(tzinfo=None)
    
    # Ensure check_in is tz-naive for subtraction
    check_in_naive = attendance.check_in.replace(tzinfo=None) if attendance.check_in.tzinfo else attendance.check_in
    
    # Calculate work hours
    time_diff = attendance.check_out - check_in_naive
    attendance.work_hours = round(time_diff.total_seconds() / 3600, 2)
    
    # Simple extra hours logic
    if attendance.work_hours > 8:
        attendance.extra_hours = round(attendance.work_hours - 8, 2)
        
    # Determine status based on work hours
    if attendance.work_hours < 4.0:
        attendance.status = "half-day"
    else:
        attendance.status = "present"
    
    await db.commit()
    await db.refresh(attendance)
    return attendance

@router.get("/today", response_model=Dict[uuid.UUID, UserAttendanceStatus])
async def get_today_status(
    date_filter: date | None = Query(None, alias="date"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_date = date_filter or date.today()
    
    # Get active users
    users_result = await db.execute(select(User).where(User.is_active == True))
    active_users = users_result.scalars().all()
    
    # Get attendance
    attendance_result = await db.execute(
        select(Attendance).where(Attendance.date == target_date)
    )
    attendances = attendance_result.scalars().all()
    attendance_map = {a.user_id: a.status for a in attendances}
    
    # Get approved leaves
    from app.models.leave import LeaveRequest
    leave_result = await db.execute(
        select(LeaveRequest).where(
            and_(
                LeaveRequest.status == "approved",
                LeaveRequest.start_date <= target_date,
                target_date <= LeaveRequest.end_date
            )
        )
    )
    leaves = leave_result.scalars().all()
    leave_user_ids = {l.user_id for l in leaves}
    
    status_dict = {}
    for user in active_users:
        if user.id in attendance_map:
            status = attendance_map[user.id]
        elif user.id in leave_user_ids:
            status = "leave"
        else:
            status = "absent"
        status_dict[user.id] = UserAttendanceStatus(status=status)
        
    return status_dict

@router.get("/records", response_model=List[AttendanceRecordResponse])
async def get_records(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Attendance, User).join(User, Attendance.user_id == User.id)
    if not (current_user.role == "admin" or current_user.role == "hr"):
        stmt = stmt.where(Attendance.user_id == current_user.id)
        
    if start_date:
        stmt = stmt.where(Attendance.date >= start_date)
    if end_date:
        stmt = stmt.where(Attendance.date <= end_date)
        
    result = await db.execute(stmt)
    records = result.all()
    
    existing_checkins = set()  # keys: (user_id, date)
    response = []
    
    for attendance, user in records:
        existing_checkins.add((attendance.user_id, attendance.date))
        record_dict = {
            "id": attendance.id,
            "user_id": attendance.user_id,
            "date": attendance.date,
            "check_in": attendance.check_in,
            "check_out": attendance.check_out,
            "status": attendance.status,
            "work_hours": attendance.work_hours or 0.0,
            "extra_hours": attendance.extra_hours or 0.0,
            "user_name": user.full_name,
            "user_email": user.email
        }
        response.append(AttendanceRecordResponse(**record_dict))
        
    # Fetch approved leave requests to generate virtual leave records
    from app.models.leave import LeaveRequest
    from sqlalchemy.orm import selectinload
    from datetime import timedelta
    
    leave_stmt = select(LeaveRequest).options(selectinload(LeaveRequest.user)).where(LeaveRequest.status == "approved")
    if not (current_user.role == "admin" or current_user.role == "hr"):
        leave_stmt = leave_stmt.where(LeaveRequest.user_id == current_user.id)
        
    if start_date:
        leave_stmt = leave_stmt.where(LeaveRequest.end_date >= start_date)
    if end_date:
        leave_stmt = leave_stmt.where(LeaveRequest.start_date <= end_date)
        
    leave_result = await db.execute(leave_stmt)
    leaves = leave_result.scalars().all()
    
    for leave in leaves:
        current_date = leave.start_date
        while current_date <= leave.end_date:
            if (not start_date or current_date >= start_date) and (not end_date or current_date <= end_date):
                if (leave.user_id, current_date) not in existing_checkins:
                    virtual_id = uuid.uuid5(uuid.NAMESPACE_DNS, f"{leave.user_id}_{current_date}_leave")
                    record_dict = {
                        "id": virtual_id,
                        "user_id": leave.user_id,
                        "date": current_date,
                        "check_in": None,
                        "check_out": None,
                        "status": "leave",
                        "work_hours": 0.0,
                        "extra_hours": 0.0,
                        "user_name": leave.user.full_name,
                        "user_email": leave.user.email
                    }
                    response.append(AttendanceRecordResponse(**record_dict))
            current_date += timedelta(days=1)
            
    response.sort(key=lambda x: x.date, reverse=True)
    return response
