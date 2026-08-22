from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_admin
from app.models.user import User
from app.models.profile import UserProfile
from app.models.attendance import Attendance
from app.models.payroll import PayrollRecord
from app.schemas.analytics import DashboardStats, DepartmentCount

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    # Total employees
    total_employees_stmt = select(func.count(User.id))
    total_employees = await db.scalar(total_employees_stmt) or 0
    
    # Departments
    departments_stmt = (
        select(User.department, func.count(User.id))
        .where(User.department.isnot(None))
        .group_by(User.department)
    )
    departments_result = await db.execute(departments_stmt)
    departments = [
        DepartmentCount(name=row[0], count=row[1])
        for row in departments_result.all()
    ]
    
    # Average hours
    avg_hours_stmt = select(func.avg(Attendance.total_hours)).where(Attendance.total_hours.isnot(None))
    avg_hours = await db.scalar(avg_hours_stmt) or 0.0
    
    # Total payroll
    current_month = date.today().strftime("%Y-%m")
    payroll_stmt = select(func.sum(PayrollRecord.gross_salary)).where(
        PayrollRecord.month == current_month
    )
    total_payroll = await db.scalar(payroll_stmt) or 0.0
    
    return DashboardStats(
        total_employees=total_employees,
        departments=departments,
        average_hours=float(avg_hours),
        total_payroll=float(total_payroll)
    )
