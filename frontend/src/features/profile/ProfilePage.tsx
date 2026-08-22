import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { ResumeTab } from './components/ResumeTab';
import { PrivateInfoTab } from './components/PrivateInfoTab';
import { SalaryInfoTab } from './components/SalaryInfoTab';
import { SecurityTab } from './components/SecurityTab';

type Tab = 'resume' | 'private' | 'salary' | 'security';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<Tab>('resume');

  if (!user) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'resume', label: 'Resume' },
    { id: 'private', label: 'Private Info' },
    { id: 'salary', label: 'Salary Info' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-bg-card rounded-xl shadow-sm border border-border p-8 flex flex-col md:flex-row gap-12">
        <div className="flex gap-8">
          <div className="relative">
            <Avatar src={user.profile_picture} alt={user.full_name} fallback={user.full_name.charAt(0)} className="w-32 h-32 text-4xl" />
            <button className="absolute bottom-2 right-2 p-2 bg-bg-main rounded-full border border-border shadow-sm hover:bg-neutral-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
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
    </div>
  );
}
