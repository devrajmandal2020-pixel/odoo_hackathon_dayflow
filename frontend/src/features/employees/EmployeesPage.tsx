import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Building, Search, UserCircle2, Plus, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fadeIn, staggerContainer, scaleIn } from '@/lib/motion';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { User } from '@/types/api';

export function EmployeesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    employee_id: '',
    password: '',
    role: 'employee',
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  const fetchEmployees = async () => {
    try {
      const { data } = await apiClient.get<User[]>('/auth/users');
      setEmployees(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load employees');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.post('/auth/register', formData);
      toast.success('Employee added successfully');
      setIsAddModalOpen(false);
      fetchEmployees();
      setFormData({ full_name: '', email: '', employee_id: '', password: '', role: 'employee' });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInOut = () => {
    setIsCheckedIn(!isCheckedIn);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Check-in Banner */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-6 shadow-sm border border-border flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Welcome back, {user?.full_name || 'User'}! 👋</h1>
          <p className="text-text-muted mt-1">Here's what's happening in your workspace today.</p>
        </div>

        <div className="flex items-center gap-6 bg-bg-main p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-heading">
                {isCheckedIn ? 'Currently Checked In' : 'Not Checked In'}
              </p>
              <p className="text-xs text-text-muted">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button
            onClick={handleCheckInOut}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
              isCheckedIn
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-primary text-white hover:bg-primary-hover shadow-sm'
            }`}
          >
            {isCheckedIn ? 'Check Out' : 'Check In'}
          </button>
        </div>
      </motion.div>

      {/* Directory Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-text-heading">Team Directory</h2>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
            {isAdmin && (
              <Button onClick={() => setIsAddModalOpen(true)} className="whitespace-nowrap gap-2">
                <Plus className="w-4 h-4" /> Add Employee
              </Button>
            )}
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredEmployees.map((emp) => (
            <motion.div
              key={emp.id}
              variants={scaleIn}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/employees/${emp.id}`)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-border cursor-pointer transition-shadow hover:shadow-md group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                    {emp.profile_picture ? (
                      <img src={emp.profile_picture} alt={emp.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle2 className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${emp.is_active ? 'bg-green-500' : 'bg-red-500'}`}
                    title={emp.is_active ? 'Active' : 'Inactive'}
                  />
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="font-semibold text-text-heading group-hover:text-primary transition-colors">
                  {emp.full_name}
                </h3>
                <p className="text-sm text-text-muted">{emp.position || emp.role}</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Building className="w-4 h-4" />
                  <span>{emp.department || 'Not assigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{emp.address || 'Location unknown'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-text-heading">Add New Employee</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-text-muted hover:bg-bg-main rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
                <Input
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Employee ID"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-heading">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-main border border-border rounded-xl text-text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  >
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={loading}>
                    Add Employee
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
