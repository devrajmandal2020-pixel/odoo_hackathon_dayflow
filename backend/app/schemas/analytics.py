from pydantic import BaseModel
from typing import List, Optional

class WorkTimeStats(BaseModel):
    tracked_hours: float
    total_hours: float
    percent: float

class TeamSplitStats(BaseModel):
    onsite_percent: float
    onsite_trend: float
    remote_percent: float
    remote_trend: float

class HoursStatsData(BaseModel):
    total: float
    trend: float
    weekly_data: List[float]

class TrackTeamStats(BaseModel):
    in_office: int
    wfh: int
    on_leave: int
    absent: int

class TalentStats(BaseModel):
    total_employees: int
    new_hires: int

class PayrollSummaryStats(BaseModel):
    total_processed: float
    pending_approvals: int
    next_pay_date: str

class DepartmentCount(BaseModel):
    name: str
    count: int

class DashboardStats(BaseModel):
    work_time: Optional[WorkTimeStats] = None
    team_split: Optional[TeamSplitStats] = None
    hours_stats: Optional[HoursStatsData] = None
    track_team: Optional[TrackTeamStats] = None
    talent: Optional[TalentStats] = None
    payroll_summary: Optional[PayrollSummaryStats] = None
    
    total_employees: int
    departments: List[DepartmentCount]
    average_hours: float
    total_payroll: float
