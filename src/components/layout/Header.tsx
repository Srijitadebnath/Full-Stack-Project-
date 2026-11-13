import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  MessageSquare,
  ChevronDown,
  LogOut,
  Search,
  User as UserIcon,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Info,
  Check,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { User } from '../../types';
import { Avatar, Chip } from '../ui';
import { notificationService, AppNotification } from '../../services/notificationService';

interface HeaderProps {
  user: User | null;
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toastNotification, setToastNotification] = useState<AppNotification | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Subscribe to live notifications
  useEffect(() => {
    setNotifications(notificationService.getNotifications());
    const unsubscribe = notificationService.subscribe((list, latest) => {
      setNotifications(list);
      if (latest && !latest.read) {
        setToastNotification(latest);
        setTimeout(() => setToastNotification(null), 4500);
      }
    });
    return unsubscribe;
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derive title from current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Operational Overview';
    if (path.includes('events')) return 'Events Hub';
    if (path.includes('registrations')) return 'Participant Database';
    if (path.includes('teams')) return 'Organizing Committee (OC)';
    if (path.includes('vendors')) return 'OC Departments';
    if (path.includes('tasks')) return 'Work Assignments';
    if (path.includes('budget')) return 'Budget & Expense Tracker';
    if (path.includes('submissions')) return 'Work Updates & Submissions';
    if (path.includes('chat')) return 'Operations Messenger';
    if (path.includes('calendar')) return 'Event Calendar';
    if (path.includes('ai')) return 'AI Operations Assistant';
    if (path.includes('profile')) return 'My OC Member Profile';
    return 'Campus Operations';
  };

  const handleSignOut = () => {
    localStorage.removeItem('college_events_current_user');
    localStorage.removeItem('college_events_auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <>
      {/* Real-time Toast Pop-up */}
      {toastNotification && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] glass-panel p-4 rounded-2xl shadow-[0_15px_40px_rgba(124,58,237,0.2)] border border-white/90 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl neo-raised shrink-0">
              {getNotificationIcon(toastNotification.type)}
            </div>
            <div className="flex-1 text-xs">
              <span className="font-bold text-[#1E1B2E] block">{toastNotification.title}</span>
              <p className="text-[#4B4763] text-[11px] mt-0.5 leading-relaxed">
                {toastNotification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-4 z-40 mx-3 sm:mx-6 my-2 glass-panel rounded-2xl px-3 sm:px-6 py-2.5 flex items-center justify-between border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Left: Mobile Menu + Title Context */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSidebar}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 text-[#4B4763] hover:text-[#1E1B2E] hover:bg-white/60 rounded-xl cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-sm sm:text-lg font-bold text-[#1E1B2E] leading-tight tracking-tight">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] text-[#8B87A3] font-normal hidden sm:block">
              Smart College Event Operations
            </p>
          </div>
        </div>

        {/* Centre/Left: Neumorphic Inset Search Box (Desktop Only) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B87A3] pointer-events-none" />
            <input
              type="text"
              placeholder="Search events, tasks, vendors..."
              className="w-full h-10 pl-10 pr-4 neo-inset text-xs sm:text-sm text-[#1E1B2E] placeholder:text-[#8B87A3] focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all rounded-full"
            />
          </div>
        </div>

        {/* Right: Controls & Dropdowns */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Chat shortcut button */}
          <button
            onClick={() => navigate(user?.role === 'admin' ? '/admin/chat' : '/vendor/chat')}
            aria-label="Operations messenger"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full neo-raised flex items-center justify-center text-[#4B4763] hover:text-purple-600 transition-all cursor-pointer border border-white/60 active:scale-95 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Interactive Notifications Icon & Popover */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              aria-label="Notifications"
              className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full neo-raised flex items-center justify-center text-[#4B4763] hover:text-purple-600 transition-all cursor-pointer border border-white/60 active:scale-95 shrink-0"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Popover Dropdown (Mobile Clamped) */}
            {notificationOpen && (
              <div className="absolute right-[-60px] sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-88 max-w-sm glass-panel rounded-3xl border border-white/90 shadow-[0_20px_50px_rgba(124,58,237,0.18)] p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-purple-500/10">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#1E1B2E]">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => notificationService.markAllAsRead()}
                      className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2.5 my-3 pr-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#8B87A3]">
                      No notifications right now
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          notificationService.markAsRead(n.id);
                          if (n.link) {
                            setNotificationOpen(false);
                            navigate(n.link);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          n.read
                            ? 'bg-white/40 border-white/60 opacity-80 hover:opacity-100'
                            : 'bg-white/85 border-purple-200/80 shadow-[0_2px_12px_rgba(124,58,237,0.06)]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-xl neo-raised shrink-0 mt-0.5">
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="text-xs font-bold text-[#1E1B2E] truncate">
                                {n.title}
                              </h5>
                              <span className="text-[10px] text-[#8B87A3] shrink-0">
                                {n.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#4B4763] mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="pt-2 border-t border-purple-500/10 flex justify-end">
                    <button
                      onClick={() => notificationService.clearAll()}
                      className="text-[11px] font-medium text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear all</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Pill with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 pr-2 sm:pr-3 py-1 rounded-full btn-glass cursor-pointer active:scale-98"
            >
              <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" status="online" />
              <div className="hidden lg:block text-left pr-1">
                <h4 className="text-xs font-bold text-[#1E1B2E] leading-tight">
                  {user?.name || 'Faculty Admin'}
                </h4>
                <span className="text-[10px] text-[#8B87A3] font-medium capitalize block">
                  {user?.role === 'team'
                    ? 'OC Member'
                    : user?.role === 'admin'
                    ? 'Faculty Admin'
                    : 'Student'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8B87A3] transition-transform duration-200 ${
                  userDropdownOpen ? 'rotate-180 text-purple-600' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 glass-panel rounded-2xl border border-white/90 shadow-[0_15px_35px_rgba(124,58,237,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-2 border-b border-purple-500/10">
                  <p className="text-xs font-bold text-[#1E1B2E]">{user?.name}</p>
                  <p className="text-[11px] text-[#8B87A3] truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/vendor/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4B4763] hover:text-[#1E1B2E] hover:bg-white/70 transition-all text-left cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate(user?.role === 'admin' ? '/admin/ai' : '/vendor/ai');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4B4763] hover:text-[#1E1B2E] hover:bg-white/70 transition-all text-left cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Portal Permissions</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-purple-500/10">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
