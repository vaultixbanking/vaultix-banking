const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Admin-specific API utility — uses vaultix_admin_token
 */
export async function adminApi<T = unknown>(
  endpoint: string,
  options: {
    method?: string;
    body?: Record<string, unknown> | FormData;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const token = localStorage.getItem('vaultix_admin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isFormData = body instanceof FormData;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: isFormData ? headers : { 'Content-Type': 'application/json', ...headers },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('vaultix_admin_token');
      localStorage.removeItem('vaultix_admin');
      window.location.href = '/admin';
    }
    throw new Error(data.message || 'Request failed');
  }

  return data as T;
}

export const getAdminToken = () => localStorage.getItem('vaultix_admin_token');
export const getAdmin = () => {
  const str = localStorage.getItem('vaultix_admin');
  return str ? JSON.parse(str) : null;
};
export const isAdminAuthenticated = () => !!getAdminToken();
export const adminLogout = () => {
  localStorage.removeItem('vaultix_admin_token');
  localStorage.removeItem('vaultix_admin');
};
