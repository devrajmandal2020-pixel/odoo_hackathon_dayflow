import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Settings, Check, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { fadeIn } from '@/lib/motion';
import apiClient from '@/lib/api-client';
import type { Notification } from '@/types/api';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="h-16 bg-bg-card/80 backdrop-blur-sm border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-30"
    >
      {/* Left: Hamburger + Breadcrumb + Greeting */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-text-muted hover:bg-bg-main rounded-xl">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <p className="text-xs text-text-muted hidden sm:block">Portal &gt; Dashboard</p>
          <h1 className="text-base md:text-lg font-semibold text-text-heading">
            {getGreeting()}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
        </div>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="w-56 pl-9 pr-4 py-2 rounded-xl bg-bg-main border border-border text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              transition-all duration-200"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative p-2 rounded-xl hover:bg-bg-main transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5 text-text-body" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50"
              >
                <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-semibold text-text-heading">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary hover:text-primary-600 flex items-center gap-1 font-medium transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-text-muted">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 transition-colors hover:bg-gray-50 ${!notif.is_read ? 'bg-primary-50/30' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${!notif.is_read ? 'font-semibold text-text-heading' : 'font-medium text-text-body'}`}>
                              {notif.title}
                            </h4>
                            {!notif.is_read && (
                              <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-text-muted mt-2 font-medium">
                            {new Date(notif.created_at).toLocaleDateString(undefined, { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <button 
          onClick={() => window.location.href = '/profile'}
          className="p-2 rounded-xl hover:bg-bg-main transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5 text-text-body" />
        </button>

        {/* Profile */}
        <Avatar
          name={user?.full_name || 'User'}
          src={user?.profile_picture}
          size="sm"
        />
      </div>
    </motion.header>
  );
}
