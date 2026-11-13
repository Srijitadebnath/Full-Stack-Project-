import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { User } from '../types';
import { Sidebar, Header } from '../components/layout';
import { OperationsAIAssistant } from '../components/OperationsAIAssistant';

interface AppLayoutProps {
  user: User | null;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans relative overflow-x-hidden selection:bg-purple-200 selection:text-purple-900">
      {/* Background Color Blobs (Prompt Specification: blur 80px, fixed behind everything) */}
      <div className="fixed top-[-5%] left-[-5%] w-[500px] h-[500px] bg-[#7C3AED]/25 rounded-full blur-[80px] pointer-events-none -z-20" />
      <div className="fixed top-[25%] right-[-5%] w-[550px] h-[550px] bg-[#FB923C]/25 rounded-full blur-[80px] pointer-events-none -z-20" />
      <div className="fixed bottom-[-5%] left-[20%] w-[500px] h-[500px] bg-[#F472B6]/20 rounded-full blur-[80px] pointer-events-none -z-20" />

      {/* Floating Sticky Topbar */}
      <div className="lg:pl-[284px] transition-all duration-200">
        <Header
          user={user}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>

      <div className="flex flex-1">
        {/* Floating Sidebar (260px) */}
        <Sidebar
          role={user?.role || 'team'}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-[284px] px-4 sm:px-6 py-4 transition-all duration-200 max-w-7xl">
          <Outlet />
        </main>
      </div>

      {/* Floating Operations AI Assistant (For Admin & OC Team) */}
      <OperationsAIAssistant user={user} />
    </div>
  );
};
