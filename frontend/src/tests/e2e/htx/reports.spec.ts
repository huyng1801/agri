import { expect, test } from '@playwright/test';
import { baseUrls, htxAdminUser, seedAuthenticatedSession } from '../helpers/auth';

test.describe('htx reports dashboard', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Reports tests run on desktop chromium');
  });

  test('@htx reports filters and snapshot button', async ({ page }) => {
    const { htxUrl } = baseUrls();

    await page.route('**/api/v1/reports/overview?*', async (route) => {
      await route.fulfill(jsonEnvelope({
        metrics: [
          { key: 'products', label: 'Sản phẩm', value: 3 },
          { key: 'logs', label: 'Nhật ký canh tác', value: 8 }
        ],
        range: { from: null, to: null }
      }));
    });
    await page.route('**/api/v1/reports/snapshots', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill(jsonEnvelope([]));
        return;
      }
      await route.continue();
    });
    await page.route('**/api/v1/reports/snapshots/overview?*', async (route) => {
      await route.fulfill(jsonEnvelope({ id: 'snap-1', type: 'overview', createdAt: '2026-07-07T00:00:00.000Z' }));
    });

    await seedAuthenticatedSession(page, { ...htxAdminUser, permissions: [...htxAdminUser.permissions, 'reports.overview', 'reports.snapshots'] });
    await page.goto(`${htxUrl}/dashboard/reports`);
    await expect(page.getByRole('main').locator('p.text-slate-500', { hasText: 'Sản phẩm' })).toBeVisible();
    await page.getByTestId('reports-range-7d').click();
    await page.getByTestId('reports-snapshot-button').click();
    await expect(page.getByText('Snapshot đã lưu')).toBeVisible();
  });
});

function jsonEnvelope<T>(data: T) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
