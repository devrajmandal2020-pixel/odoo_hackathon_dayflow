import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  Users,
  FileText,
  LogOut,
  Clock,
  Palmtree,
  DollarSign,
  UserCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { slideInLeft } from '@/lib/motion';

const employeeNavItems = [
  { to: '/', icon: Users, label: 'Employees' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
  { to: '/attendance', icon: Clock, label: 'Attendance' },
  { to: '/time-off', icon: Palmtree, label: 'Time Off' },
  { to: '/payroll', icon: DollarSign, label: 'Payroll' },
];

const adminNavItems = [
  { to: '/', icon: Users, label: 'Employees' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
  { to: '/attendance', icon: Clock, label: 'Attendance' },
  { to: '/time-off', icon: Palmtree, label: 'Time Off' },
  { to: '/payroll', icon: DollarSign, label: 'Payroll' },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      variants={slideInLeft}
      initial="hidden"
      animate="visible"
      className="w-64 h-screen bg-bg-card border-r border-border flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-xl font-bold text-text-heading">DayFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-body hover:bg-primary-50 hover:text-primary'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center">
            <span className="text-primary text-sm font-semibold">
              {user?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-heading truncate">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-text-muted truncate">
              {user?.role || 'Employee'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-sm text-text-muted hover:bg-red-50 hover:text-danger transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </motion.aside>
  );
}
