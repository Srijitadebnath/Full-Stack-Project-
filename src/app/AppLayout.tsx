import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { User } from '../types';
import { Sidebar, Header } from '../components/layout';

interface AppLayoutProps {
  user: User | null;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col">
      <Header
        user={user}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      <div className="flex flex-1">
        <Sidebar
          role={user?.role || 'team'}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 lg:pl-64 transition-all">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
