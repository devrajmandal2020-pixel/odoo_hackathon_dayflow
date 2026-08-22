from datetime import date, datetime
import uuid

from sqlalchemy import Float, ForeignKey, String, Date, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class PayrollRecord(Base):
    __tablename__ = "payroll_records"
    __table_args__ = (UniqueConstraint("user_id", "month", name="uq_payroll_user_month"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    month: Mapped[date] = mapped_column(Date, index=True)
    basic_wage: Mapped[float] = mapped_column(Float, default=0.0)
    house_rent_allowance: Mapped[float] = mapped_column(Float, default=0.0)
    medical_allowance: Mapped[float] = mapped_column(Float, default=0.0)
    special_allowance: Mapped[float] = mapped_column(Float, default=0.0)
    provident_fund: Mapped[float] = mapped_column(Float, default=0.0)
    tax: Mapped[float] = mapped_column(Float, default=0.0)
    gross_salary: Mapped[float] = mapped_column(Float, default=0.0)
    net_salary: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String, default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    user: Mapped["User"] = relationship("User")
