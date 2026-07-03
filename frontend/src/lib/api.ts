export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  errors?: { field?: string; message: string }[];
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function token() {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem('agri_access_token') || undefined;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  const accessToken = token();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store'
  });
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !body?.success) {
    const message = body?.errors?.[0]?.message || body?.message || 'Không thể xử lý yêu cầu';
    throw new Error(message);
  }
  return body;
}

export async function login(email: string, password: string) {
  const result = await apiFetch<{ accessToken: string; refreshToken: string; user: CurrentUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  window.localStorage.setItem('agri_access_token', result.data.accessToken);
  window.localStorage.setItem('agri_refresh_token', result.data.refreshToken);
  window.localStorage.setItem('agri_user', JSON.stringify(result.data.user));
  return result.data;
}

export function logout() {
  window.localStorage.removeItem('agri_access_token');
  window.localStorage.removeItem('agri_refresh_token');
  window.localStorage.removeItem('agri_user');
}

export function currentUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem('agri_user');
  return value ? (JSON.parse(value) as CurrentUser) : null;
}

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  cooperativeId: string | null;
  roles: string[];
  permissions: string[];
};
