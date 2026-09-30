import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { CampaignDetailsPage } from './pages/CampaignDetailsPage';
import { CreateCampaignPage } from './pages/CreateCampaignPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { DashboardLayout } from './pages/Dashboard/DashboardLayout';
import { DashboardOverviewPage } from './pages/Dashboard/DashboardOverviewPage';
import { MyContributionsPage } from './pages/Dashboard/MyContributionsPage';
import { MyCampaignsPage } from './pages/Dashboard/MyCampaignsPage';
import { NotificationsPage } from './pages/Dashboard/NotificationsPage';
import { ProfilePage } from './pages/Dashboard/ProfilePage';
import { AdminLayout } from './pages/Admin/AdminLayout';
import { AdminOverviewPage } from './pages/Admin/AdminOverviewPage';
import { AdminCampaignReviewPage } from './pages/Admin/AdminCampaignReviewPage';
import { AdminCampaignsPage } from './pages/Admin/AdminCampaignsPage';
import { AdminCategoriesPage } from './pages/Admin/AdminCategoriesPage';
import { AdminReportsPage } from './pages/Admin/AdminReportsPage';
import { AdminUsersPage } from './pages/Admin/AdminUsersPage';
import { AdminContributionsPage } from './pages/Admin/AdminContributionsPage';
import { AdminRefundsPage } from './pages/Admin/AdminRefundsPage';
import { useAuth } from './contexts/AuthContext';
import { LoadingState } from './components/LoadingState';

// Protected Route for Authenticated Users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Authenticating session..." className="py-32" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />

        <div className="flex-1">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Campaign Creation (Protected) */}
            <Route
              path="/campaigns/create"
              element={
                <ProtectedRoute>
                  <CreateCampaignPage />
                </ProtectedRoute>
              }
            />

            {/* User Dashboard Nested Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverviewPage />} />
              <Route path="contributions" element={<MyContributionsPage />} />
              <Route path="campaigns" element={<MyCampaignsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Console Nested Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="review" element={<AdminCampaignReviewPage />} />
              <Route path="campaigns" element={<AdminCampaignsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="contributions" element={<AdminContributionsPage />} />
              <Route path="refunds" element={<AdminRefundsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
};
