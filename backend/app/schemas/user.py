import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user registration."""
    employee_id: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(default="employee", pattern="^(employee|hr)$")


class UserResponse(BaseModel):
    """Schema for user response (public data)."""
    id: uuid.UUID
    employee_id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    department: str | None = None
    position: str | None = None
    phone: str | None = None
    address: str | None = None
    profile_picture: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    """Schema for updating user profile (limited fields for employees)."""
    full_name: str | None = Field(None, min_length=1, max_length=100)
    phone: str | None = Field(None, max_length=20)
    address: str | None = Field(None, max_length=500)
    profile_picture: str | None = None


class UserAdminUpdate(UserUpdate):
    """Schema for admin updating any user field."""
    email: EmailStr | None = None
    role: str | None = Field(None, pattern="^(employee|hr|admin)$")
    department: str | None = Field(None, max_length=100)
    position: str | None = Field(None, max_length=100)
    is_active: bool | None = None
