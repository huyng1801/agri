import { expect, test, type Page } from '@playwright/test';
import { baseUrls, htxAdminUser, seedAuthenticatedSession } from '../helpers/auth';

const farmerUser = {
  id: 'e2e-farmer',
  email: 'farmer-test@example.com',
  fullName: 'Farmer E2E',
  cooperativeId: 'e2e-cooperative-id',
  roles: ['FARMER'],
  permissions: ['zones.read']
};

test.describe('htx zones dashboard', () => {
  test.beforeEach(({}, testInfo) => {
  });

  test('@smoke @htx @form zones create payload keeps public visibility and coordinates', async ({ page }, testInfo) => {
    const { htxUrl } = baseUrls();
    const requests: Array<Record<string, unknown>> = [];

    await page.route('**/api/v1/zones?*', async (route) => {
      await route.fulfill(jsonEnvelope({
        data: [
          {
            id: 'zone-existing',
            cooperativeId: 'e2e-cooperative-id',
            name: 'Vùng xoài mẫu',
            code: 'ZONE-XOAI',
            address: 'Cao Lãnh, Đồng Tháp',
            areaM2: 3500,
            latitude: 10.460123,
            longitude: 105.632456,
            isPublic: true,
            status: 'ACTIVE',
            createdAt: '2026-07-05T08:00:00.000Z',
            updatedAt: '2026-07-05T08:00:00.000Z',
            _count: {
              products: 2,
              farmingLogs: 4,
              certifications: 1
            }
          }
        ],
        meta: {
          page: 1,
          limit: 80,
          total: 1
        }
      }));
    });

    await page.route('**/api/v1/zones', async (route) => {
      const payload = route.request().postDataJSON() as Record<string, unknown>;
      requests.push(payload);
      await route.fulfill(
        jsonEnvelope({
          id: 'zone-created',
          cooperativeId: 'e2e-cooperative-id',
          name: payload.name,
          code: payload.code,
          address: payload.address ?? null,
          areaM2: payload.areaM2 ?? null,
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
          geojson: payload.geojson ?? null,
          isPublic: payload.isPublic,
          status: payload.status ?? 'ACTIVE',
          createdAt: '2026-07-05T08:30:00.000Z',
          updatedAt: '2026-07-05T08:30:00.000Z',
          _count: {
            products: 0,
            farmingLogs: 0,
            certifications: 0
          }
        })
      );
    });

    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(joinUrl(htxUrl, '/dashboard/zones'), { waitUntil: 'domcontentloaded' });

    await openDashboardNavigation(page, testInfo.project.name);
    await expect(visibleTestId(page, 'htx-menu-zones')).toBeVisible();
    if (testInfo.project.name !== 'chromium') {
      await page.getByTestId('mobile-more-button').click();
      await expect(page.getByTestId('mobile-more-menu')).toHaveCount(0);
    }
    await expect(page.getByText('Vùng xoài mẫu')).toBeVisible();
    await expect(page.getByTestId('zone-create-button')).toBeVisible();

    await page.getByTestId('zone-create-button').click();
    await page.getByTestId('zone-name-input').fill('Vùng chuối hữu cơ');
    await page.getByTestId('zone-code-input').fill('ZONE-CHUOI');
    await page.getByTestId('zone-address-input').fill('Tam Bình, Vĩnh Long');
    await page.getByTestId('zone-area-input').fill('4200');
    await page.getByTestId('zone-latitude-input').fill('10.123456');
    await page.getByTestId('zone-longitude-input').fill('106.123456');
    await page.getByTestId('zone-public-switch').uncheck();
    await page.getByTestId('zone-submit-button').click();

    await expect.poll(() => requests.length).toBe(1);
    expect(requests[0]).toMatchObject({
      name: 'Vùng chuối hữu cơ',
      code: 'ZONE-CHUOI',
      address: 'Tam Bình, Vĩnh Long',
      areaM2: 4200,
      latitude: 10.123456,
      longitude: 106.123456,
      isPublic: false,
      status: 'ACTIVE'
    });
  });

  test('@rbac @htx farmer sees zones in read-only mode', async ({ page }) => {
    const { htxUrl } = baseUrls();

    await page.route('**/api/v1/zones?*', async (route) => {
      await route.fulfill(
        jsonEnvelope({
          data: [
            {
              id: 'zone-farmer-view',
              cooperativeId: 'e2e-cooperative-id',
              name: 'Vùng rau an toàn',
              code: 'ZONE-RAU',
              address: 'Sa Đéc, Đồng Tháp',
              areaM2: 1800,
              isPublic: true,
              status: 'ACTIVE',
              createdAt: '2026-07-05T07:00:00.000Z',
              updatedAt: '2026-07-05T07:00:00.000Z',
              _count: {
                products: 1,
                farmingLogs: 3,
                certifications: 0
              }
            }
          ],
          meta: {
            page: 1,
            limit: 80,
            total: 1
          }
        })
      );
    });

    await seedAuthenticatedSession(page, farmerUser);
    await page.goto(joinUrl(htxUrl, '/dashboard/zones'), { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('chế độ chỉ đọc')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('zone-create-button')).toHaveCount(0);
    await expect(page.getByText('Vùng rau an toàn')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sửa' })).toHaveCount(0);
  });

  test('@htx zone public visibility toggle restores original state', async ({ page }) => {
    const { htxUrl } = baseUrls();
    const requests: Array<Record<string, unknown>> = [];
    let zone = {
      id: 'zone-toggle-e2e', cooperativeId: 'e2e-cooperative-id', name: 'Vùng toggle E2E', code: 'ZONE-TOGGLE', address: 'Đồng Tháp',
      areaM2: 1000, latitude: 10.4, longitude: 105.7, isPublic: true, status: 'ACTIVE', createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z',
      _count: { products: 0, farmingLogs: 0, certifications: 0 }
    };
    await page.route('**/api/v1/zones**', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [zone], meta: { total: 1 } }));
        return;
      }
      const payload = request.postDataJSON() as Record<string, unknown>;
      requests.push(payload);
      zone = { ...zone, ...payload } as typeof zone;
      await route.fulfill(jsonEnvelope(zone));
    });
    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(joinUrl(htxUrl, '/dashboard/zones'), { waitUntil: 'domcontentloaded' });
    const card = page.locator('article').filter({ hasText: 'Vùng toggle E2E' });
    await card.getByRole('button', { name: 'Ẩn công khai' }).click();
    await expect.poll(() => requests.length).toBe(1);
    await card.getByRole('button', { name: 'Bật công khai' }).click();
    await expect.poll(() => requests.length).toBe(2);
    expect(requests).toEqual([{ isPublic: false }, { isPublic: true }]);
    expect(zone.isPublic).toBe(true);
  });
});

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

function jsonEnvelope(data: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      message: 'ok',
      data
    })
  };
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
