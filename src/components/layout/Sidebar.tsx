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
    { label: 'AI Assistant', path: '/admin/ai', icon: <Sparkles className="w-4 h-4 text-purple-600" /> },
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
    { label: 'AI Assistant', path: '/vendor/ai', icon: <Sparkles className="w-4 h-4 text-purple-600" /> },
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

      {/* Sidebar surface */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-100 z-50 transition-transform duration-200 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              E
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight leading-none">
                Campus Events
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">Operations Portal</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {role === 'admin' ? 'Organizer Console' : 'OC Team Console'}
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-purple-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>UPES Operations</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px]">
              v1.0 Live
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
