import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_admin
from app.dependencies.db import get_db
from app.models.salary import SalaryInfo
from app.models.user import User
from app.schemas.salary import SalaryInfoResponse, SalaryInfoUpdate

router = APIRouter()

@router.get("/{user_id}", response_model=SalaryInfoResponse)
async def get_salary_info(
    user_id: uuid.UUID,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a user's salary info. Only accessible by admins.
    """
    # Check if user exists
    user_stmt = select(User).where(User.id == user_id)
    user_res = await db.execute(user_stmt)
    if not user_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    stmt = select(SalaryInfo).where(SalaryInfo.user_id == user_id)
    result = await db.execute(stmt)
    salary = result.scalar_one_or_none()

    if not salary:
        salary = SalaryInfo(user_id=user_id)
        db.add(salary)
        await db.commit()
        await db.refresh(salary)

    return salary

@router.put("/{user_id}", response_model=SalaryInfoResponse)
async def update_salary_info(
    user_id: uuid.UUID,
    salary_in: SalaryInfoUpdate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a user's salary info. Only accessible by admins.
    """
    # Check if user exists
    user_stmt = select(User).where(User.id == user_id)
    user_res = await db.execute(user_stmt)
    if not user_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    stmt = select(SalaryInfo).where(SalaryInfo.user_id == user_id)
    result = await db.execute(stmt)
    salary = result.scalar_one_or_none()

    if not salary:
        salary = SalaryInfo(user_id=user_id)
        db.add(salary)

    update_data = salary_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(salary, field, value)

    await db.commit()
    await db.refresh(salary)
    return salary
