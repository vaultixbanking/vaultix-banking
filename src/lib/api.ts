export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * fetch() that gives up after `timeoutMs` with a readable error, so the UI
 * never spins forever when the network or server stalls.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    throw new Error(
      controller.signal.aborted
        ? 'The server is taking too long to respond. Please check your connection and try again.'
        : 'Unable to reach Vaultix. Please check your internet connection and try again.'
    );
  } finally {
    clearTimeout(timer);
  }
}

let wakeInFlight: Promise<boolean> | null = null;

/**
 * The API host sleeps when idle and needs up to a minute to boot. Requests that
 * arrive mid-boot (especially file uploads) can hang until the server kills them,
 * so ping /health until it answers before sending anything important.
 */
export function wakeServer(maxWaitMs = 90000): Promise<boolean> {
  if (!wakeInFlight) {
    wakeInFlight = (async () => {
      const deadline = Date.now() + maxWaitMs;
      while (Date.now() < deadline) {
        try {
          const res = await fetchWithTimeout(`${API_URL}/health`, {}, 30000);
          if (res.ok) return true;
        } catch {
          // still booting — retry
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      return false;
    })().finally(() => {
      wakeInFlight = null;
    });
  }
  return wakeInFlight;
}

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
