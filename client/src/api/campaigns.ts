import { apiClient } from './client';
import { Campaign, CampaignUpdate, RecommendationResponse } from '../types';

export const campaignsApi = {
  getAll: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString();
    return apiClient<Campaign[]>(`/campaigns${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) => apiClient<Campaign>(`/campaigns/${id}`),

  getRecommendations: () => apiClient<RecommendationResponse>('/campaigns/recommendations'),

  create: (data: {
    title: string;
    shortDescription: string;
    description: string;
    categoryId: string;
    fundingGoal: number;
    deadline: string;
    coverImage?: string;
    isDraft?: boolean;
  }) =>
    apiClient<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Campaign>) =>
    apiClient<Campaign>(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  submit: (id: string) =>
    apiClient<Campaign>(`/campaigns/${id}/submit`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    apiClient<null>(`/campaigns/${id}`, {
      method: 'DELETE',
    }),

  postUpdate: (id: string, data: { title: string; content: string }) =>
    apiClient<CampaignUpdate>(`/campaigns/${id}/updates`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getInnovationAnalysis: (id: string) =>
    apiClient<import('../types').InnovationAnalysis>(`/campaigns/${id}/innovation-analysis`),

  analyzeDraft: (data: {
    title: string;
    shortDescription: string;
    description: string;
    fundingGoal: number;
    categoryName?: string;
  }) =>
    apiClient<import('../types').InnovationAnalysis>('/campaigns/analyze-draft', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
