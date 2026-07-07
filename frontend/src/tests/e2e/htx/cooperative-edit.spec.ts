import { expect, test } from '@playwright/test';
import { baseUrls, htxAdminUser, seedAuthenticatedSession } from '../helpers/auth';

test.describe('htx cooperative edit', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Cooperative edit tests run on desktop chromium');
  });

  test('@htx cooperative admin can open edit form', async ({ page }) => {
    const { htxUrl } = baseUrls();

    await page.route('**/api/v1/cooperatives?*', async (route) => {
      await route.fulfill(jsonEnvelope({
        data: [
          {
            id: 'e2e-cooperative-id',
            code: 'HTX-E2E',
            name: 'HTX E2E',
            address: 'Can Tho',
            province: 'Can Tho',
            status: 'ACTIVE',
            subscriptions: [],
            _count: { users: 2, products: 3, zones: 1, passports: 1 },
            createdAt: '2026-07-01T00:00:00.000Z',
            updatedAt: '2026-07-01T00:00:00.000Z'
          }
        ],
        meta: { page: 1, limit: 100, total: 1 }
      }));
    });

    await page.route('**/api/v1/cooperatives/e2e-cooperative-id/stats', async (route) => {
      await route.fulfill(jsonEnvelope({ products: 3, zones: 1, logs: 4, passports: 1, members: 2, unpaidInvoices: 0, qrScanTotal: 10 }));
    });

    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(`${htxUrl}/dashboard/cooperatives`);
    await page.getByTestId('cooperative-edit-button').click();
    await expect(page.getByTestId('cooperative-save-button')).toBeVisible();
    await expect(page.getByTestId('cooperative-name-input')).toHaveValue('HTX E2E');
  });
});

function jsonEnvelope<T>(data: T) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
