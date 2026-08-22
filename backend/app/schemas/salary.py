from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict

class SalaryInfoBase(BaseModel):
    monthly_wage: float | None = None
    yearly_wage: float | None = None
    working_days_per_week: int | None = None
    break_time_hours: float | None = None
    basic_percent: float | None = None
    hra_percent: float | None = None
    medical_allowance_fixed: float | None = None
    standard_allowance_percent: float | None = None
    performance_bonus_percent: float | None = None
    lta_percent: float | None = None
    professional_tax: float | None = None

class SalaryInfoCreate(SalaryInfoBase):
    pass

class SalaryInfoUpdate(SalaryInfoBase):
    pass

class SalaryInfoResponse(SalaryInfoBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
