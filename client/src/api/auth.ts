import { apiClient } from './client';
import { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; confirmPassword: string; adminSecretCode?: string }) =>
    apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => apiClient<User>('/auth/me'),

  updateProfile: (data: { name?: string; bio?: string; avatar?: string }) =>
    apiClient<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
