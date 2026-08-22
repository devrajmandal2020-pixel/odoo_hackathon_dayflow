import uuid
from datetime import date, datetime
from sqlalchemy import Column, String, Date, DateTime, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    check_in: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    check_out: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="absent")  # present, absent, half-day, short-leave
    work_hours: Mapped[float] = mapped_column(Float, nullable=True)
    extra_hours: Mapped[float] = mapped_column(Float, nullable=True)

    user = relationship("User")

    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='uq_user_date_attendance'),
    )
