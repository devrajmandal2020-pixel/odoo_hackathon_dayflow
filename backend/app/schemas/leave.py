from datetime import date, datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LeaveRequestBase(BaseModel):
    leave_type: Literal["sick", "casual", "paid", "unpaid"]
    start_date: date
    end_date: date
    reason: str


class LeaveRequestCreate(LeaveRequestBase):
    pass


class LeaveRequestUpdate(BaseModel):
    status: Literal["approved", "rejected"]


class UserSimpleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    employee_id: str


class LeaveRequestResponse(LeaveRequestBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    status: str
    reviewer_id: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    medical_certificate_url: Optional[str] = None
    user: Optional[UserSimpleResponse] = None


class LeaveBalanceBase(BaseModel):
    year: int
    sick_total: int = 10
    sick_used: int = 0
    casual_total: int = 10
    casual_used: int = 0
    paid_total: int = 15
    paid_used: int = 0


class LeaveBalanceResponse(LeaveBalanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
