import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from '../types';
import { authService } from '../services/authService';

import { AppLayout } from './AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminEventsPage } from '../pages/admin/AdminEventsPage';
import { AdminEventDetailPage } from '../pages/admin/AdminEventDetailPage';
import { AdminRegistrationsPage } from '../pages/admin/AdminRegistrationsPage';
import { AdminTeamsPage } from '../pages/admin/AdminTeamsPage';
import { AdminVendorsPage } from '../pages/admin/AdminVendorsPage';
import { AdminTasksPage } from '../pages/admin/AdminTasksPage';
import { AdminBudgetPage } from '../pages/admin/AdminBudgetPage';
import { AdminSubmissionsPage } from '../pages/admin/AdminSubmissionsPage';
import { AdminChatPage } from '../pages/admin/AdminChatPage';
import { AdminAIPage } from '../pages/admin/AdminAIPage';
import { AdminCalendarPage } from '../pages/admin/AdminCalendarPage';

// Vendor / OC Pages
import { VendorDashboardPage } from '../pages/vendor/VendorDashboardPage';
import { VendorTasksPage } from '../pages/vendor/VendorTasksPage';
import { VendorAttendancePage } from '../pages/vendor/VendorAttendancePage';
import { VendorSubmissionsPage } from '../pages/vendor/VendorSubmissionsPage';
import { VendorContactsPage } from '../pages/vendor/VendorContactsPage';
import { VendorAIPage } from '../pages/vendor/VendorAIPage';
import { VendorProfilePage } from '../pages/vendor/VendorProfilePage';

// User / Participant Pages
import { UserHomePage } from '../pages/user/UserHomePage';
import { UserEventDetailPage } from '../pages/user/UserEventDetailPage';
import { UserRegisterPage } from '../pages/user/UserRegisterPage';
import { UserMyEventsPage } from '../pages/user/UserMyEventsPage';
import { UserCalendarPage } from '../pages/user/UserCalendarPage';

// Route Protection Component
const ProtectedRoute: React.FC<{
  user: User | null;
  allowedRoles: string[];
  children: React.ReactElement;
}> = ({ user, allowedRoles, children }) => {
  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user.role || '').toUpperCase();
  const isAllowed = allowedRoles.map((r) => r.toUpperCase()).includes(userRole);

  // If role is not authorized (e.g. Student trying to access Admin or OC portals), redirect to Student Home
  if (!isAllowed) {
    return <Navigate to="/user/home" replace />;
  }

  return children;
};

export const AppRouter: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loadUser = async () => {
    const u = await authService.getCurrentUser();
    setCurrentUser(u);
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<LoginPage onLoginSuccess={loadUser} />} />

        {/* Admin Console (Strictly Faculty Admin Only) */}
        <Route
          element={
            <ProtectedRoute user={currentUser} allowedRoles={['ADMIN']}>
              <AppLayout user={currentUser} />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/events/:eventId" element={<AdminEventDetailPage />} />
          <Route path="/admin/registrations" element={<AdminRegistrationsPage />} />
          <Route path="/admin/teams" element={<AdminTeamsPage />} />
          <Route path="/admin/vendors" element={<AdminVendorsPage />} />
          <Route path="/admin/tasks" element={<AdminTasksPage />} />
          <Route path="/admin/budget" element={<AdminBudgetPage />} />
          <Route path="/admin/submissions" element={<AdminSubmissionsPage />} />
          <Route path="/admin/chat" element={<AdminChatPage />} />
          <Route path="/admin/calendar" element={<AdminCalendarPage />} />
          <Route path="/admin/ai" element={<AdminAIPage />} />
        </Route>

        {/* Vendor / OC Team Portal (Strictly OC Team & Admin) */}
        <Route
          element={
            <ProtectedRoute user={currentUser} allowedRoles={['TEAM', 'ADMIN']}>
              <AppLayout user={currentUser} />
            </ProtectedRoute>
          }
        >
          <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
          <Route path="/vendor/events" element={<AdminEventsPage />} />
          <Route path="/vendor/tasks" element={<VendorTasksPage />} />
          <Route path="/vendor/attendance" element={<VendorAttendancePage />} />
          <Route path="/vendor/submissions" element={<VendorSubmissionsPage />} />
          <Route path="/vendor/chat" element={<AdminChatPage />} />
          <Route path="/vendor/team" element={<AdminTeamsPage />} />
          <Route path="/vendor/contacts" element={<VendorContactsPage />} />
          <Route path="/vendor/ai" element={<VendorAIPage />} />
          <Route path="/vendor/profile" element={<VendorProfilePage />} />
        </Route>

        {/* Student / Participant Routes (Open to Students & Campus Community) */}
        <Route path="/user/home" element={<UserHomePage />} />
        <Route path="/user/events" element={<UserHomePage />} />
        <Route path="/user/events/:eventId" element={<UserEventDetailPage />} />
        <Route path="/user/register/:eventId" element={<UserRegisterPage />} />
        <Route path="/user/my-events" element={<UserMyEventsPage />} />
        <Route path="/user/calendar" element={<UserCalendarPage />} />

        {/* Default Safe Fallback: Directs to Student Discovery Portal */}
        <Route path="/" element={<Navigate to="/user/home" replace />} />
        <Route path="*" element={<Navigate to="/user/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
