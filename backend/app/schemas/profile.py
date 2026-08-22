from datetime import date, datetime
import uuid
from pydantic import BaseModel, ConfigDict

class UserProfileBase(BaseModel):
    date_of_birth: date | None = None
    nationality: str | None = None
    gender: str | None = None
    marital_status: str | None = None
    date_of_joining: date | None = None
    bank_details: str | None = None
    branch_number: str | None = None
    bank_account: str | None = None
    uan_no: str | None = None
    key_code: str | None = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
