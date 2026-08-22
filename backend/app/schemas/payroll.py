from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.leave import UserSimpleResponse


class PayrollGenerateRequest(BaseModel):
    user_id: UUID
    month: date


class PayrollRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    month: date
    basic_wage: float
    house_rent_allowance: float
    medical_allowance: float
    special_allowance: float
    provident_fund: float
    tax: float
    gross_salary: float
    net_salary: float
    status: str
    created_at: datetime
    user: Optional[UserSimpleResponse] = None
