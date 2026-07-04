import { expect, test } from '@playwright/test';
import { baseUrls, htxAdminUser, isExternalUrl, seedAuthenticatedSession, superAdminUser } from '../helpers/auth';

test.describe('three-zone dashboard RBAC', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'RBAC route/menu assertions run once on desktop chromium');
  });

  test('@smoke @rbac @admin Super Admin only sees system/SaaS modules', async ({ page }) => {
    const { adminUrl } = baseUrls();
    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(joinUrl(adminUrl, '/dashboard'));

    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(page.getByTestId('admin-menu-cooperatives')).toBeVisible();
    await expect(page.getByTestId('admin-menu-plans')).toBeVisible();
    await expect(page.getByTestId('admin-menu-invoices')).toBeVisible();
    await expect(page.getByTestId('admin-menu-orders')).toBeVisible();
    await expect(page.getByTestId('admin-menu-roles')).toBeVisible();
    await expect(page.getByTestId('admin-menu-settings')).toBeVisible();
    await expect(page.getByTestId('admin-menu-audit-logs')).toBeVisible();
    await expect(page.getByTestId('admin-menu-backups')).toBeVisible();

    await expect(page.getByTestId('htx-menu-products')).toHaveCount(0);
    await expect(page.getByTestId('htx-menu-zones')).toHaveCount(0);
    await expect(page.getByTestId('htx-menu-farming-logs')).toHaveCount(0);
    await expect(page.getByTestId('htx-menu-passports')).toHaveCount(0);
  });

  test('@smoke @rbac @route Super Admin cannot open HTX operation routes directly', async ({ page }) => {
    const { adminUrl } = baseUrls();
    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(joinUrl(adminUrl, '/dashboard/products'));

    await expect(page.getByTestId('error-state')).toContainText('403');
    await expect(page.getByTestId('product-create-button')).toHaveCount(0);
  });

  test('@smoke @rbac @htx Admin HTX sees business modules only', async ({ page }) => {
    const { htxUrl } = baseUrls();
    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(joinUrl(htxUrl, '/dashboard'));

    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page.getByTestId('htx-dashboard')).toBeVisible();
    await expect(page.getByTestId('htx-menu-products')).toBeVisible();
    await expect(page.getByTestId('htx-menu-zones')).toBeVisible();
    await expect(page.getByTestId('htx-menu-members')).toBeVisible();
    await expect(page.getByTestId('htx-menu-farmers')).toBeVisible();
    await expect(page.getByTestId('htx-menu-farming-logs')).toBeVisible();
    await expect(page.getByTestId('htx-menu-passports')).toBeVisible();
    await expect(page.getByTestId('htx-menu-orders')).toBeVisible();
    await expect(page.getByTestId('htx-menu-reports')).toBeVisible();

    await expect(page.getByTestId('admin-menu-roles')).toHaveCount(0);
    await expect(page.getByTestId('admin-menu-backups')).toHaveCount(0);
    await expect(page.getByTestId('admin-menu-settings')).toHaveCount(0);
    await expect(page.getByTestId('admin-menu-audit-logs')).toHaveCount(0);
  });

  test('@smoke @rbac @route Admin HTX cannot open system routes directly', async ({ page }) => {
    const { htxUrl } = baseUrls();
    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(joinUrl(htxUrl, '/dashboard/backups'));

    await expect(page.getByTestId('error-state')).toContainText('403');
    await expect(page.getByTestId('admin-menu-backups')).toHaveCount(0);
  });

  test('@rbac @route Admin HTX is rejected on admin domain', async ({ page }) => {
    const { adminUrl } = baseUrls();
    test.skip(!isExternalUrl(adminUrl), 'Domain-specific rejection requires ADMIN_BASE_URL');

    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(joinUrl(adminUrl, '/dashboard'));

    await expect(page.getByTestId('error-state')).toContainText(/Sai khu vực|403|không có quyền/i);
    await expect(page.getByTestId('admin-dashboard')).toHaveCount(0);
  });
});

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}
