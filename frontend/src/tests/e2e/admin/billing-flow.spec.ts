import { expect, test } from '@playwright/test';
import { baseUrls, superAdminUser, seedAuthenticatedSession } from '../helpers/auth';

test.describe('admin billing flow', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Billing flow tests run on desktop chromium');
  });

  test('@rbac billing pages render for super admin', async ({ page }) => {
    const { adminUrl } = baseUrls();

    await page.route('**/api/v1/subscription-plans?*', async (route) => {
      await route.fulfill(jsonEnvelope({ data: [{ id: 'plan-1', name: 'Basic', slug: 'basic', priceMonthly: 100000, priceYearly: 1000000, isActive: true }], meta: { page: 1, limit: 80, total: 1 } }));
    });
    await page.route('**/api/v1/invoices?*', async (route) => {
      await route.fulfill(jsonEnvelope({ data: [{ id: 'inv-1', invoiceCode: 'INV-001', amount: 1000000, status: 'PAID', dueDate: '2026-07-10T00:00:00.000Z', cooperative: { name: 'HTX E2E' } }], meta: { page: 1, limit: 80, total: 1 } }));
    });
    await page.route('**/api/v1/reports/revenue?*', async (route) => {
      await route.fulfill(jsonEnvelope({ total: 1000000, invoices: [] }));
    });
    await page.route('**/api/v1/reports/overview?*', async (route) => {
      await route.fulfill(jsonEnvelope({ metrics: [{ key: 'cooperatives', label: 'HTX', value: 2 }], range: { from: null, to: null } }));
    });
    await page.route('**/api/v1/reports/production?*', async (route) => {
      await route.fulfill(jsonEnvelope({ total: 0, byActivity: [], daily: [] }));
    });
    await page.route('**/api/v1/reports/traceability?*', async (route) => {
      await route.fulfill(jsonEnvelope({ totalViews: 0, topPassports: [] }));
    });
    await page.route('**/api/v1/reports/quality?*', async (route) => {
      await route.fulfill(jsonEnvelope({ total: 0, active: 0, expired: 0, passRate: 0 }));
    });
    await page.route('**/api/v1/reports/snapshots', async (route) => {
      await route.fulfill(jsonEnvelope([]));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/subscription-plans`);
    await expect(page.getByTestId('page-title')).toContainText('Gói dịch vụ SaaS');
    await page.goto(`${adminUrl}/dashboard/invoices`);
    await expect(page.getByTestId('page-title')).toContainText('Hóa đơn');
    await page.goto(`${adminUrl}/dashboard/reports`);
    await expect(page.getByTestId('page-title')).toContainText('Báo cáo');
  });
});

function jsonEnvelope<T>(data: T) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
