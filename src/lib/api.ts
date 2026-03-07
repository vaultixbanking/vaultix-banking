const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

export async function api<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, isFormData = false } = options;

  const token = localStorage.getItem('vaultix_token');

  const config: RequestInit = {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    // If token expired, clear and redirect
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('vaultix_token');
      localStorage.removeItem('vaultix_user');
      window.location.href = '/login';
      throw new Error('Session expired. Please sign in again.');
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}

export function getToken(): string | null {
  return localStorage.getItem('vaultix_token');
}

export function getUser() {
  const raw = localStorage.getItem('vaultix_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem('vaultix_token');
  localStorage.removeItem('vaultix_user');
  localStorage.removeItem('vaultix_pin_verified');
  window.location.href = '/login';
}
