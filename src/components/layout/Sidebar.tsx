import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  CheckSquare,
  DollarSign,
  FileCheck,
  MessageSquare,
  Sparkles,
  UserCheck,
  Phone,
  User,
  CalendarDays,
  X,
  Building2,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose }) => {
  const location = useLocation();

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Events', path: '/admin/events', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Registrations', path: '/admin/registrations', icon: <Users className="w-4 h-4" /> },
    { label: 'OC Teams', path: '/admin/teams', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'OC Departments', path: '/admin/vendors', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Tasks', path: '/admin/tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { label: 'Budget', path: '/admin/budget', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Submissions', path: '/admin/submissions', icon: <FileCheck className="w-4 h-4" /> },
    { label: 'Chat', path: '/admin/chat', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Calendar', path: '/admin/calendar', icon: <CalendarDays className="w-4 h-4" /> },
    {
      label: 'EVENTRA AI',
      path: '/admin/ai',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      isAI: true,
    },
  ];

  const teamNav = [
    { label: 'Dashboard', path: '/vendor/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Events', path: '/vendor/events', icon: <Calendar className="w-4 h-4" /> },
    { label: 'My Assigned Work', path: '/vendor/tasks', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Venue Attendance', path: '/vendor/attendance', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Submit Work Update', path: '/vendor/submissions', icon: <FileCheck className="w-4 h-4" /> },
    { label: 'Team Chat', path: '/vendor/chat', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'OC Team List', path: '/vendor/team', icon: <Users className="w-4 h-4" /> },
    { label: 'Contacts', path: '/vendor/contacts', icon: <Phone className="w-4 h-4" /> },
    {
      label: 'EVENTRA AI',
      path: '/vendor/ai',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      isAI: true,
    },
    { label: 'Profile', path: '/vendor/profile', icon: <User className="w-4 h-4" /> },
  ];

  const navItems = role === 'admin' ? adminNav : teamNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Floating Glass Sidebar (260px) */}
      <aside
        className={`fixed top-4 left-4 bottom-4 w-[260px] glass-panel rounded-3xl border border-white/80 z-50 transition-transform duration-200 ease-in-out flex flex-col shadow-[0_12px_40px_rgba(124,58,237,0.08)] overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-purple-500/10 bg-white/40">
          <div className="flex items-center gap-3">
            <img
              src="/eventra-logo.png"
              alt="EVENTRA"
              className="h-11 w-auto object-contain drop-shadow-xs"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                {role === 'admin' ? 'Faculty Console' : 'OC Operations'}
              </span>
              <span className="text-[11px] text-[#8B87A3] font-medium leading-none mt-0.5">
                UPES Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1.5 custom-scrollbar">
          <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#8B87A3]">
            {role === 'admin' ? 'ORGANIZER CONSOLE' : 'OC TEAM CONSOLE'}
          </div>

          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`relative flex items-center justify-between px-3.5 h-12 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white/95 text-purple-700 neo-raised border border-white/90 shadow-[0_4px_20px_rgba(124,58,237,0.12)]'
                    : 'text-[#4B4763] hover:text-[#1E1B2E] hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Purple dot accent for active link */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shadow-sm shadow-purple-600 shrink-0" />
                  )}
                  <span className={isActive ? 'text-purple-600' : 'text-[#8B87A3]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {/* AI Sparkle Badge */}
                {item.isAI && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-xs">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-purple-500/10 bg-white/40">
          <div className="glass-panel px-3 py-2 rounded-2xl flex items-center justify-between text-[11px] text-[#4B4763] font-medium border border-white/80">
            <span>UPES Operations</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              v1.0 Live
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
