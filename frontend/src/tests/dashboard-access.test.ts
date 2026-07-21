import { describe, expect, it } from 'vitest';
import { dashboardAreaForRoles, isDashboardRouteAllowed } from '@/lib/dashboard-access';

describe('dashboard route policy', () => {
  it('treats Super Admin sessions as admin area locally', () => {
    expect(dashboardAreaForRoles(['SUPER_ADMIN'])).toBe('admin');
  });

  it('blocks Super Admin from HTX operation routes', () => {
    expect(isDashboardRouteAllowed('/dashboard/products', 'admin', ['SUPER_ADMIN'])).toBe(false);
    expect(isDashboardRouteAllowed('/dashboard/zones', 'admin', ['SUPER_ADMIN'])).toBe(false);
    expect(isDashboardRouteAllowed('/dashboard/farmers', 'admin', ['SUPER_ADMIN'])).toBe(false);
    expect(isDashboardRouteAllowed('/dashboard/farming-logs', 'admin', ['SUPER_ADMIN'])).toBe(false);
    expect(isDashboardRouteAllowed('/dashboard/passports', 'admin', ['SUPER_ADMIN'])).toBe(false);
  });

  it('blocks Admin HTX from system routes', () => {
    expect(isDashboardRouteAllowed('/dashboard/backups', 'htx', ['ADMIN_HTX'])).toBe(false);
    expect(isDashboardRouteAllowed('/dashboard/audit-logs', 'htx', ['ADMIN_HTX'])).toBe(false);
    expect(isDashboardRouteAllowed('/dashboard/roles', 'htx', ['ADMIN_HTX'])).toBe(false);
    expect(isDashboardRouteAllowed('/dashboard/settings', 'htx', ['ADMIN_HTX'])).toBe(false);
  });

  it('allows Admin HTX business routes', () => {
    expect(isDashboardRouteAllowed('/dashboard/products', 'htx', ['ADMIN_HTX'])).toBe(true);
    expect(isDashboardRouteAllowed('/dashboard/zones', 'htx', ['ADMIN_HTX'])).toBe(true);
    expect(isDashboardRouteAllowed('/dashboard/farmers', 'htx', ['ADMIN_HTX'])).toBe(true);
    expect(isDashboardRouteAllowed('/dashboard/farming-logs', 'htx', ['ADMIN_HTX'])).toBe(true);
    expect(isDashboardRouteAllowed('/dashboard/passports', 'htx', ['ADMIN_HTX'])).toBe(true);
    expect(isDashboardRouteAllowed('/dashboard/orders', 'htx', ['ADMIN_HTX'])).toBe(true);
    expect(isDashboardRouteAllowed('/dashboard/news', 'htx', ['ADMIN_HTX'])).toBe(true);
  });

  it('allows Super Admin to manage public news from admin area only', () => {
    expect(isDashboardRouteAllowed('/dashboard/news', 'admin', ['SUPER_ADMIN'])).toBe(true);
    expect(isDashboardRouteAllowed('/dashboard/news', 'htx', ['SUPER_ADMIN'])).toBe(false);
  });
});
