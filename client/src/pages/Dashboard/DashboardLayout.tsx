import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  CreditCard,
  Layers,
  PlusCircle,
  Bell,
  User,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Discover', to: '/discover', icon: Compass },
    { label: 'My Contributions', to: '/dashboard/contributions', icon: CreditCard },
    { label: 'My Campaigns', to: '/dashboard/campaigns', icon: Layers },
    { label: 'Create Campaign', to: '/campaigns/create', icon: PlusCircle },
    { label: 'Notifications', to: '/dashboard/notifications', icon: Bell },
    { label: 'Profile', to: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1 space-y-6">
          <div className="p-5 bg-white border border-cloud-200 rounded-3xl shadow-soft space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-ice-100 border border-ice-200 text-ice-700 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-cloud-900 truncate">{user?.name}</h3>
                <span className="text-[11px] text-cloud-800/60 block truncate">{user?.email}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-cloud-100 flex items-center justify-between text-[11px] font-semibold">
              <span className="text-cloud-800/60">Account Role</span>
              <span className="px-2 py-0.5 rounded-full bg-ice-50 text-ice-700 border border-ice-100 font-bold">
                {user?.role}
              </span>
            </div>
          </div>

          <nav className="bg-white border border-cloud-200 rounded-3xl p-3 shadow-soft space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-ice-50 text-ice-700 font-bold shadow-xs'
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
