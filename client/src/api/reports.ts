import { apiClient } from './client';
import { LandingMetrics, ReportOverviewData, UserDashboardStats } from '../types';

export const reportsApi = {
  getLandingMetrics: () => apiClient<LandingMetrics>('/reports/landing-metrics'),
  getUserDashboardStats: () => apiClient<UserDashboardStats>('/reports/dashboard-stats'),
  getOverview: () => apiClient<ReportOverviewData>('/reports/overview'),
  getCategory: () => apiClient<any[]>('/reports/category'),
  getTrends: () => apiClient<any>('/reports/trends'),
};
