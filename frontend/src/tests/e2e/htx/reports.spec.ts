import { expect, test } from '@playwright/test';
import { baseUrls, htxAdminUser, seedAuthenticatedSession } from '../helpers/auth';

test.describe('htx reports dashboard', () => {
  test.beforeEach(({}, testInfo) => {
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
    await page.goto(`${htxUrl}/dashboard/reports`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('main').locator('p.text-slate-500', { hasText: 'Sản phẩm' })).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('reports-range-7d').click();
    await page.getByTestId('reports-snapshot-button').click();
    await expect(page.getByText('Snapshot đã lưu')).toBeVisible();
  });

  test('@htx report exports download Excel and PDF files', async ({ page }) => {
    const { htxUrl } = baseUrls();

    await page.route('**/api/v1/reports/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.includes('/export/')) {
        await route.fulfill({ status: 200, contentType: 'application/octet-stream', body: 'report-e2e' });
        return;
      }
      if (path.endsWith('/overview')) {
        await route.fulfill(jsonEnvelope({ metrics: [{ key: 'products', label: 'Sản phẩm', value: 1 }], range: { from: null, to: null } }));
        return;
      }
      if (path.endsWith('/production')) {
        await route.fulfill(jsonEnvelope({ total: 0, byActivity: [], daily: [] }));
        return;
      }
      if (path.endsWith('/traceability')) {
        await route.fulfill(jsonEnvelope({ totalViews: 0, topPassports: [] }));
        return;
      }
      if (path.endsWith('/quality')) {
        await route.fulfill(jsonEnvelope({ total: 0, active: 0, expired: 0, passRate: 0 }));
        return;
      }
      await route.fulfill(jsonEnvelope([]));
    });

    await seedAuthenticatedSession(page, { ...htxAdminUser, permissions: [...htxAdminUser.permissions, 'reports.overview'] });
    await page.goto(`${htxUrl}/dashboard/reports`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toHaveText('Báo cáo');

    const excelDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Xuất Excel' }).click();
    await expect((await excelDownload).suggestedFilename()).toBe('bao-cao.xlsx');

    const pdfDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Xuất PDF' }).click();
    await expect((await pdfDownload).suggestedFilename()).toBe('bao-cao.pdf');
  });
});

function jsonEnvelope<T>(data: T) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
