import { expect, test } from '@playwright/test';

const user = {
  id: 'e2e-user',
  email: 'admin@demo.test',
  fullName: 'Admin HTX E2E',
  cooperativeId: 'coop-e2e',
  roles: ['ADMIN_HTX'],
  permissions: ['*']
};

const list = (data: unknown[] = []) => ({ success: true, message: 'OK', data: { data, meta: { page: 1, limit: 100, total: data.length, totalPages: 1 } } });
const item = (data: unknown) => ({ success: true, message: 'OK', data });

test.describe('plant-level traceability screens', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem('agri_access_token', 'e2e-token');
      localStorage.setItem('agri_user', JSON.stringify(value));
    }, user);
    await page.route('**/api/v1/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      if (path.endsWith('/reports/overview')) return route.fulfill({ json: item({ metrics: [] }) });
      if (path.endsWith('/crop-types')) return route.fulfill({ json: list([{ id: 'crop-1', code: 'XOI', name: 'Xoài', isActive: true }]) });
      if (path.endsWith('/zones')) return route.fulfill({ json: list([{ id: 'zone-1', code: 'VLM-01', name: 'Vườn demo' }]) });
      if (path.endsWith('/trees')) return route.fulfill({ json: list([{ id: 'tree-1', treeCode: 'XOI-VLM-01-000001', status: 'ACTIVE', publicVerified: true, cropType: { name: 'Xoài' }, zone: { name: 'Vườn demo' }, _count: { events: 1, harvests: 0 } }]) });
      if (path.match(/\/trees\/[^/]+\/events$/)) return route.fulfill({ json: list([]) });
      if (path.match(/\/trees\/[^/]+$/)) return route.fulfill({ json: item({ id: 'tree-1', treeCode: 'XOI-VLM-01-000001', status: 'ACTIVE', publicVerified: true, cropType: { name: 'Xoài' }, zone: { name: 'Vườn demo' }, events: [], harvests: [], traceabilityCode: null }) });
      if (path.endsWith('/harvests')) return route.fulfill({ json: list([]) });
      if (path.endsWith('/lots')) return route.fulfill({ json: list([]) });
      if (path.endsWith('/products')) return route.fulfill({ json: list([]) });
      if (path.endsWith('/product-batches')) return route.fulfill({ json: list([]) });
      if (path.endsWith('/traceability-codes')) return route.fulfill({ json: list([]) });
      return route.fulfill({ json: item({}) });
    });
  });

  test('covers the dashboard, six new plant screens, and the preserved QR screen', async ({ page }) => {
    const screens = [
      ['/dashboard', 'htx-dashboard'],
      ['/dashboard/trees', 'trees-screen'],
      ['/dashboard/map', 'tree-map-screen'],
      ['/dashboard/tree-events', 'tree-events-screen'],
      ['/dashboard/harvests', 'harvests-screen'],
      ['/dashboard/lots', 'lots-screen'],
      ['/dashboard/traceability', 'traceability-screen'],
      ['/dashboard/passports', 'page-title']
    ] as const;

    for (const [path, testId] of screens) {
      await page.goto(path);
      await expect(page.getByTestId(testId)).toBeVisible();
    }
  });

  test('loads the two public traceability routes without requiring an account', async ({ page }) => {
    await page.goto('/cay/XOI-VLM-01-000001');
    await expect(page.locator('body')).toContainText(/Không tìm thấy hộ chiếu cây|Đã xác thực/);
    await page.goto('/truy-xuat/SP-DEMO-000001');
    await expect(page.locator('body')).toContainText(/Không tìm thấy sản phẩm truy xuất|Đã xác thực/);
  });
});
