import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, LogOut } from 'lucide-react';
import { User } from '../../types';
import { Avatar } from '../ui';

interface HeaderProps {
  user: User | null;
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
    return 'Smart Campus Portal';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 leading-tight">
            {getPageTitle()}
          </h1>
          <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
            Smart College Event Management System
          </p>
        </div>
      </div>

      {/* Right User Profile & Secure Logout */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon */}
        <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100">
          <Avatar name={user?.name || 'User'} src={user?.avatar} size="md" status="online" />
          <div className="hidden md:block text-left">
            <h4 className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</h4>
            <span className="text-[10px] text-slate-400 font-medium capitalize">
              {user?.role === 'team' ? 'OC Member' : user?.role === 'admin' ? 'Faculty Admin' : 'Student'}
            </span>
          </div>

          <button
            onClick={() => navigate('/login')}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
