const BASE_URL = '/api';

export class ApiError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const getToken = (): string | null => {
  return localStorage.getItem('fundsphere_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('fundsphere_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('fundsphere_token');
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.message || 'An error occurred during request',
      response.status,
      data.errors
    );
  }

  return data.data;
}
