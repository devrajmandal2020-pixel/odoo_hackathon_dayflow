from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
import uuid
from typing import Optional

class AttendanceBase(BaseModel):
    status: str
    work_hours: Optional[float] = None
    extra_hours: Optional[float] = None

class AttendanceCreate(BaseModel):
    status: str = "present"
    check_in: Optional[datetime] = None

class AttendanceUpdate(BaseModel):
    check_out: Optional[datetime] = None

class AttendanceResponse(AttendanceBase):
    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    check_in: Optional[datetime]
    check_out: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class UserAttendanceStatus(BaseModel):
    status: str

# Schema for joined query records
class AttendanceRecordResponse(AttendanceResponse):
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
