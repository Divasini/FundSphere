import { apiClient } from './client';
import { Category } from '../types';

export const categoriesApi = {
  getAll: (all = false) => apiClient<Category[]>(`/categories${all ? '?all=true' : ''}`),
  getById: (id: string) => apiClient<Category>(`/categories/${id}`),
  create: (data: { name: string; description?: string; icon?: string }) =>
    apiClient<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Category>) =>
    apiClient<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<null>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};
