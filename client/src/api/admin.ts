import { apiClient } from './client';
import { AdminStats, Campaign, Contribution, Refund, User } from '../types';

export const adminApi = {
  getStats: () => apiClient<AdminStats>('/admin/stats'),
  getPendingCampaigns: () => apiClient<Campaign[]>('/admin/campaigns/pending'),
  approveCampaign: (id: string) =>
    apiClient<Campaign>(`/admin/campaigns/${id}/approve`, {
      method: 'PATCH',
    }),
  rejectCampaign: (id: string, reason: string) =>
    apiClient<Campaign>(`/admin/campaigns/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  getUsers: () => apiClient<User[]>('/admin/users'),
  updateUserRole: (id: string, role: 'USER' | 'ADMIN') =>
    apiClient<User>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  getContributions: () => apiClient<Contribution[]>('/admin/contributions'),
  getRefunds: () => apiClient<Refund[]>('/admin/refunds'),
  triggerDeadlineCheck: () =>
    apiClient<{ processed: number }>('/admin/deadline-check', {
      method: 'POST',
    }),
};
