import { expect, test, type Page } from '@playwright/test';
import { baseUrls, htxAdminUser, isExternalUrl, seedAuthenticatedSession, superAdminUser } from '../helpers/auth';

test.describe('three-zone dashboard RBAC', () => {
  test.beforeEach(({}, testInfo) => {
  });

  test('@smoke @rbac @admin Super Admin only sees system/SaaS modules', async ({ page }, testInfo) => {
    const { adminUrl } = baseUrls();
    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(joinUrl(adminUrl, '/dashboard'));

    await openDashboardNavigation(page, testInfo.project.name);
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(visibleTestId(page, 'admin-menu-cooperatives')).toBeVisible();
    await expect(visibleTestId(page, 'admin-menu-plans')).toBeVisible();
    await expect(visibleTestId(page, 'admin-menu-invoices')).toBeVisible();
    await expect(visibleTestId(page, 'admin-menu-orders')).toBeVisible();
    await expect(visibleTestId(page, 'admin-menu-contacts')).toBeVisible();
    await expect(visibleTestId(page, 'admin-menu-news')).toBeVisible();
    await expect(visibleTestId(page, 'admin-menu-roles')).toBeVisible();
    await expect(visibleTestId(page, 'admin-menu-settings')).toBeVisible();
    await expect(visibleTestId(page, 'admin-menu-audit-logs')).toBeVisible();
    await expect(visibleTestId(page, 'admin-menu-backups')).toBeVisible();

    await expect(page.getByTestId('htx-menu-products')).toHaveCount(0);
    await expect(page.getByTestId('htx-menu-certifications')).toHaveCount(0);
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

  test('@smoke @rbac @htx Admin HTX sees business modules only', async ({ page }, testInfo) => {
    const { htxUrl } = baseUrls();
    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(joinUrl(htxUrl, '/dashboard'));

    await openDashboardNavigation(page, testInfo.project.name);
    await expect(page.getByTestId('htx-dashboard')).toBeVisible();
    await expect(visibleTestId(page, 'htx-menu-products')).toBeVisible();
    await expect(visibleTestId(page, 'htx-menu-certifications')).toBeVisible();
    await expect(visibleTestId(page, 'htx-menu-zones')).toBeVisible();
    await expect(visibleTestId(page, 'htx-menu-members')).toBeVisible();
    await expect(visibleTestId(page, 'htx-menu-farmers')).toBeVisible();
    await expect(visibleTestId(page, 'htx-menu-farming-logs')).toBeVisible();
    await expect(visibleTestId(page, 'htx-menu-passports')).toBeVisible();
    await expect(visibleTestId(page, 'htx-menu-orders')).toBeVisible();
    await expect(visibleTestId(page, 'htx-menu-reports')).toBeVisible();

    await expect(page.getByTestId('admin-menu-roles')).toHaveCount(0);
    await expect(page.getByTestId('admin-menu-news')).toHaveCount(0);
    await expect(page.getByTestId('admin-menu-contacts')).toHaveCount(0);
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

  test('@rbac @route Admin HTX cannot open global news management in HTX area', async ({ page }) => {
    const { htxUrl } = baseUrls();
    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(joinUrl(htxUrl, '/dashboard/news'));

    await expect(page.getByTestId('error-state')).toContainText('403');
    await expect(page.getByTestId('htx-menu-news')).toHaveCount(0);
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

async function openDashboardNavigation(page: Page, projectName: string) {
  if (projectName === 'chromium') {
    await expect(page.getByTestId('sidebar')).toBeVisible();
    return;
  }

  await page.getByTestId('mobile-more-button').click();
  await expect(page.getByTestId('mobile-more-menu')).toBeVisible();
}

function visibleTestId(page: Page, testId: string) {
  return page.locator(`[data-testid="${testId}"]:visible`).first();
}
