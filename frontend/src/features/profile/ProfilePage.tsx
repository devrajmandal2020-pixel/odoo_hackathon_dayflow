import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { ResumeTab } from './components/ResumeTab';
import { PrivateInfoTab } from './components/PrivateInfoTab';
import { SalaryInfoTab } from './components/SalaryInfoTab';
import { SecurityTab } from './components/SecurityTab';
import { Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

type Tab = 'resume' | 'private' | 'salary' | 'security';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('resume');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  if (!user) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'resume', label: 'Resume' },
    { id: 'private', label: 'Private Info' },
    { id: 'salary', label: 'Salary Info' },
    { id: 'security', label: 'Security' },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await apiClient.put('/auth/me', formData);
      setUser(data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-bg-card rounded-xl shadow-sm border border-border p-8 flex flex-col md:flex-row gap-12 relative">
        <button 
          onClick={() => {
            setFormData({
              full_name: user?.full_name || '',
              phone: user?.phone || '',
              address: user?.address || '',
            });
            setIsEditing(true);
          }}
          className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary hover:bg-primary-100 rounded-lg transition-colors font-medium text-sm"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>

        <div className="flex gap-8">
          <div className="relative">
            <Avatar src={user.profile_picture} alt={user.full_name} fallback={user.full_name.charAt(0)} className="w-32 h-32 text-4xl" />
          </div>
          <div className="space-y-4 min-w-[200px]">
            <h1 className="text-3xl font-semibold text-text-heading">{user.full_name}</h1>
            <div className="space-y-3">
              <div className="border-b border-border pb-1 text-sm text-text-body">{user.position || 'Job Position'}</div>
              <div className="border-b border-border pb-1 text-sm text-text-body">{user.email}</div>
              <div className="border-b border-border pb-1 text-sm text-text-body">{user.phone || 'Mobile'}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 min-w-[250px] pt-10 md:pt-10">
          <div className="border-b border-border pb-1 text-sm text-text-body">DayFlow Inc.</div>
          <div className="border-b border-border pb-1 text-sm text-text-body">{user.department || 'Department'}</div>
          <div className="border-b border-border pb-1 text-sm text-text-body">Manager</div>
          <div className="border-b border-border pb-1 text-sm text-text-body">{user.address || 'Location'}</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative whitespace-nowrap py-4 px-1 text-sm font-medium
                ${activeTab === tab.id
                  ? 'text-primary-700'
                  : 'text-text-secondary hover:text-text-main hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'resume' && <ResumeTab />}
            {activeTab === 'private' && <PrivateInfoTab />}
            {activeTab === 'salary' && <SalaryInfoTab />}
            {activeTab === 'security' && <SecurityTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-text-heading">Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-text-muted hover:bg-bg-main rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <Input
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={loading}>
                    Save Changes
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
