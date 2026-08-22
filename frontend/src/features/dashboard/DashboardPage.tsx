import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar, FileText } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/motion';

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

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto pb-10"
    >
      {/* Header Actions - HR Only */}
      {isAdminOrHR && (
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-8">
          <Button variant="secondary" className="gap-2 bg-white hover:bg-gray-50 border border-border">
            <Plus className="w-4 h-4" />
            Add widget
          </Button>
          <Button variant="secondary" className="gap-2 bg-white hover:bg-gray-50 border border-border">
            <Calendar className="w-4 h-4" />
            24 July - 24 Aug
          </Button>
          <Button className="gap-2">
            <FileText className="w-4 h-4" />
            Add report
          </Button>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (Profile & Work Time) - Visible to all */}
        <div className={isAdminOrHR ? "lg:col-span-3 space-y-6" : "lg:col-span-12 md:grid md:grid-cols-2 md:gap-6 md:space-y-0"}>
          <motion.div variants={staggerItem} className="hover:-translate-y-1 transition-transform duration-300">
            <ProfileCard />
          </motion.div>
          
          <motion.div variants={staggerItem} className="h-[260px] hover:-translate-y-1 transition-transform duration-300">
            <WorkTimeCard 
              totalHours={stats?.work_time?.total_hours} 
              trend={stats?.work_time?.percent} 
              data={stats?.hours_stats?.weekly_data} 
            />
          </motion.div>
        </div>

        {/* MIDDLE & RIGHT COLUMNS (Main Stats & Payroll) - HR Only */}
        {isAdminOrHR && (
          <>
            <div className="lg:col-span-5 space-y-6 flex flex-col">
              <div className="grid grid-cols-2 gap-6 flex-1">
                <motion.div variants={staggerItem} className="hover:-translate-y-1 transition-transform duration-300">
                  <HoursStatsCard 
                    total={stats?.hours_stats?.total}
                    trend={stats?.hours_stats?.trend}
                    weeklyData={stats?.hours_stats?.weekly_data}
                  />
                </motion.div>
                <motion.div variants={staggerItem} className="hover:-translate-y-1 transition-transform duration-300">
                  <TeamSplitCard 
                    onsitePercent={stats?.team_split?.onsite_percent}
                    onsiteTrend={stats?.team_split?.onsite_trend}
                    remotePercent={stats?.team_split?.remote_percent}
                    remoteTrend={stats?.team_split?.remote_trend}
                  />
                </motion.div>
              </div>
              <div className="grid grid-cols-2 gap-6 flex-1">
                <motion.div variants={staggerItem} className="hover:-translate-y-1 transition-transform duration-300">
                  <TrackTeamCard 
                    inOffice={stats?.track_team?.in_office}
                    wfh={stats?.track_team?.wfh}
                    onLeave={stats?.track_team?.on_leave}
                    absent={stats?.track_team?.absent}
                  />
                </motion.div>
                <motion.div variants={staggerItem} className="hover:-translate-y-1 transition-transform duration-300">
                  <TalentCard 
                    totalEmployees={stats?.talent?.total_employees}
                    newHires={stats?.talent?.new_hires}
                  />
                </motion.div>
              </div>
            </div>

            <div className="lg:col-span-4 h-full">
              <motion.div variants={staggerItem} className="h-full hover:-translate-y-1 transition-transform duration-300">
                <PayrollSidebar 
                  totalProcessed={stats?.payroll_summary?.total_processed}
                  pendingApprovals={stats?.payroll_summary?.pending_approvals}
                  nextPayDate={stats?.payroll_summary?.next_pay_date}
                />
              </motion.div>
            </div>
          </>
        )}
        
      </div>
    </motion.div>
  );
}
