import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  CalendarDays,
  User as UserIcon,
  Shield,
  UserCheck,
  LogOut,
} from 'lucide-react';
import { User } from '../../types';
import { authService } from '../../services/authService';
import { StudentAIAssistant } from '../StudentAIAssistant';

interface UserLayoutProps {
  user?: User | null;
  onAuthChange?: () => void;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ user: propUser, onAuthChange }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(propUser ?? null);

  useEffect(() => {
    setCurrentUser(propUser ?? null);
  }, [propUser]);

  useEffect(() => {
    authService.getCurrentUser().then(setCurrentUser);
  }, []);

  const handleSignOut = () => {
    authService.logout();
    setCurrentUser(null);
    onAuthChange?.();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/user/home', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { label: 'My Passes', path: '/user/my-events', icon: <Ticket className="w-3.5 h-3.5" /> },
    { label: 'Calendar', path: '/user/calendar', icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { label: 'Profile', path: '/user/profile', icon: <UserIcon className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col font-sans">
      {/* Unified Student Portal Top Navigation */}
      <nav className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-6">
          {/* Brand */}
          <button
            type="button"
            onClick={() => navigate('/user/home')}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-purple-600/20">
              E
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight block leading-none">
                EVENTRA
              </span>
              <span className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider block mt-0.5">
                Student Portal
              </span>
            </div>
          </button>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
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
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-all cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Console →</span>
                </button>
              )}
              {currentUser.role === 'team' && (
                <button
                  type="button"
                  onClick={() => navigate('/vendor/dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-all cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>OC Work Desk →</span>
                </button>
              )}

              {/* Clickable Profile Chip */}
              <button
                type="button"
                onClick={() => navigate('/user/profile')}
                title="View Student Profile"
                className="px-3 py-1.5 bg-slate-50 hover:bg-purple-50 border border-slate-200/80 hover:border-purple-200 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-slate-900 block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-purple-600 font-medium capitalize block">
                    {currentUser.role === 'user' ? 'Student Profile' : currentUser.role}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all cursor-pointer shadow-md shadow-purple-600/20"
            >
              Portal Sign In →
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Bottom-Top Tab Bar */}
      <div className="md:hidden bg-white border-b border-slate-100 px-3 py-2 flex items-center justify-around gap-1">
        {navLinks.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                isActive ? 'bg-purple-50 text-purple-700' : 'text-slate-600'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Floating Bottom-Right Messenger-Logo Student AI Assistant */}
      <StudentAIAssistant currentUser={currentUser} />
    </div>
  );
};
