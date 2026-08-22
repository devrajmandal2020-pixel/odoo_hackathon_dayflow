import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class SalaryInfo(Base):
    __tablename__ = "salary_infos"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    monthly_wage: Mapped[float | None] = mapped_column(Float, nullable=True)
    yearly_wage: Mapped[float | None] = mapped_column(Float, nullable=True)
    working_days_per_week: Mapped[int | None] = mapped_column(Integer, nullable=True)
    break_time_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    basic_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    hra_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    medical_allowance_fixed: Mapped[float | None] = mapped_column(Float, nullable=True)
    standard_allowance_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    performance_bonus_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    lta_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    professional_tax: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", backref="salary_info", uselist=False)
