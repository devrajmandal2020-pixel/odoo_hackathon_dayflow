export interface User {
  id: string;
  employee_id: string;
  email: string;
  full_name: string;
  role: 'employee' | 'hr' | 'admin';
  is_active: boolean;
  created_at: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  employee_id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'employee' | 'hr';
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}

export interface UserProfile {
  dob?: string;
  nationality?: string;
  gender?: string;
  marital_status?: string;
  bank_name?: string;
  bank_account?: string;
  bank_ifsc?: string;
  uan_number?: string;
}

export interface SalaryInfo {
  basic_wage?: number;
  house_rent_allowance?: number;
  conveyance_allowance?: number;
  medical_allowance?: number;
  special_allowance?: number;
  provident_fund?: number;
  professional_tax?: number;
  income_tax?: number;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'half-day';
  work_hours: number;
}

export interface AttendanceSummary {
  days_present: number;
  total_working_days: number;
  average_hours: number;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: 'sick' | 'casual' | 'paid';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user?: {
    full_name: string;
    employee_id: string;
  };
  medical_certificate_url?: string;
}

export interface LeaveBalance {
  id: string;
  user_id: string;
  year: number;
  sick_total: number;
  sick_used: number;
  casual_total: number;
  casual_used: number;
  paid_total: number;
  paid_used: number;
}

export interface PayrollRecord {
  id: string;
  user_id: string;
  month: string;
  basic_wage: number;
  house_rent_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  gross_salary: number;
  provident_fund: number;
  tax: number;
  net_salary: number;
  status: 'draft' | 'paid';
  paid_at: string | null;
  created_at: string;
  user?: {
    full_name: string;
    employee_id: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  work_time: {
    tracked_hours: number;
    total_hours: number;
    percent: number;
  };
  team_split: {
    onsite_percent: number;
    onsite_trend: number;
    remote_percent: number;
    remote_trend: number;
  };
  hours_stats: {
    total: number;
    trend: number;
    weekly_data: number[];
  };
  track_team: {
    in_office: number;
    wfh: number;
    on_leave: number;
    absent: number;
  };
  talent: {
    total_employees: number;
    new_hires: number;
    turnover_rate: number;
  };
  payroll_summary: {
    total_processed: number;
    pending_approvals: number;
    next_pay_date: string;
  };
}
