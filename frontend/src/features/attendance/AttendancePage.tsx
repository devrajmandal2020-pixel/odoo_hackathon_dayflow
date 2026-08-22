import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { Clock, Calendar, CheckCircle2, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Attendance, User as UserType } from '@/types/api';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/error';

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (d: Date = new Date()) => {
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
};

const formatTime = (isoString: string | null | undefined) => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return isoString;
  }
};

const getWeekDates = (refDateStr: string) => {
  const dates = [];
  const refDate = new Date(refDateStr);
  const day = refDate.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = refDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const monday = new Date(refDate.setDate(diff));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(getLocalDateString(d));
  }
  return dates;
};

export function AttendancePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'all'>('daily');
  
  // Date filters
  const [selectedDailyDate, setSelectedDailyDate] = useState(getLocalDateString());
  const [selectedWeeklyDate, setSelectedWeeklyDate] = useState(getLocalDateString());
  const [dateFilter, setDateFilter] = useState(''); // Search filter for All History

  // Lists
  const [records, setRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  
  // Admin daily status map
  const [dailyStatusMap, setDailyStatusMap] = useState<Record<string, { status: string }>>({});

  const todayStr = getLocalDateString();
  
  // Fetch employees for dropdown (admin/hr only)
  useEffect(() => {
    if (isAdmin) {
      const fetchEmployees = async () => {
        try {
          const { data } = await apiClient.get('/auth/users');
          const activeList = data.filter((e: any) => e.is_active);
          setEmployees(activeList);
          if (activeList.length > 0) {
            setSelectedEmployeeId(activeList[0].id);
          }
        } catch (error) {
          console.error('Failed to fetch employees list', error);
        }
      };
      fetchEmployees();
    }
  }, [isAdmin]);

  // Fetch standard attendance history (filtered by Date for All History)
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (viewType === 'all' && dateFilter) {
        params.start_date = dateFilter;
        params.end_date = dateFilter;
      }
      
      const { data } = await apiClient.get('/attendance/records', { params });
      setRecords(data);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load attendance records'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin daily view data
  const fetchAdminDailyData = async () => {
    try {
      setLoading(true);
      // Fetch statuses for the selected day
      const statusRes = await apiClient.get('/attendance/today', {
        params: { date: selectedDailyDate }
      });
      setDailyStatusMap(statusRes.data);

      // Fetch check-in/out records for that day to populate times
      const recordsRes = await apiClient.get('/attendance/records', {
        params: { start_date: selectedDailyDate, end_date: selectedDailyDate }
      });
      setRecords(recordsRes.data);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load daily records'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee/selected employee weekly data
  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      const weekDates = getWeekDates(selectedWeeklyDate);
      const params: any = {
        start_date: weekDates[0],
        end_date: weekDates[6],
      };
      
      const { data } = await apiClient.get('/attendance/records', { params });
      setRecords(data);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load weekly records'));
    } finally {
      setLoading(false);
    }
  };

  // Run fetches based on active view and filters
  useEffect(() => {
    if (viewType === 'daily') {
      if (isAdmin) {
        fetchAdminDailyData();
      } else {
        fetchRecords();
      }
    } else if (viewType === 'weekly') {
      fetchWeeklyData();
    } else {
      fetchRecords();
    }
  }, [viewType, selectedDailyDate, selectedWeeklyDate, dateFilter, isAdmin]);

  // Check In handler
  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await apiClient.post('/attendance/check-in');
      toast.success('Successfully checked in today');
      if (viewType === 'daily' && isAdmin) {
        fetchAdminDailyData();
      } else {
        fetchRecords();
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Check-in failed'));
    } finally {
      setActionLoading(false);
    }
  };

  // Check Out handler
  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await apiClient.post('/attendance/check-out');
      toast.success('Successfully checked out today');
      if (viewType === 'daily' && isAdmin) {
        fetchAdminDailyData();
      } else {
        fetchRecords();
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Check-out failed'));
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to resolve current user's today status
  const getTodayStatus = () => {
    const todayRecord = records.find(r => r.date === todayStr && r.user_id === user?.id);
    if (!todayRecord) return 'not_checked_in';
    if (todayRecord.check_out === null) return 'checked_in';
    return 'checked_out';
  };

  const todayStatusState = getTodayStatus();
  const todayRecord = records.find(r => r.date === todayStr && r.user_id === user?.id);

  // Stats for employee
  const daysPresent = records.filter(r => r.status === 'present' && r.user_id === user?.id).length;
  const daysHalfDay = records.filter(r => r.status === 'half-day' && r.user_id === user?.id).length;
  const daysLeave = records.filter(r => r.status === 'leave' && r.user_id === user?.id).length;
  const totalRecords = records.filter(r => r.user_id === user?.id).length;
  const totalWorkHours = records.filter(r => r.user_id === user?.id).reduce((acc, r) => acc + (r.work_hours || 0), 0);
  const avgWorkHours = totalRecords > 0 ? (totalWorkHours / totalRecords).toFixed(1) : '0';

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': 
        return <span className="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 rounded-full border border-green-200">Present</span>;
      case 'absent': 
        return <span className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-full border border-red-200">Absent</span>;
      case 'half-day': 
        return <span className="px-2.5 py-1 text-xs font-semibold bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200">Half-day</span>;
      case 'leave': 
        return <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">Leave</span>;
      default: 
        return <span className="px-2.5 py-1 text-xs font-semibold bg-gray-50 text-gray-700 rounded-full border border-gray-200">{status}</span>;
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDailyDate);
    d.setDate(d.getDate() - 1);
    setSelectedDailyDate(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDailyDate);
    d.setDate(d.getDate() + 1);
    setSelectedDailyDate(getLocalDateString(d));
  };

  const handlePrevWeek = () => {
    const d = new Date(selectedWeeklyDate);
    d.setDate(d.getDate() - 7);
    setSelectedWeeklyDate(getLocalDateString(d));
  };

  const handleNextWeek = () => {
    const d = new Date(selectedWeeklyDate);
    d.setDate(d.getDate() + 7);
    setSelectedWeeklyDate(getLocalDateString(d));
  };

  // Filter records based on selected dropdown employee for admin weekly view
  const weeklyTargetUserId = isAdmin ? selectedEmployeeId : user?.id;
  const filteredWeeklyRecords = records.filter(r => r.user_id === weeklyTargetUserId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Attendance Management</h1>
          <p className="text-text-muted mt-1">Manage, view, and track daily and weekly attendance records.</p>
        </div>
        
        {/* View Toggle tabs */}
        <div className="bg-bg-card p-1 rounded-xl border border-border flex items-center shadow-sm">
          <button 
            onClick={() => setViewType('daily')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${viewType === 'daily' ? 'bg-primary text-white' : 'text-text-body hover:bg-bg-main'}`}
          >
            Daily View
          </button>
          <button 
            onClick={() => setViewType('weekly')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${viewType === 'weekly' ? 'bg-primary text-white' : 'text-text-body hover:bg-bg-main'}`}
          >
            Weekly View
          </button>
          <button 
            onClick={() => setViewType('all')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${viewType === 'all' ? 'bg-primary text-white' : 'text-text-body hover:bg-bg-main'}`}
          >
            All History
          </button>
        </div>
      </div>

      {/* Clock In / Out Area for Employees */}
      {!isAdmin && viewType === 'daily' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card for Action */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-border flex flex-col justify-between shadow-sm min-h-60 relative overflow-hidden">
            <div className="absolute top-20 right-10 opacity-5">
              <Clock className="w-48 h-48" />
            </div>
            
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-text-heading flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Shift Attendance
              </h2>
              <span className="text-sm font-medium text-text-muted">Today: {todayStr}</span>
            </div>

            <div className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-text-muted">Current Status</p>
                <div className="flex items-center gap-2">
                  {todayStatusState === 'not_checked_in' && (
                    <span className="text-xl font-bold text-danger flex items-center gap-1.5">
                      <AlertCircle className="w-5 h-5" /> Not Checked In
                    </span>
                  )}
                  {todayStatusState === 'checked_in' && (
                    <span className="text-xl font-bold text-success flex items-center gap-1.5 animate-pulse">
                      <CheckCircle2 className="w-5 h-5" /> Checked In
                    </span>
                  )}
                  {todayStatusState === 'checked_out' && (
                    <span className="text-xl font-bold text-text-heading flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-success" /> Shift Completed
                    </span>
                  )}
                </div>
                {todayRecord && (
                  <p className="text-xs text-text-muted mt-2">
                    In: {formatTime(todayRecord.check_in)} | Out: {formatTime(todayRecord.check_out)} {todayRecord.work_hours ? `| Hours: ${todayRecord.work_hours}h` : ''}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {todayStatusState === 'not_checked_in' && (
                  <button 
                    disabled={actionLoading}
                    onClick={handleCheckIn}
                    className="flex items-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-colors cursor-pointer shadow-md shadow-green-600/15"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                    Check In
                  </button>
                )}
                {todayStatusState === 'checked_in' && (
                  <button 
                    disabled={actionLoading}
                    onClick={handleCheckOut}
                    className="flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-colors cursor-pointer shadow-md shadow-red-600/15"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                    Check Out
                  </button>
                )}
                {todayStatusState === 'checked_out' && (
                  <button 
                    disabled
                    className="flex items-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-400 font-semibold rounded-2xl"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Completed
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats summary for employee */}
          <div className="bg-white rounded-3xl p-6 border border-border flex flex-col justify-between shadow-sm min-h-60">
            <h2 className="text-lg font-bold text-text-heading flex items-center gap-2 pb-4 border-b border-border">
              <Calendar className="w-5 h-5 text-primary" />
              Monthly Summary
            </h2>
            <div className="grid grid-cols-3 gap-4 py-4 text-center">
              <div>
                <p className="text-2xl font-black text-green-600">{daysPresent}</p>
                <p className="text-xs font-semibold text-text-muted mt-1">Present</p>
              </div>
              <div>
                <p className="text-2xl font-black text-yellow-600">{daysHalfDay}</p>
                <p className="text-xs font-semibold text-text-muted mt-1">Half-day</p>
              </div>
              <div>
                <p className="text-2xl font-black text-blue-600">{daysLeave}</p>
                <p className="text-xs font-semibold text-text-muted mt-1">Leave</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between text-sm">
              <span className="font-semibold text-text-muted">Avg Work Hours:</span>
              <span className="font-bold text-text-heading">{avgWorkHours}h / day</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-text-muted">Loading attendance data...</p>
          </div>
        ) : (
          <motion.div key={viewType} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
            
            {/* 1. Daily View */}
            {viewType === 'daily' && (
              <div className="space-y-6">
                
                {/* Daily view navigation bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={handlePrevDay} className="p-2 border border-border rounded-xl hover:bg-bg-main cursor-pointer transition-colors">
                      <ChevronLeft className="w-5 h-5 text-text-body" />
                    </button>
                    <span className="text-base font-bold text-text-heading">{selectedDailyDate}</span>
                    <button onClick={handleNextDay} className="p-2 border border-border rounded-xl hover:bg-bg-main cursor-pointer transition-colors">
                      <ChevronRight className="w-5 h-5 text-text-body" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-medium">Select Date:</span>
                    <input 
                      type="date" 
                      className="px-3 py-1.5 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 text-sm"
                      value={selectedDailyDate}
                      onChange={(e) => setSelectedDailyDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Daily view list for Admin */}
                {isAdmin ? (
                  <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-bg-main border-b border-border">
                          <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Check In</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Check Out</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Work Hours</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {employees.map((emp) => {
                            const statusData = dailyStatusMap[emp.id];
                            const status = statusData?.status || 'absent';
                            const dayRecord = records.find(r => r.user_id === emp.id);

                            return (
                              <tr key={emp.id} className="hover:bg-bg-main/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                                      <span className="text-primary text-xs font-bold">{emp.full_name.charAt(0)}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-text-heading">{emp.full_name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">{emp.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(status)}</td>
                                <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">{dayRecord?.check_in ? formatTime(dayRecord.check_in) : '-'}</td>
                                <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">{dayRecord?.check_out ? formatTime(dayRecord.check_out) : '-'}</td>
                                <td className="px-6 py-4 text-sm font-bold text-text-heading whitespace-nowrap">
                                  {dayRecord?.work_hours ? `${dayRecord.work_hours}h` : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Daily view details for Employee */
                  <div className="bg-white rounded-3xl p-6 border border-border shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-text-heading border-b border-border pb-3">Attendance details for {selectedDailyDate}</h3>
                    {records.find(r => r.date === selectedDailyDate) ? (
                      (() => {
                        const dayRec = records.find(r => r.date === selectedDailyDate)!;
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
                            <div className="p-4 bg-bg-main rounded-2xl border border-border">
                              <p className="text-xs font-semibold text-text-muted uppercase">Status</p>
                              <div className="mt-2">{getStatusBadge(dayRec.status)}</div>
                            </div>
                            <div className="p-4 bg-bg-main rounded-2xl border border-border">
                              <p className="text-xs font-semibold text-text-muted uppercase">Check-In</p>
                              <p className="mt-2 text-base font-bold text-text-heading">{formatTime(dayRec.check_in)}</p>
                            </div>
                            <div className="p-4 bg-bg-main rounded-2xl border border-border">
                              <p className="text-xs font-semibold text-text-muted uppercase">Check-Out</p>
                              <p className="mt-2 text-base font-bold text-text-heading">{formatTime(dayRec.check_out)}</p>
                            </div>
                            <div className="p-4 bg-bg-main rounded-2xl border border-border">
                              <p className="text-xs font-semibold text-text-muted uppercase">Work Hours</p>
                              <p className="mt-2 text-base font-bold text-text-heading">{dayRec.work_hours ? `${dayRec.work_hours}h` : '-'}</p>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="p-8 text-center bg-bg-main rounded-3xl border border-dashed border-border flex flex-col items-center justify-center gap-2 text-text-muted">
                        <AlertCircle className="w-8 h-8 text-text-muted" />
                        <p className="text-sm font-semibold">No attendance record found for this date.</p>
                        <p className="text-xs">Status: Absent / Leave / Weekend</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. Weekly View */}
            {viewType === 'weekly' && (
              <div className="space-y-6">
                
                {/* Navigation and employee selector */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={handlePrevWeek} className="p-2 border border-border rounded-xl hover:bg-bg-main cursor-pointer transition-colors">
                      <ChevronLeft className="w-5 h-5 text-text-body" />
                    </button>
                    <span className="text-base font-bold text-text-heading">Week Reference: {selectedWeeklyDate}</span>
                    <button onClick={handleNextWeek} className="p-2 border border-border rounded-xl hover:bg-bg-main cursor-pointer transition-colors">
                      <ChevronRight className="w-5 h-5 text-text-body" />
                    </button>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted font-medium">Select Employee:</span>
                      <select 
                        className="px-3 py-1.5 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 text-sm bg-white"
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      >
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Weekly Grid */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {getWeekDates(selectedWeeklyDate).map((wDate) => {
                    const rec = filteredWeeklyRecords.find(r => r.date === wDate);
                    const parsedDate = new Date(wDate);
                    const dayName = parsedDate.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateNum = parsedDate.getDate();
                    const isWeekend = parsedDate.getDay() === 0 || parsedDate.getDay() === 6;

                    let displayStatus = 'absent';
                    if (rec) {
                      displayStatus = rec.status;
                    } else if (isWeekend) {
                      displayStatus = 'weekend';
                    }

                    return (
                      <div 
                        key={wDate} 
                        className={`bg-white p-5 rounded-2xl border border-border flex flex-col justify-between min-h-48 shadow-sm transition-all hover:shadow-md ${wDate === todayStr ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="text-sm font-bold text-text-heading">{dayName}</span>
                            <span className="text-xs text-text-muted font-semibold">{dateNum}</span>
                          </div>
                          
                          <div className="mt-4">
                            {isWeekend && !rec ? (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-gray-50 text-gray-500 rounded-full border border-gray-100">Weekend</span>
                            ) : (
                              getStatusBadge(displayStatus)
                            )}
                          </div>
                        </div>

                        {rec ? (
                          <div className="mt-4 space-y-1 text-xs text-text-muted border-t border-border pt-3">
                            <p>In: {formatTime(rec.check_in)}</p>
                            <p>Out: {formatTime(rec.check_out)}</p>
                            {rec.work_hours > 0 && <p className="font-bold text-text-heading">Hours: {rec.work_hours}h</p>}
                          </div>
                        ) : (
                          <div className="mt-4 text-xs text-text-muted italic border-t border-border pt-3">
                            {isWeekend ? 'Rest Day' : 'No Record'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. All History */}
            {viewType === 'all' && (
              <div className="space-y-6">
                
                {/* Search date filters */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-medium">Search by Date:</span>
                    <input 
                      type="date" 
                      className="px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                    {dateFilter && (
                      <button 
                        onClick={() => setDateFilter('')}
                        className="px-3 py-1.5 bg-bg-main hover:bg-border border border-border text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* History Table */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-bg-main border-b border-border">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                          {isAdmin && <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Employee</th>}
                          {isAdmin && <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>}
                          <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Check In</th>
                          <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Check Out</th>
                          <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Work Hours</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {records.length > 0 ? (
                          records.map((record) => (
                            <tr key={record.id} className="hover:bg-bg-main/50 transition-colors">
                              <td className="px-6 py-4 text-sm text-text-heading whitespace-nowrap">{record.date}</td>
                              {isAdmin && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                                      <span className="text-primary text-xs font-bold">{(record.user_name || 'U').charAt(0)}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-text-heading">{record.user_name || 'User'}</span>
                                  </div>
                                </td>
                              )}
                              {isAdmin && <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">{record.user_email || '-'}</td>}
                              <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                              <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">{formatTime(record.check_in)}</td>
                              <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">{formatTime(record.check_out)}</td>
                              <td className="px-6 py-4 text-sm font-bold text-text-heading whitespace-nowrap">
                                {record.work_hours > 0 ? `${record.work_hours}h` : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={isAdmin ? 7 : 5} className="p-8 text-center text-text-muted font-medium">
                              No attendance history records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
