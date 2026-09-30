import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  CreditCard,
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileCheck,
  XCircle,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { NotificationItem } from '../types';
import { notificationsApi } from '../api/notifications';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCountUpdate?: (count: number) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  onCountUpdate,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationsApi.getAll();
      setNotifications(data);
      const unreadCount = data.filter((n) => !n.isRead).length;
      if (onCountUpdate) onCountUpdate(unreadCount);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (onCountUpdate) {
        onCountUpdate(
          notifications.filter((n) => !n.isRead && n.id !== id).length
        );
      }
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onCountUpdate) onCountUpdate(0);
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'REFUND_PROCESSED':
        return <RefreshCw className="w-4 h-4 text-softpink-600" />;
      case 'CONTRIBUTION_SUCCESS':
      case 'CONTRIBUTION_RECEIVED':
        return <CreditCard className="w-4 h-4 text-mint-600" />;
      case 'CAMPAIGN_APPROVED':
      case 'CAMPAIGN_SUCCESS':
        return <FileCheck className="w-4 h-4 text-ice-600" />;
      case 'CAMPAIGN_REJECTED':
      case 'CAMPAIGN_FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'CAMPAIGN_UPDATE':
        return <MessageSquare className="w-4 h-4 text-lavender-600" />;
      default:
        return <Bell className="w-4 h-4 text-ice-600" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-cloud-200 rounded-3xl shadow-soft-lg z-50 overflow-hidden animate-fadeIn">
      {/* Panel Header */}
      <div className="p-4 border-b border-cloud-100 flex items-center justify-between bg-cloud-50/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-ice-600" />
          <h4 className="text-xs font-bold text-cloud-900 uppercase tracking-wide">
            Notifications
          </h4>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-ice-500 text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-[11px] font-semibold text-ice-600 hover:text-ice-700"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto divide-y divide-cloud-100">
        {isLoading ? (
          <div className="p-6 text-center text-xs text-cloud-800/70">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-cloud-800/60 flex flex-col items-center">
            <Bell className="w-6 h-6 text-cloud-300 mb-2" />
            <p className="font-semibold text-cloud-900">No notifications</p>
            <p className="text-[11px] mt-0.5">You're all caught up with your campaigns and contributions.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.isRead && handleMarkAsRead(item.id)}
              className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-cloud-50/80 ${
                !item.isRead ? 'bg-ice-50/40' : 'bg-white'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-cloud-100 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h5 className="text-xs font-bold text-cloud-900 truncate">
                    {item.title}
                  </h5>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-ice-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-cloud-800/80 mt-0.5 leading-relaxed line-clamp-3">
                  {item.message}
                </p>
                <span className="text-[10px] text-cloud-800/50 mt-1 block">
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
