import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import TierList from './pages/admin/TierList';
import PackageList from './pages/admin/PackageList';
import AdminSettings from './pages/admin/AdminSettings';
import MembershipManagement from './pages/membership/MembershipManagement';
import Partners from './pages/partners/Partners';
import EventCycles from './pages/events/EventCycles';
import EventContent from './pages/events/EventContent';
import ContentManagement from './pages/content/ContentManagement';
import AppLayout from './components/layout/AppLayout';

const AppRouter: React.FC = () => {
  // Use Redux selector to get auth state
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  const ProtectedRoute = () => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return <Outlet />;
  };

  const AuthRoute = () => {
    if (isLoggedIn) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
  };

  return (
    <Routes>
      {/* Auth Routes without Layout */}
      <Route element={<AuthRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Routes with Layout */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <AppLayout>
              <Outlet />
            </AppLayout>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminSettings />} />
          <Route path="/admin/tiers" element={<TierList />} />
          <Route path="/admin/packages" element={<PackageList />} />
          <Route path="/members" element={<MembershipManagement />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/events/cycles" element={<EventCycles />} />
          <Route path="/events/content" element={<EventContent />} />
          <Route path="/content" element={<ContentManagement />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
