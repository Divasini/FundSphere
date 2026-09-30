import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  Bell,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationPanel } from './NotificationPanel';
import { notificationsApi } from '../api/notifications';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // Poll notifications count when user is logged in
  useEffect(() => {
    if (!user) return;
    const checkCount = async () => {
      try {
        const notifs = await notificationsApi.getAll();
        setUnreadCount(notifs.filter((n) => !n.isRead).length);
      } catch (e) {
        // silent
      }
    };
    checkCount();
    const interval = setInterval(checkCount, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cloud-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-ice-600 to-mint-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-cloud-900">
                Fund<span className="text-ice-600">Sphere</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-wider font-bold text-cloud-800/60 leading-none">
                Crowdfunding
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/discover"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                isActive('/discover')
                  ? 'bg-ice-50 text-ice-700'
                  : 'text-cloud-800 hover:text-cloud-900 hover:bg-cloud-100/70'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Campaigns
            </Link>

            <Link
              to="/campaigns/create"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                isActive('/campaigns/create')
                  ? 'bg-ice-50 text-ice-700'
                  : 'text-cloud-800 hover:text-cloud-900 hover:bg-cloud-100/70'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-mint-600" />
              Start a Campaign
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  location.pathname.startsWith('/dashboard')
                    ? 'bg-ice-50 text-ice-700'
                    : 'text-cloud-800 hover:text-cloud-900 hover:bg-cloud-100/70'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-lavender-50 text-lavender-700 font-bold'
                    : 'text-lavender-700 hover:bg-lavender-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Admin Portal
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2 text-cloud-700 hover:text-cloud-900 hover:bg-cloud-100 rounded-xl transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-softpink-500 animate-pulse" />
                    )}
                  </button>

                  <NotificationPanel
                    isOpen={isNotifOpen}
                    onClose={() => setIsNotifOpen(false)}
                    onCountUpdate={setUnreadCount}
                  />
                </div>

                {/* User Profile Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-cloud-200">
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center gap-2 hover:opacity-85 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-ice-100 border border-ice-200 text-ice-700 flex items-center justify-center font-bold text-xs overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <div className="text-left hidden lg:block">
                      <span className="text-xs font-bold text-cloud-900 block leading-tight">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-cloud-800/60 block leading-none">
                        {user.role}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-cloud-400 hover:text-softpink-600 hover:bg-softpink-50 rounded-lg transition ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-cloud-800 hover:text-cloud-900 hover:bg-cloud-100 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-ice-600 hover:bg-ice-700 rounded-xl shadow-sm transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 text-cloud-700 rounded-lg hover:bg-cloud-100"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-softpink-500" />
                  )}
                </button>
                <NotificationPanel
                  isOpen={isNotifOpen}
                  onClose={() => setIsNotifOpen(false)}
                  onCountUpdate={setUnreadCount}
                />
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-cloud-700 hover:bg-cloud-100 rounded-lg"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-cloud-200 bg-white p-4 space-y-2">
          <Link
            to="/discover"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-cloud-800 hover:bg-cloud-100"
          >
            <Compass className="w-4 h-4 text-ice-600" />
            Explore Campaigns
          </Link>
          <Link
            to="/campaigns/create"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-cloud-800 hover:bg-cloud-100"
          >
            <PlusCircle className="w-4 h-4 text-mint-600" />
            Start a Campaign
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-cloud-800 hover:bg-cloud-100"
            >
              <LayoutDashboard className="w-4 h-4 text-ice-600" />
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-lavender-700 hover:bg-lavender-50"
            >
              <ShieldAlert className="w-4 h-4 text-lavender-600" />
              Admin Portal
            </Link>
          )}

          <div className="pt-3 border-t border-cloud-100">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-1">
                  <UserIcon className="w-4 h-4 text-cloud-400" />
                  <span className="text-xs font-semibold text-cloud-900">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-softpink-600 hover:bg-softpink-50 rounded-xl transition font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-cloud-800 bg-cloud-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-white bg-ice-600 rounded-xl"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
