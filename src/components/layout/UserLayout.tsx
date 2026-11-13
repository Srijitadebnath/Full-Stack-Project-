import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  CalendarDays,
  User as UserIcon,
  Shield,
  UserCheck,
  LogOut,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Info,
  Trash2,
} from 'lucide-react';
import { User } from '../../types';
import { authService } from '../../services/authService';
import { StudentAIAssistant } from '../StudentAIAssistant';
import { notificationService, AppNotification } from '../../services/notificationService';

interface UserLayoutProps {
  user?: User | null;
  onAuthChange?: () => void;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ user: propUser, onAuthChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(propUser ?? null);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(propUser ?? null);
  }, [propUser]);

  useEffect(() => {
    authService.getCurrentUser().then(setCurrentUser);
  }, []);

  // Strict role segregation: Prevent Admin or OC team members from being stranded in the Student view
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (currentUser?.role === 'team') {
      navigate('/vendor/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // Subscribe to live notifications
  useEffect(() => {
    setNotifications(notificationService.getNotifications());
    const unsub = notificationService.subscribe((list) => setNotifications(list));
    return unsub;
  }, []);

  // Close notification popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    authService.logout();
    setCurrentUser(null);
    onAuthChange?.();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/user/home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Passes', path: '/user/my-events', icon: <Ticket className="w-4 h-4" /> },
    { label: 'Calendar', path: '/user/calendar', icon: <CalendarDays className="w-4 h-4" /> },
    { label: 'Profile', path: '/user/profile', icon: <UserIcon className="w-4 h-4" /> },
  ];

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
    <div className="min-h-screen bg-[var(--page-bg,#F7F5FB)] flex flex-col font-sans relative overflow-x-hidden">
      {/* Ambient Blurred Glass Blobs */}
      <div className="fixed top-[-5%] left-[-5%] w-[500px] h-[500px] bg-[#7C3AED]/25 rounded-full blur-[80px] pointer-events-none -z-20" />
      <div className="fixed top-[25%] right-[-5%] w-[550px] h-[550px] bg-[#FB923C]/25 rounded-full blur-[80px] pointer-events-none -z-20" />
      <div className="fixed bottom-[-5%] left-[20%] w-[500px] h-[500px] bg-[#F472B6]/20 rounded-full blur-[80px] pointer-events-none -z-20" />

      {/* Floating Glass Navigation Bar */}
      <header className="sticky top-2 sm:top-3 z-40 mx-3 sm:mx-6 my-2">
        <nav className="glass-panel px-3 sm:px-6 py-2 rounded-2xl flex items-center justify-between shadow-[0_8px_32px_rgba(124,58,237,0.06)] border border-white/70">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Brand with Eventra Logo */}
            <button
              type="button"
              onClick={() => navigate('/user/home')}
              className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer group"
            >
              <img
                src="/eventra-logo.png"
                alt="EVENTRA"
                className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <div className="hidden sm:block">
                <span className="text-[10px] text-purple-600 font-extrabold uppercase tracking-wider block leading-tight">
                  Student Portal
                </span>
                <span className="text-[11px] text-[var(--color-text-muted,#8B87A3)] font-medium block leading-tight">
                  UPES Campus
                </span>
              </div>
            </button>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-white/40 border border-white/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-white/95 text-purple-700 shadow-[2px_2px_8px_rgba(163,150,200,0.25),-2px_-2px_8px_rgba(255,255,255,0.9)]'
                        : 'text-[var(--color-text-body,#4B4763)] hover:text-purple-700 hover:bg-white/50'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right User Controls */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium">
            {/* Student Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                aria-label="Notifications"
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full neo-raised flex items-center justify-center text-[#4B4763] hover:text-purple-600 transition-all cursor-pointer border border-white/60 active:scale-95 shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationOpen && (
                <div className="absolute right-[-40px] sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-88 max-w-sm glass-panel rounded-3xl border border-white/90 shadow-[0_20px_50px_rgba(124,58,237,0.18)] p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-purple-500/10">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#1E1B2E]">
                        Campus Alerts
                      </h4>
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

                  <div className="max-h-72 overflow-y-auto space-y-2.5 my-3 pr-1 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#8B87A3]">
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

            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin/dashboard')}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-all cursor-pointer border border-purple-200"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Console →</span>
                  </button>
                )}
                {currentUser.role === 'team' && (
                  <button
                    type="button"
                    onClick={() => navigate('/vendor/dashboard')}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-all cursor-pointer border border-purple-200"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>OC Work Desk →</span>
                  </button>
                )}

                {/* Clickable Profile Pill */}
                <button
                  type="button"
                  onClick={() => navigate('/user/profile')}
                  title="View Student Profile"
                  className="px-2.5 sm:px-3 py-1.5 bg-white/75 hover:bg-white/95 border border-white/80 rounded-full flex items-center gap-2 transition-all shadow-[2px_2px_8px_rgba(163,150,200,0.2)] hover:shadow-[3px_3px_12px_rgba(163,150,200,0.3)] cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="font-bold text-[var(--color-text-heading,#1E1B2E)] block leading-tight text-xs">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-purple-600 font-medium capitalize block leading-tight">
                      {currentUser.role === 'user' ? 'Student Profile' : currentUser.role}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/60 hover:bg-rose-50 text-[var(--color-text-muted,#8B87A3)] hover:text-rose-600 border border-white/80 transition-all cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn-primary text-xs px-3.5 py-1.5 rounded-full"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Main Routed Content (Proper Bottom Clearance on Mobile) */}
      <main className="flex-1 pb-24 md:pb-16">
        <Outlet />
      </main>

      {/* Native-Feel Mobile Floating Bottom Navigation Bar (Mobile Only: < md) */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 glass-panel rounded-2xl border border-white/90 shadow-[0_12px_36px_rgba(124,58,237,0.18)] p-1.5 flex items-center justify-around">
        {navLinks.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/90 text-purple-700 shadow-xs font-bold'
                  : 'text-[#8B87A3] hover:text-[#1E1B2E]'
              }`}
            >
              <div className={isActive ? 'text-purple-600 scale-110 transition-transform' : ''}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Floating Student AI Assistant Copilot */}
      <StudentAIAssistant />
    </div>
  );
};
