import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { EmployeesPage } from '@/features/employees/EmployeesPage';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { TimeOffPage } from '@/features/timeoff/TimeOffPage';
import { PayrollPage } from '@/features/payroll/PayrollPage';

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-bg-main">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <PageWrapper />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1A1A1A',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            padding: '12px 16px',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Future routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/employees/:id" element={<ProfilePage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/time-off" element={<TimeOffPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
          </Route>

          {/* Redirect root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
