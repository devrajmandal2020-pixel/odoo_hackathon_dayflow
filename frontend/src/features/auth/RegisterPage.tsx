import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, BadgeCheck, ArrowRight, Building } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { staggerContainer, staggerItem } from '@/lib/motion';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as 'employee' | 'hr',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.employee_id) newErrors.employee_id = 'Employee ID is required';
    if (!formData.full_name) newErrors.full_name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = 'Must include uppercase, lowercase, and number';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', {
        employee_id: formData.employee_id,
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center"
      >
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8"
          >
            <span className="text-white text-3xl font-bold">D</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Join DayFlow
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/80 text-lg"
          >
            Start managing your workdays with clarity and ease.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 grid grid-cols-2 gap-4 text-left"
          >
            {[
              { label: 'Profile Management', icon: '👤' },
              { label: 'Attendance Tracking', icon: '📅' },
              { label: 'Leave Requests', icon: '🏖️' },
              { label: 'Payroll Visibility', icon: '💰' },
            ].map((feature) => (
              <div key={feature.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <span className="text-2xl mb-1 block">{feature.icon}</span>
                <span className="text-white/90 text-sm">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={staggerItem} className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">D</span>
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h2 className="text-2xl font-bold text-text-heading mb-1">Create your account</h2>
            <p className="text-text-muted mb-8">Fill in your details to get started</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
              <Input
                label="Employee ID"
                placeholder="EMP-001"
                value={formData.employee_id}
                onChange={(e) => updateField('employee_id', e.target.value)}
                error={errors.employee_id}
                icon={<BadgeCheck className="w-4 h-4" />}
              />
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                error={errors.full_name}
                icon={<User className="w-4 h-4" />}
              />
            </motion.div>

            <motion.div variants={staggerItem}>
              <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                icon={<Mail className="w-4 h-4" />}
              />
            </motion.div>

            <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                error={errors.password}
                icon={<Lock className="w-4 h-4" />}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                icon={<Lock className="w-4 h-4" />}
              />
            </motion.div>

            {/* Role Selector */}
            <motion.div variants={staggerItem}>
              <label className="block text-sm font-medium text-text-heading mb-1.5">Role</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'employee', label: 'Employee', icon: User, desc: 'Regular access' },
                  { value: 'hr', label: 'HR Officer', icon: Building, desc: 'Management access' },
                ].map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => updateField('role', role.value)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer
                      ${formData.role === role.value
                        ? 'border-primary bg-primary-50'
                        : 'border-border hover:border-primary-200'
                      }
                    `}
                  >
                    <role.icon className={`w-5 h-5 ${
                      formData.role === role.value ? 'text-primary' : 'text-text-muted'
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${
                        formData.role === role.value ? 'text-primary' : 'text-text-heading'
                      }`}>
                        {role.label}
                      </p>
                      <p className="text-xs text-text-muted">{role.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
                icon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
              >
                Create Account
              </Button>
            </motion.div>
          </form>

          <motion.p variants={staggerItem} className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
