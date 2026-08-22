import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { staggerContainer, slideUp, fadeIn } from '@/lib/motion';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';
import type { Attendance } from '@/types/api';

// Mock Data
const MOCK_ATTENDANCE_ADMIN: Attendance[] = [
  { id: '1', user_id: '1', date: '2023-10-25', check_in: '09:00 AM', check_out: '05:30 PM', status: 'present', work_hours: 8.5 },
  { id: '2', user_id: '2', date: '2023-10-25', check_in: '09:15 AM', check_out: '06:00 PM', status: 'present', work_hours: 8.75 },
  { id: '3', user_id: '3', date: '2023-10-25', check_in: null, check_out: null, status: 'absent', work_hours: 0 },
  { id: '4', user_id: '4', date: '2023-10-25', check_in: '09:00 AM', check_out: '01:00 PM', status: 'half-day', work_hours: 4 },
];

const MOCK_ATTENDANCE_EMPLOYEE: Attendance[] = [
  { id: '1', user_id: 'me', date: '2023-10-25', check_in: '09:00 AM', check_out: '05:30 PM', status: 'present', work_hours: 8.5 },
  { id: '2', user_id: 'me', date: '2023-10-24', check_in: '08:55 AM', check_out: '05:00 PM', status: 'present', work_hours: 8.1 },
  { id: '3', user_id: 'me', date: '2023-10-23', check_in: null, check_out: null, status: 'absent', work_hours: 0 },
  { id: '4', user_id: 'me', date: '2023-10-20', check_in: '09:10 AM', check_out: '01:30 PM', status: 'half-day', work_hours: 4.3 },
];

export function AttendancePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  
  const [dateFilter, setDateFilter] = useState('');

  const records = isAdmin ? MOCK_ATTENDANCE_ADMIN : MOCK_ATTENDANCE_EMPLOYEE;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return <span className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">Present</span>;
      case 'absent': return <span className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full border border-red-200">Absent</span>;
      case 'half-day': return <span className="px-2.5 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200">Half-day</span>;
      default: return <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Attendance Tracking</h1>
          <p className="text-text-muted mt-1">Manage and view attendance records.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            className="px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {!isAdmin && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={slideUp} className="bg-white p-6 rounded-2xl shadow-sm border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted">Days Present</p>
                <p className="text-2xl font-bold text-text-heading">18</p>
              </div>
            </div>
          </motion.div>
          <motion.div variants={slideUp} className="bg-white p-6 rounded-2xl shadow-sm border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted">Total Working Days</p>
                <p className="text-2xl font-bold text-text-heading">22</p>
              </div>
            </div>
          </motion.div>
          <motion.div variants={slideUp} className="bg-white p-6 rounded-2xl shadow-sm border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted">Avg Work Hours</p>
                <p className="text-2xl font-bold text-text-heading">8.2h</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-main border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Employee</th>}
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Check In</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Work Hrs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-bg-main/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-text-heading whitespace-nowrap">{record.date}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-sm font-medium text-text-heading whitespace-nowrap">
                      User {record.user_id}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                  <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">{record.check_in || '-'}</td>
                  <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">{record.check_out || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-text-heading whitespace-nowrap">{record.work_hours > 0 ? `${record.work_hours}h` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
