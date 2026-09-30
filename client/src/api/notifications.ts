import { apiClient } from './client';
import { NotificationItem } from '../types';

export const notificationsApi = {
  getAll: () => apiClient<NotificationItem[]>('/notifications'),
  markRead: (id: string) =>
    apiClient<null>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  markAllRead: () =>
    apiClient<null>('/notifications/read-all', {
      method: 'PATCH',
    }),
};
