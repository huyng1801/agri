import type { Page } from '@playwright/test';

type E2EUser = {
  id: string;
  email: string;
  fullName: string;
  cooperativeId: string | null;
  roles: string[];
  permissions: string[];
};

export const superAdminUser: E2EUser = {
  id: 'e2e-super-admin',
  email: process.env.E2E_SUPER_ADMIN_EMAIL || 'super-admin-e2e@example.com',
  fullName: 'Super Admin E2E',
  cooperativeId: null,
  roles: ['SUPER_ADMIN'],
  permissions: ['*']
};

export const htxAdminUser: E2EUser = {
  id: 'e2e-htx-admin',
  email: process.env.E2E_HTX_ADMIN_EMAIL || 'rbac-admin-1783134144@example.com',
  fullName: 'Admin HTX E2E',
  cooperativeId: 'e2e-cooperative-id',
  roles: ['ADMIN_HTX'],
  permissions: ['products.*', 'certifications.*', 'zones.*', 'farming_logs.*', 'passports.*', 'orders.*', 'reports.overview', 'reports.snapshots', 'cooperatives.read', 'cooperatives.update', 'subscription_plans.read', 'subscriptions.read']
};

export async function seedAuthenticatedSession(page: Page, user: E2EUser) {
  await page.addInitScript((currentUser) => {
    window.localStorage.setItem('agri_access_token', 'e2e-access-token');
    window.localStorage.setItem('agri_refresh_token', 'e2e-refresh-token');
    window.localStorage.setItem('agri_user', JSON.stringify(currentUser));
  }, user);
}

export function baseUrls() {
  const publicUrl = process.env.PUBLIC_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
  return {
    publicUrl,
    adminUrl: process.env.ADMIN_BASE_URL || publicUrl,
    htxUrl: process.env.HTX_BASE_URL || publicUrl,
    apiUrl: process.env.API_BASE_URL || 'http://127.0.0.1:3001/api/v1'
  };
}

export function isExternalUrl(url: string) {
  return !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(url);
}
