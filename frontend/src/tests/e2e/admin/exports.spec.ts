import { expect, test } from '@playwright/test';
import { baseUrls, seedAuthenticatedSession, superAdminUser } from '../helpers/auth';

test.describe('admin file exports', () => {
  test('@admin orders export downloads a CSV with the current collection', async ({ page }) => {
    const { adminUrl } = baseUrls();
    await page.route('**/api/v1/orders?*', async (route) => {
      await route.fulfill(jsonEnvelope({
        data: [{
          id: 'order-export',
          cooperativeId: 'coop-1',
          orderCode: 'ORD-E2E',
          status: 'NEW',
          totalAmount: 125000,
          buyerName: 'Khách E2E',
          buyerPhone: '0912345678',
          address: 'Cao Lãnh, Đồng Tháp',
          items: [{ id: 'item-1', quantity: 2, unitPrice: 62500, status: 'NEW', product: { id: 'product-1', name: 'Gạo E2E', slug: 'gao-e2e', unit: 'kg', cooperative: { id: 'coop-1', name: 'HTX E2E', code: 'HTX-E2E' } } }],
          createdAt: '2026-09-01T00:00:00.000Z',
          updatedAt: '2026-09-01T00:00:00.000Z'
        }],
        meta: { page: 1, limit: 80, total: 1 }
      }));
    });
    await page.route('**/api/v1/cooperatives?*', async (route) => {
      await route.fulfill(jsonEnvelope({ data: [], meta: { total: 0 } }));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/orders`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('order-card')).toBeVisible({ timeout: 45_000 });
    const download = page.waitForEvent('download');
    await page.getByTestId('orders-export-button').click();
    expect((await download).suggestedFilename()).toMatch(/^don-cod-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  test('@admin invoice PDF export downloads the invoice file', async ({ page }) => {
    const { adminUrl } = baseUrls();
    await page.route('**/api/v1/invoices?*', async (route) => {
      await route.fulfill(jsonEnvelope({
        data: [{ id: 'invoice-export', cooperativeId: 'coop-1', invoiceCode: 'INV-E2E', amount: 125000, currency: 'VND', status: 'UNPAID', dueDate: '2026-09-30T00:00:00.000Z', cooperative: { id: 'coop-1', name: 'HTX E2E', code: 'HTX-E2E', status: 'ACTIVE' }, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' }],
        meta: { page: 1, limit: 80, total: 1 }
      }));
    });
    await page.route('**/api/v1/cooperatives?*', async (route) => {
      await route.fulfill(jsonEnvelope({ data: [], meta: { total: 0 } }));
    });
    await page.route('**/api/v1/invoices/invoice-export/pdf', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/pdf', body: 'pdf-e2e' });
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/invoices`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('INV-E2E')).toBeVisible({ timeout: 45_000 });
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'PDF' }).click();
    await expect((await download).suggestedFilename()).toBe('INV-E2E.pdf');
  });
});

function jsonEnvelope(data: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
