import { authPortalFromHost, type AuthPortal } from './domain';

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  errors?: { field?: string; message: string }[];
};

// Prefer the same-origin proxy in browser builds so local previews do not emit
// noisy CORS failures when the API is unavailable or hosted on another port.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:3001/api/v1');

function token() {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem('agri_access_token') || undefined;
}

function refreshToken() {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem('agri_refresh_token') || undefined;
}

export function authRequestHeaders(init?: HeadersInit) {
  const headers = new Headers(init);
  const accessToken = token();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (typeof window !== 'undefined') headers.set('X-Client-Portal', authPortalFromHost(window.location.hostname));
  return headers;
}

async function requestApi<T>(path: string, init: RequestInit) {
  const headers = authRequestHeaders(init.headers);
  // Let the browser add the multipart boundary for FormData uploads. Setting
  // application/json here makes file uploads fail before they reach Nest.
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!isFormData) headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store'
  });
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  return { response, body };
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession() {
  if (typeof window === 'undefined') return false;
  if (refreshInFlight) return refreshInFlight;
  const storedRefreshToken = refreshToken();
  refreshInFlight = (async () => {
    const headers = authRequestHeaders({ 'Content-Type': 'application/json' });
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify(storedRefreshToken ? { refreshToken: storedRefreshToken } : {}),
      credentials: 'include',
      cache: 'no-store'
    });
    const body = (await response.json().catch(() => null)) as ApiEnvelope<{ accessToken: string; refreshToken: string; user: CurrentUser }> | null;
    if (!response.ok || !body?.success || !body.data?.accessToken) {
      logout();
      return false;
    }
    window.localStorage.setItem('agri_access_token', body.data.accessToken);
    if (body.data.refreshToken) window.localStorage.setItem('agri_refresh_token', body.data.refreshToken);
    if (body.data.user) window.localStorage.setItem('agri_user', JSON.stringify(body.data.user));
    return true;
  })().catch(() => {
    logout();
    return false;
  }).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  let result = await requestApi<T>(path, init);
  const canRefresh = typeof window !== 'undefined' && result.response.status === 401 && path !== '/auth/login' && path !== '/auth/refresh';
  if (canRefresh) {
    if (await refreshSession()) result = await requestApi<T>(path, init);
  }
  const { response, body } = result;
  if (!response.ok || !body?.success) {
    const message = body?.errors?.[0]?.message || body?.message || `Không thể xử lý yêu cầu (HTTP ${response.status}). Kiểm tra kết nối máy chủ rồi thử lại.`;
    throw new Error(message);
  }
  return body;
}

export async function login(email: string, password: string, portal?: AuthPortal) {
  const clientPortal = portal ?? authPortalFromHost(typeof window !== 'undefined' ? window.location.hostname : '');
  const result = await apiFetch<{ accessToken: string; refreshToken: string; user: CurrentUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, portal: clientPortal })
  });
  window.localStorage.setItem('agri_access_token', result.data.accessToken);
  window.localStorage.setItem('agri_refresh_token', result.data.refreshToken);
  window.localStorage.setItem('agri_user', JSON.stringify(result.data.user));
  return result.data;
}

export function logout() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('agri_access_token');
  window.localStorage.removeItem('agri_refresh_token');
  window.localStorage.removeItem('agri_user');
}

export function currentUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem('agri_user');
  if (!value) return null;
  try {
    return JSON.parse(value) as CurrentUser;
  } catch {
    logout();
    return null;
  }
}

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  cooperativeId: string | null;
  roles: string[];
  permissions: string[];
  portal?: AuthPortal;
};
