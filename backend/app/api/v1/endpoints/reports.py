import io
import csv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_admin
from app.models.payroll import PayrollRecord
from app.models.user import User

router = APIRouter()

@router.get("/payroll/csv")
async def export_payroll_csv(
    month: str,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    stmt = (
        select(PayrollRecord)
        .options(selectinload(PayrollRecord.user))
        .where(PayrollRecord.month == month)
    )
    result = await db.execute(stmt)
    records = result.scalars().all()

    if not records:
        raise HTTPException(status_code=404, detail=f"No payroll records found for {month}")

    # Generate CSV using a generator
    def iter_csv():
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            "Employee Name",
            "Email",
            "Month",
            "Basic Wage",
            "HRA",
            "Medical Allowance",
            "Special Allowance",
            "Gross Salary",
            "PF",
            "Tax",
            "Net Salary",
            "Status"
        ])
        yield output.getvalue()
        output.truncate(0)
        output.seek(0)
        
        # Rows
        for r in records:
            writer.writerow([
                f"{r.user.first_name} {r.user.last_name}",
                r.user.email,
                r.month,
                f"{r.basic_wage:.2f}",
                f"{r.house_rent_allowance:.2f}",
                f"{r.medical_allowance:.2f}",
                f"{r.special_allowance:.2f}",
                f"{r.gross_salary:.2f}",
                f"{r.provident_fund:.2f}",
                f"{r.tax:.2f}",
                f"{r.net_salary:.2f}",
                r.status
            ])
            yield output.getvalue()
            output.truncate(0)
            output.seek(0)

    return StreamingResponse(
        iter_csv(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=payroll_{month}.csv"
        }
    )
