import { apiClient } from './client';
import { Contribution } from '../types';

export const contributionsApi = {
  create: (data: { campaignId: string; amount: number; simulateFailure?: boolean }) =>
    apiClient<{ contribution: Contribution; campaign: any }>('/contributions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMy: () => apiClient<Contribution[]>('/contributions/my'),

  getByCampaign: (campaignId: string) =>
    apiClient<Contribution[]>(`/contributions/campaign/${campaignId}`),
};
