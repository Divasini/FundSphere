import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import {
  ShieldAlert,
  BarChart3,
  FileCheck2,
  Layers,
  Users,
  CreditCard,
  RefreshCw,
  Tags,
  PieChart,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from '../../components/LoadingState';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Checking administrator privileges..." className="py-32" />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const adminNav = [
    { label: 'Overview', to: '/admin', icon: BarChart3, end: true },
    { label: 'Campaign Review', to: '/admin/review', icon: FileCheck2 },
    { label: 'All Campaigns', to: '/admin/campaigns', icon: Layers },
    { label: 'Categories', to: '/admin/categories', icon: Tags },
    { label: 'Platform Reports', to: '/admin/reports', icon: PieChart },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Contributions Audit', to: '/admin/contributions', icon: CreditCard },
    { label: 'Refunds Audit', to: '/admin/refunds', icon: RefreshCw },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="mb-6 p-4 bg-lavender-50 border border-lavender-200 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-lavender-600 text-white flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-cloud-900">Administrator Console</h1>
            <p className="text-[11px] text-cloud-800/70">
              Live governance, campaign approvals, category control, and financial audits.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-lavender-700 bg-white px-3 py-1 rounded-full border border-lavender-200">
          Superuser Access
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1">
          <nav className="bg-white border border-cloud-200 rounded-3xl p-3 shadow-soft space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-lavender-100 text-lavender-800 font-bold shadow-xs'
                        : 'text-cloud-800 hover:text-cloud-900 hover:bg-cloud-100/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Content Outlet */}
        <main className="md:col-span-3 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
