import { expect, test } from '@playwright/test';
import { baseUrls, seedAuthenticatedSession, superAdminUser } from '../helpers/auth';

test.describe('admin cooperative billing', () => {
  test('@admin @form subscription assignment and admin assignment can be restored', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ path: string; body?: Record<string, unknown> }> = [];
    const cooperative = {
      id: 'coop-billing-e2e',
      code: 'HTX-BILLING',
      name: 'HTX Billing E2E',
      status: 'ACTIVE',
      province: 'Đồng Tháp',
      address: 'Cao Lãnh, Đồng Tháp',
      subscriptions: [{ id: 'subscription-e2e', status: 'ACTIVE', startDate: '2026-09-01T00:00:00.000Z', endDate: '2026-12-31T00:00:00.000Z', plan: { id: 'plan-e2e', name: 'Gói cũ', priceMonthly: 100000, priceYearly: 1000000 } }]
    };

    await page.route('**/api/v1/cooperatives**', async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (request.method() === 'GET') {
        if (path.endsWith('/stats')) {
          await route.fulfill(jsonEnvelope({ members: 4, products: 2, zones: 1, logs: 5, passports: 2, qrScanTotal: 8, currentPlan: 'Gói cũ', subscriptionStatus: 'ACTIVE', subscriptionEndDate: '2026-12-31T00:00:00.000Z', unpaidInvoices: 0 }));
          return;
        }
        await route.fulfill(jsonEnvelope({ data: [cooperative], meta: { page: 1, limit: 100, total: 1 } }));
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown> | undefined;
      mutations.push({ path, body });
      await route.fulfill(jsonEnvelope({ ...cooperative, ...body }));
    });
    await page.route('**/api/v1/subscription-plans?*', async (route) => {
      await route.fulfill(jsonEnvelope({ data: [{ id: 'plan-new', name: 'Gói mới', priceMonthly: 250000, priceYearly: 2500000, isActive: true }], meta: { total: 1 } }));
    });
    await page.route('**/api/v1/users?role=ADMIN_HTX*', async (route) => {
      await route.fulfill(jsonEnvelope({ data: [{ id: 'admin-e2e', fullName: 'Admin HTX E2E', email: 'admin-htx-e2e@example.com' }], meta: { total: 1 } }));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/cooperatives`, { waitUntil: 'domcontentloaded' });
    const card = page.locator('article').filter({ hasText: 'HTX Billing E2E' });
    await expect(card).toBeVisible({ timeout: 45_000 });
    await card.getByRole('button', { name: 'Gói/HĐ' }).click();
    await page.getByTestId('subscription-plan-select').selectOption('plan-new');
    await page.getByRole('button', { name: 'Gán/gia hạn gói' }).click();
    await expect.poll(() => mutations.filter((item) => item.path.endsWith('/subscription')).length).toBe(1);
    await page.locator('select').filter({ has: page.locator('option', { hasText: 'Admin HTX E2E' }) }).selectOption('admin-e2e');
    await page.getByRole('button', { name: 'Gán Admin' }).click();
    await expect.poll(() => mutations.filter((item) => item.path.endsWith('/assign-admin')).length).toBe(1);
    await page.getByRole('button', { name: 'Hủy gói' }).click();
    await expect.poll(() => mutations.filter((item) => item.path.endsWith('/subscription/cancel')).length).toBe(1);
    expect(mutations.map((item) => item.path.split('/').at(-1))).toEqual(['subscription', 'assign-admin', 'cancel']);
    expect(mutations[0].body).toMatchObject({ planId: 'plan-new', status: 'ACTIVE' });
    expect(mutations[1].body).toEqual({ userId: 'admin-e2e' });
  });
});

function jsonEnvelope(data: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
