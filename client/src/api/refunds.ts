import { apiClient } from './client';
import { Refund } from '../types';

export const refundsApi = {
  getMy: () => apiClient<Refund[]>('/refunds/my'),
};
