from pydantic import BaseModel
from typing import List

class DepartmentCount(BaseModel):
    name: str
    count: int

class DashboardStats(BaseModel):
    total_employees: int
    departments: List[DepartmentCount]
    average_hours: float
    total_payroll: float
