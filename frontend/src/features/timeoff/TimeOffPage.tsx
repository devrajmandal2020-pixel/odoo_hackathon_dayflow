import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Palmtree, Clock, Plus, Check, X, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { slideUp, staggerContainer } from '@/lib/motion';
import { LeaveRequestModal } from './LeaveRequestModal';
import type { LeaveRequest, LeaveBalance } from '@/types/api';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export function TimeOffPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [teamRequests, setTeamRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeOffData = async () => {
    try {
      setIsLoading(true);
      // Fetch balance
      const balRes = await apiClient.get('/leave/my-balance');
      setBalance(balRes.data);

      // Fetch my requests
      const myReqRes = await apiClient.get('/leave/my-requests');
      setMyRequests(myReqRes.data);

      // Fetch team requests if admin
      if (isAdmin) {
        const teamReqRes = await apiClient.get('/leave/all?status=pending');
        setTeamRequests(teamReqRes.data);
      }
    } catch (error) {
      toast.error('Failed to load time off data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeOffData();
  }, [isAdmin]);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await apiClient.put(`/leave/${id}/review`, { status });
      toast.success(`Request ${status}`);
      fetchTimeOffData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${status} request`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'rejected': return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge variant="warning">Pending</Badge>;
    }
  };

  const formatLeaveType = (type: string) => {
    switch(type) {
      case 'sick': return 'Sick Leave';
      case 'casual': return 'Casual Leave';
      case 'paid': return 'Paid Leave';
      default: return type;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Time Off Management</h1>
          <p className="text-text-muted mt-1">Manage your leaves and time off requests.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Request Time Off
        </Button>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={slideUp}>
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Sick Leave</p>
              <h3 className="text-2xl font-bold text-text-heading">
                {balance ? balance.sick_total - balance.sick_used : 0} 
                <span className="text-sm font-normal text-text-muted"> days left</span>
              </h3>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={slideUp}>
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Casual Leave</p>
              <h3 className="text-2xl font-bold text-text-heading">
                {balance ? balance.casual_total - balance.casual_used : 0} 
                <span className="text-sm font-normal text-text-muted"> days left</span>
              </h3>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={slideUp}>
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
              <Palmtree className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Paid Leave</p>
              <h3 className="text-2xl font-bold text-text-heading">
                {balance ? balance.paid_total - balance.paid_used : 0} 
                <span className="text-sm font-normal text-text-muted"> days left</span>
              </h3>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {isAdmin && (
        <motion.div variants={slideUp} initial="hidden" animate="visible">
          <h2 className="text-lg font-bold text-text-heading mb-4">Pending Team Requests</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-main text-text-muted">
                  <tr>
                    <th className="px-6 py-4 font-medium">Employee</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Duration</th>
                    <th className="px-6 py-4 font-medium">Reason</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teamRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-bg-main/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-heading">{req.user?.full_name || req.user_id}</div>
                      </td>
                      <td className="px-6 py-4 text-text-body">{formatLeaveType(req.leave_type)}</td>
                      <td className="px-6 py-4 text-text-body">
                        {req.start_date} to {req.end_date}
                      </td>
                      <td className="px-6 py-4 text-text-body max-w-xs truncate" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {req.medical_certificate_url && (
                          <Button 
                            onClick={() => window.open(req.medical_certificate_url, '_blank')} 
                            variant="outline" 
                            size="sm" 
                            className="text-primary border-primary hover:bg-primary hover:text-white"
                            title="View Medical Certificate"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        )}
                        <Button onClick={() => handleReview(req.id, 'approved')} variant="outline" size="sm" className="text-success border-success hover:bg-success hover:text-white">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleReview(req.id, 'rejected')} variant="outline" size="sm" className="text-danger border-danger hover:bg-danger hover:text-white">
                          <X className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {teamRequests.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                        No pending requests from team.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={slideUp} initial="hidden" animate="visible">
        <h2 className="text-lg font-bold text-text-heading mb-4">My Requests</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg-main text-text-muted">
                <tr>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Applied On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-bg-main/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-heading">
                      {formatLeaveType(req.leave_type)}
                    </td>
                    <td className="px-6 py-4 text-text-body">
                      {req.start_date} to {req.end_date}
                    </td>
                    <td className="px-6 py-4 text-text-body max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {new Date(req.created_at || '').toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {myRequests.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                      You haven't requested any time off yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); fetchTimeOffData(); }}
      />
    </div>
  );
}
