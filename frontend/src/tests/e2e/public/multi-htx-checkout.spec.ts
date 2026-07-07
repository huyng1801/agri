import { expect, test } from '@playwright/test';
import { baseUrls } from '../helpers/auth';

test.describe('public multi htx checkout', () => {
  test('@public @smoke checkout success handles grouped orders', async ({ page }) => {
    const { publicUrl } = baseUrls();

    await page.route('**/api/v1/orders/public', async (route) => {
      await route.fulfill(jsonEnvelope({
        groupCode: 'ORD-GRP-E2E01',
        orders: [
          { id: 'o1', orderCode: 'ORD-A', status: 'NEW', totalAmount: 100000, cooperative: { name: 'HTX A' }, items: [] },
          { id: 'o2', orderCode: 'ORD-B', status: 'NEW', totalAmount: 50000, cooperative: { name: 'HTX B' }, items: [] }
        ]
      }));
    });

    await page.addInitScript(() => {
      window.localStorage.setItem(
        'htxonline_last_order',
        JSON.stringify({
          groupCode: 'ORD-GRP-E2E01',
          orders: [
            { orderCode: 'ORD-A', status: 'NEW', totalAmount: 100000, cooperative: { name: 'HTX A' }, buyerName: 'Khách', buyerPhone: '0912345678', address: '123', province: 'HCM' },
            { orderCode: 'ORD-B', status: 'NEW', totalAmount: 50000, cooperative: { name: 'HTX B' }, buyerName: 'Khách', buyerPhone: '0912345678', address: '123', province: 'HCM' }
          ]
        })
      );
    });

    await page.goto(`${publicUrl}/dat-hang-thanh-cong?groupCode=ORD-GRP-E2E01`);
    await expect(page.getByTestId('order-success')).toBeVisible();
    await expect(page.getByText('ORD-GRP-E2E01')).toBeVisible();
    await expect(page.getByText('ORD-A')).toBeVisible();
    await expect(page.getByText('ORD-B')).toBeVisible();
  });
});

function jsonEnvelope<T>(data: T) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
