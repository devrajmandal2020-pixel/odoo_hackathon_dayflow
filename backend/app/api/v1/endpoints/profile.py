import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.profile import UserProfile
from app.models.user import User
from app.schemas.profile import UserProfileResponse, UserProfileUpdate

router = APIRouter()

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get current user's profile. Creates a default empty profile if none exists.
    """
    stmt = select(UserProfile).where(UserProfile.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    return profile

@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update current user's profile.
    """
    stmt = select(UserProfile).where(UserProfile.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile

@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get any user's profile.
    """
    # Restrict normal employees from seeing other users' private profiles
    if current_user.id != user_id and current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You don't have permission to view other employees' private information"
        )

    # Check if user exists
    user_stmt = select(User).where(User.id == user_id)
    user_res = await db.execute(user_stmt)
    if not user_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    stmt = select(UserProfile).where(UserProfile.user_id == user_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    return profile

@router.put("/{user_id}", response_model=UserProfileResponse)
async def update_user_profile(
    user_id: uuid.UUID,
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update any user's profile (Admin/HR only).
    """
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You don't have permission to edit other employees' private information"
        )

    stmt = select(UserProfile).where(UserProfile.user_id == user_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile
