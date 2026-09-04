import { expect, test } from '@playwright/test';
import { baseUrls, seedAuthenticatedSession, superAdminUser } from '../helpers/auth';

test.describe('admin audit logs', () => {
  test('@admin audit log filter reloads the filtered collection', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const requestedActions: string[] = [];
    await page.route('**/api/v1/audit-logs**', async (route) => {
      const action = new URL(route.request().url()).searchParams.get('action') ?? '';
      requestedActions.push(action);
      const logs = action === 'USER_UPDATED'
        ? [{ id: 'log-2', action: 'USER_UPDATED', entity: 'User', entityId: 'user-1', createdAt: '2026-09-01T00:00:00.000Z', metadataJson: { status: 'ACTIVE' }, actor: { email: 'admin@example.com', fullName: 'Admin' } }]
        : [{ id: 'log-1', action: 'PRODUCT_CREATED', entity: 'Product', entityId: 'product-1', createdAt: '2026-09-01T00:00:00.000Z', metadataJson: {}, actor: { email: 'admin@example.com', fullName: 'Admin' } }];
      await route.fulfill(jsonEnvelope(logs));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/audit-logs`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Nhật ký hệ thống' })).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText('PRODUCT_CREATED')).toBeVisible();
    await page.getByPlaceholder('Lọc action').fill('USER_UPDATED');
    await expect(page.getByText('USER_UPDATED')).toBeVisible();
    await expect(page.getByText('PRODUCT_CREATED')).toHaveCount(0);
    expect(requestedActions).toContain('USER_UPDATED');
  });
});

function jsonEnvelope(data: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
