import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  CreditCard,
  RefreshCw,
  FileCheck,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { notificationsApi } from '../../api/notifications';
import { NotificationItem } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'REFUND_PROCESSED':
        return <RefreshCw className="w-5 h-5 text-softpink-600" />;
      case 'CONTRIBUTION_SUCCESS':
      case 'CONTRIBUTION_RECEIVED':
        return <CreditCard className="w-5 h-5 text-mint-600" />;
      case 'CAMPAIGN_APPROVED':
      case 'CAMPAIGN_SUCCESS':
        return <FileCheck className="w-5 h-5 text-ice-600" />;
      case 'CAMPAIGN_REJECTED':
      case 'CAMPAIGN_FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'CAMPAIGN_UPDATE':
        return <MessageSquare className="w-5 h-5 text-lavender-600" />;
      default:
        return <Bell className="w-5 h-5 text-ice-600" />;
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading notifications..." className="py-24" />;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cloud-900">Notifications</h2>
          <p className="text-xs text-cloud-800/70 mt-0.5">
            System notices, contribution confirmations, and automated refund notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ice-600 hover:text-ice-700 bg-ice-50 hover:bg-ice-100 rounded-xl transition"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications."
          description="You will receive alerts here for contributions, approvals, updates, and refunds."
        />
      ) : (
        <div className="bg-white border border-cloud-200 rounded-3xl shadow-soft overflow-hidden divide-y divide-cloud-100">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.isRead && handleMarkAsRead(item.id)}
              className={`p-5 flex items-start gap-4 transition cursor-pointer hover:bg-cloud-50/70 ${
                !item.isRead ? 'bg-ice-50/40' : 'bg-white'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-cloud-100 flex items-center justify-center shrink-0">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-cloud-900 truncate">{item.title}</h4>
                  <span className="text-[11px] text-cloud-800/60 shrink-0">
                    {new Date(item.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <p className="text-xs text-cloud-800/80 mt-1 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
