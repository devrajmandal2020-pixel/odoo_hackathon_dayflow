import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar, FileText, X } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/motion';
import toast from 'react-hot-toast';

// Import components
import { ProfileCard } from './components/ProfileCard';
import { WorkTimeCard } from './components/WorkTimeCard';
import { HoursStatsCard } from './components/HoursStatsCard';
import { TeamSplitCard } from './components/TeamSplitCard';
import { TrackTeamCard } from './components/TrackTeamCard';
import { TalentCard } from './components/TalentCard';
import { PayrollSidebar } from './components/PayrollSidebar';

import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import type { DashboardStats } from '@/types/api';

export function DashboardPage() {
  const { user } = useAuthStore();
  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [dateRange, setDateRange] = useState('24 July - 24 Aug');
  
  // Widget visibility state
  const [widgets, setWidgets] = useState({
    profile: true,
    workTime: true,
    hoursStats: true,
    teamSplit: true,
    trackTeam: true,
    talent: true,
    payroll: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/analytics/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      }
    };

    fetchStats();
  }, []);

  const handlePrint = () => {
    toast.success('Preparing report for download...');
    setTimeout(() => window.print(), 500);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    const end = new Date(date);
    end.setMonth(end.getMonth() + 1);
    
    const format = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    setDateRange(`${format(date)} - ${format(end)}`);
    toast.success('Dashboard date range updated');
  };

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto pb-10 print-container"
    >
      {/* Header Actions - HR Only */}
      {isAdminOrHR && (
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-8 no-print">
          <Button onClick={() => setIsWidgetModalOpen(true)} variant="secondary" className="w-full sm:w-auto gap-2 bg-white hover:bg-gray-50 border border-border">
            <Plus className="w-4 h-4" />
            Add widget
          </Button>
          
          <div className="relative w-full sm:w-auto">
            <Button onClick={() => dateInputRef.current?.showPicker()} variant="secondary" className="w-full sm:w-auto gap-2 bg-white hover:bg-gray-50 border border-border">
              <Calendar className="w-4 h-4" />
              {dateRange}
            </Button>
            <input 
              type="date" 
              ref={dateInputRef}
              onChange={handleDateChange}
              className="absolute opacity-0 w-0 h-0"
            />
          </div>

          <Button onClick={handlePrint} className="w-full sm:w-auto gap-2">
            <FileText className="w-4 h-4" />
            Add report
          </Button>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (Profile & Work Time) - Visible to all */}
        <div className={isAdminOrHR ? "lg:col-span-3 space-y-6" : "lg:col-span-12 md:grid md:grid-cols-2 md:gap-6 md:space-y-0"}>
          {widgets.profile && (
            <motion.div variants={staggerItem} className="hover:-translate-y-1 transition-transform duration-300">
              <ProfileCard />
            </motion.div>
          )}
          
          {widgets.workTime && (
            <motion.div variants={staggerItem} className="h-[260px] hover:-translate-y-1 transition-transform duration-300">
              <WorkTimeCard 
                totalHours={stats?.work_time?.total_hours} 
                trend={stats?.work_time?.percent} 
                data={stats?.hours_stats?.weekly_data} 
              />
            </motion.div>
          )}
        </div>

        {/* MIDDLE & RIGHT COLUMNS (Main Stats & Payroll) - HR Only */}
        {isAdminOrHR && (
          <>
            <div className="lg:col-span-5 space-y-6 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                {widgets.hoursStats && (
                  <motion.div variants={staggerItem} className="hover:-translate-y-1 transition-transform duration-300">
                    <HoursStatsCard 
                      total={stats?.hours_stats?.total}
                      trend={stats?.hours_stats?.trend}
                      weeklyData={stats?.hours_stats?.weekly_data}
                    />
                  </motion.div>
                )}
                {widgets.teamSplit && (
                  <motion.div variants={staggerItem} className="hover:-translate-y-1 transition-transform duration-300">
                    <TeamSplitCard 
                      onsitePercent={stats?.team_split?.onsite_percent}
                      onsiteTrend={stats?.team_split?.onsite_trend}
                      remotePercent={stats?.team_split?.remote_percent}
                      remoteTrend={stats?.team_split?.remote_trend}
                    />
                  </motion.div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                {widgets.trackTeam && (
                  <motion.div variants={staggerItem} className="hover:-translate-y-1 transition-transform duration-300">
                    <TrackTeamCard 
                      inOffice={stats?.track_team?.in_office}
                      wfh={stats?.track_team?.wfh}
                      onLeave={stats?.track_team?.on_leave}
                      absent={stats?.track_team?.absent}
                    />
                  </motion.div>
                )}
                {widgets.talent && (
                  <motion.div variants={staggerItem} className="hover:-translate-y-1 transition-transform duration-300">
                    <TalentCard 
                      totalEmployees={stats?.talent?.total_employees}
                      newHires={stats?.talent?.new_hires}
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {widgets.payroll && (
              <div className="lg:col-span-4 h-full">
                <motion.div variants={staggerItem} className="h-full hover:-translate-y-1 transition-transform duration-300">
                  <PayrollSidebar 
                    totalProcessed={stats?.payroll_summary?.total_processed}
                    pendingApprovals={stats?.payroll_summary?.pending_approvals}
                    nextPayDate={stats?.payroll_summary?.next_pay_date}
                  />
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Widget Modal */}
      <AnimatePresence>
        {isWidgetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-text-heading">Manage Widgets</h2>
                <button
                  onClick={() => setIsWidgetModalOpen(false)}
                  className="p-2 text-text-muted hover:bg-bg-main rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {Object.entries(widgets).map(([key, isVisible]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-bg-main rounded-xl border border-border">
                    <span className="font-medium text-text-heading capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <button
                      onClick={() => toggleWidget(key as keyof typeof widgets)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        isVisible ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        isVisible ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
