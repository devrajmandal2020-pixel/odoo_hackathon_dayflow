import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import type { User } from '@/types/api';

type Tab = 'resume' | 'private' | 'salary' | 'security';

export function ProfilePage() {
  const { user: currentUser, setUser } = useAuthStore();
  const { id } = useParams();
  
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('resume');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const isOwnProfile = !id || id === currentUser?.id;
  const displayUser = isOwnProfile ? currentUser : targetUser;
  const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr';
  
  // Can only see private tabs if it's own profile OR user is admin/hr
  const canSeePrivateTabs = isOwnProfile || isAdminOrHR;

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!isOwnProfile && id) {
      const fetchTargetUser = async () => {
        try {
          const { data } = await apiClient.get(`/auth/users/${id}`);
          setTargetUser(data);
        } catch (error) {
          console.error(error);
          setFetchError(true);
        }
      };
      fetchTargetUser();
    }
  }, [id, isOwnProfile]);

  useEffect(() => {
    if (displayUser) {
      setFormData({
        full_name: displayUser.full_name || '',
        phone: displayUser.phone || '',
        address: displayUser.address || '',
      });
    }
  }, [displayUser]);

  if (!currentUser) return null;
  if (fetchError) return <div className="p-8 text-center text-red-500">Error loading user profile or you don't have permission.</div>;
  if (!displayUser) return <div className="p-8">Loading...</div>;

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      if (isOwnProfile) {
        const { data } = await apiClient.put('/auth/me', formData);
        setUser(data);
        toast.success('Profile updated successfully');
      } else {
        toast.error("Updating other user's basic info is not supported yet");
      }
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'resume', label: 'Resume' },
    ...(canSeePrivateTabs ? [
      { id: 'private', label: 'Private Information' },
      { id: 'salary', label: 'Salary Information' },
      { id: 'security', label: 'Security' },
    ] : [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-heading">{isOwnProfile ? 'My Profile' : 'Employee Profile'}</h1>
        {isOwnProfile && (
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 text-center border border-border">
            <div className="relative inline-block mb-4">
              <Avatar 
                src={displayUser.profile_picture} 
                fallback={displayUser.full_name.charAt(0)} 
                className="w-24 h-24 text-2xl mx-auto ring-4 ring-bg-main" 
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-success border-2 border-white rounded-full"></span>
            </div>
            <h2 className="text-lg font-bold text-text-heading">{displayUser.full_name}</h2>
            <p className="text-sm text-text-muted mt-1">{displayUser.position || displayUser.role || 'Employee'}</p>
            
            <div className="mt-6 pt-6 border-t border-border space-y-4 text-left">
              <div>
                <p className="text-xs text-text-muted font-medium mb-1">Email</p>
                <p className="text-sm font-medium text-text-main truncate">{displayUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium mb-1">Phone</p>
                <p className="text-sm font-medium text-text-main">{displayUser.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium mb-1">Location</p>
                <p className="text-sm font-medium text-text-main">{displayUser.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-border overflow-hidden">
            <div className="flex border-b border-border overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'resume' && <ResumeTab />}
                  {activeTab === 'private' && canSeePrivateTabs && <PrivateInfoTab userId={isOwnProfile ? undefined : displayUser.id} />}
                  {activeTab === 'salary' && canSeePrivateTabs && <SalaryInfoTab userId={isOwnProfile ? undefined : displayUser.id} />}
                  {activeTab === 'security' && canSeePrivateTabs && <SecurityTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h3 className="text-lg font-bold text-text-heading">Edit Profile</h3>
                <button onClick={() => setIsEditing(false)} className="text-text-muted hover:text-text-main">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <Input
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
              </div>
              <div className="p-6 bg-bg-main border-t border-border flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveProfile} isLoading={loading}>Save Changes</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
