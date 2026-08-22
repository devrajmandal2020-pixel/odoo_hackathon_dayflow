import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Building, Search, UserCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fadeIn, staggerContainer, scaleIn } from '@/lib/motion';

// Mock Data
const MOCK_EMPLOYEES = [
  { id: '1', name: 'John Doe', role: 'Software Engineer', location: 'San Francisco', department: 'Engineering', status: 'present' },
  { id: '2', name: 'Jane Smith', role: 'Product Manager', location: 'New York', department: 'Product', status: 'present' },
  { id: '3', name: 'Alice Johnson', role: 'HR Specialist', location: 'Remote', department: 'HR', status: 'absent' },
  { id: '4', name: 'Bob Brown', role: 'Designer', location: 'London', department: 'Design', status: 'half-day' },
  { id: '5', name: 'Charlie Davis', role: 'Frontend Dev', location: 'San Francisco', department: 'Engineering', status: 'present' },
];

export function EmployeesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = MOCK_EMPLOYEES.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'half-day': return 'bg-yellow-500';
      default: return 'bg-gray-300';
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
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(
                      emp.status
                    )}`}
                    title={`Status: ${emp.status}`}
                  />
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="font-semibold text-text-heading group-hover:text-primary transition-colors">
                  {emp.name}
                </h3>
                <p className="text-sm text-text-muted">{emp.role}</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Building className="w-4 h-4" />
                  <span>{emp.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <MapPin className="w-4 h-4" />
                  <span>{emp.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
