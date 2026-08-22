import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, Uuid, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class LeaveRequest(Base):
    """Model for employee leave / time off requests."""

    __tablename__ = "leave_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    leave_type: Mapped[str] = mapped_column(String(50), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    medical_certificate_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
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

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    reviewer: Mapped["User"] = relationship("User", foreign_keys=[reviewer_id])


class LeaveBalance(Base):
    """Model for tracking employee leave balances per year."""

    __tablename__ = "leave_balances"
    __table_args__ = (
        UniqueConstraint("user_id", "year", name="uq_leave_balance_user_year"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    sick_total: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    sick_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    casual_total: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    casual_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    paid_total: Mapped[int] = mapped_column(Integer, nullable=False, default=15)
    paid_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    user: Mapped["User"] = relationship("User", backref="leave_balances", foreign_keys=[user_id])
