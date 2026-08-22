from datetime import date
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, get_current_admin
from app.models.payroll import PayrollRecord
from app.models.salary import SalaryInfo
from app.models.user import User
from app.models.notification import Notification
from app.schemas.payroll import PayrollGenerateRequest, PayrollRecordResponse

router = APIRouter()

@router.post("/generate", response_model=PayrollRecordResponse, status_code=status.HTTP_201_CREATED)
async def generate_payroll(
    request: PayrollGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    # Check if already generated
    stmt_check = select(PayrollRecord).where(
        PayrollRecord.user_id == request.user_id,
        PayrollRecord.month == request.month
    )
    existing = await db.scalar(stmt_check)
    if existing:
        raise HTTPException(status_code=400, detail="Payroll already generated for this month")

    # Fetch SalaryInfo (use fallbacks if missing or incomplete)
    stmt_salary = select(SalaryInfo).where(SalaryInfo.user_id == request.user_id)
    salary_info = await db.scalar(stmt_salary)
    
    # Calculate mock or real values
    monthly_wage = salary_info.monthly_wage if salary_info and salary_info.monthly_wage else 10000.0
    
    # Basic is 50%
    basic_wage = monthly_wage * 0.50
    # HRA is 20%
    hra = monthly_wage * 0.20
    # Medical is fixed 500 or 5%
    medical = monthly_wage * 0.05
    # Special is remaining 25%
    special = monthly_wage * 0.25
    
    gross = basic_wage + hra + medical + special
    
    # Deductions
    pf = basic_wage * 0.12  # PF is 12% of basic
    tax = gross * 0.10      # 10% tax on gross
    
    net = gross - pf - tax

    record = PayrollRecord(
        user_id=request.user_id,
        month=request.month,
        basic_wage=basic_wage,
        house_rent_allowance=hra,
        medical_allowance=medical,
        special_allowance=special,
        provident_fund=pf,
        tax=tax,
        gross_salary=gross,
        net_salary=net,
        status="draft"
    )
    db.add(record)
    
    notification = Notification(
        user_id=request.user_id,
        title="Payroll Generated",
        message=f"Your payroll for {request.month} has been generated.",
        type="payroll"
    )
    db.add(notification)
    
    await db.commit()
    await db.refresh(record)
    
    # Reload with user
    stmt_reload = select(PayrollRecord).options(selectinload(PayrollRecord.user)).where(PayrollRecord.id == record.id)
    loaded_record = await db.scalar(stmt_reload)
    return loaded_record


@router.get("/my-slips", response_model=List[PayrollRecordResponse])
async def get_my_slips(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(PayrollRecord).options(selectinload(PayrollRecord.user)).where(PayrollRecord.user_id == current_user.id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/all", response_model=List[PayrollRecordResponse])
async def get_all_slips(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    stmt = select(PayrollRecord).options(selectinload(PayrollRecord.user))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.put("/{record_id}/pay", response_model=PayrollRecordResponse)
async def pay_record(
    record_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    stmt = select(PayrollRecord).options(selectinload(PayrollRecord.user)).where(PayrollRecord.id == record_id)
    record = await db.scalar(stmt)
    if not record:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    
    record.status = "paid"
    await db.commit()
    await db.refresh(record)
    return record
