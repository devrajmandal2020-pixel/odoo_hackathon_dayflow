from fastapi import APIRouter

from app.api.v1.endpoints import auth, profile, salary, attendance, leave, payroll, notifications, analytics, reports

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
api_router.include_router(salary.router, prefix="/salary", tags=["Salary"])
api_router.include_router(attendance.router)
api_router.include_router(leave.router, prefix="/leave", tags=["Leave"])
api_router.include_router(payroll.router, prefix="/payroll", tags=["Payroll"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
