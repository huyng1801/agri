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
    let treeCodeIssued = false;
    await page.route('**/upload/tree.jpg', async (route) => route.fulfill({ status: 200, body: '' }));
    await page.route('**/api/v1/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      if (path.endsWith('/reports/overview')) return route.fulfill({ json: item({ metrics: [] }) });
      if (path.endsWith('/crop-types')) return route.fulfill({ json: list([{ id: 'crop-1', code: 'XOI', name: 'Xoài', isActive: true }]) });
      if (path.endsWith('/zones')) return route.fulfill({ json: list([{ id: 'zone-1', code: 'VLM-01', name: 'Vườn demo' }]) });
      if (path.endsWith('/files/presign-upload')) return route.fulfill({ json: item({ objectKey: 'trees/tree.jpg', uploadUrl: `${url.origin}/upload/tree.jpg`, method: 'PUT', headers: {}, publicUrl: 'https://cdn.example.test/tree.jpg' }) });
      if (path.endsWith('/files/confirm-upload')) return route.fulfill({ json: item({ id: 'file-1', publicUrl: 'https://cdn.example.test/tree.jpg' }) });
      if (path.endsWith('/trees')) return route.fulfill({ json: list([{ id: 'tree-1', treeCode: 'XOI-VLM-01-000001', status: 'ACTIVE', publicVerified: true, latitude: 10.4458, longitude: 105.718, cropType: { name: 'Xoài' }, zone: { name: 'Vườn demo', latitude: 10.4458, longitude: 105.718 }, _count: { events: 1, harvests: 0 } }]) });
      if (path.match(/\/trees\/[^/]+\/events$/)) return route.fulfill({ json: list([]) });
      if (path.endsWith('/trees/tree-no-qr')) return route.fulfill({ json: item({ id: 'tree-no-qr', treeCode: 'XOI-VLM-01-000002', status: 'ACTIVE', publicVerified: true, cropType: { name: 'Xoài' }, zone: { name: 'Vườn demo', latitude: 10.4458, longitude: 105.718 }, traceabilityCode: treeCodeIssued ? { id: 'code-2', code: 'TREE-XOI-VLM-01-000002', qrDataUrl: 'data:image/png;base64,qr', status: 'PUBLISHED' } : null, events: [], harvests: [] }) });
      if (path.match(/\/trees\/[^/]+$/)) return route.fulfill({ json: item({ id: 'tree-1', treeCode: 'XOI-VLM-01-000001', status: 'ACTIVE', publicVerified: true, latitude: 10.4458, longitude: 105.718, plantedDate: '2020-01-01T00:00:00.000Z', cooperative: { id: 'coop-e2e', name: 'HTX Demo' }, imagesJson: [{ url: 'https://cdn.example.test/tree.jpg', caption: 'Ảnh cây demo' }], cropType: { name: 'Xoài' }, zone: { name: 'Vườn demo', latitude: 10.4458, longitude: 105.718 }, events: [{ id: 'event-1', treeId: 'tree-1', eventDate: '2026-07-10T00:00:00.000Z', eventType: 'FERTILIZING', description: 'Bón phân hữu cơ', status: 'PUBLISHED', inputs: [] }], harvests: [{ id: 'harvest-1', treeId: 'tree-1', harvestDate: '2026-08-20T00:00:00.000Z', quantity: 42, unit: 'kg', status: 'RECORDED', lotTrees: [{ lot: { lotCode: 'LO-DEMO-001' } }] }], traceabilityCode: { id: 'code-1', code: 'TREE-XOI-VLM-01-000001', qrDataUrl: 'data:image/png;base64,qr', status: 'PUBLISHED' } }) });
      if (path.endsWith('/harvests')) return route.fulfill({ json: list([]) });
      if (path.endsWith('/lots')) return route.fulfill({ json: list([]) });
      if (path.endsWith('/products')) return route.fulfill({ json: list([]) });
      if (path.endsWith('/product-batches')) return route.fulfill({ json: list([]) });
      if (path.endsWith('/traceability-codes')) {
        if (route.request().method() === 'POST') {
          treeCodeIssued = true;
          return route.fulfill({ json: item({ id: 'code-2', code: 'TREE-XOI-VLM-01-000002', qrDataUrl: 'data:image/png;base64,qr', status: 'PUBLISHED' }) });
        }
        return route.fulfill({ json: list([]) });
      }
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

    await page.goto('/dashboard/trees/tree-1');
    await expect(page.getByTestId('tree-gis-panel')).toBeVisible();
    await expect(page.getByTestId('gis-map')).toBeVisible();
    await expect(page.getByTestId('gis-map').locator('.leaflet-container')).toBeVisible();
    await expect(page.getByTestId('gis-map')).toHaveAttribute('data-marker-count', '1');
    await expect(page.getByTestId('gis-map').locator('.leaflet-overlay-pane canvas')).toHaveCount(1);
    await expect(page.getByText('GPS chính xác (nội bộ)')).toBeVisible();
    await expect(page.getByText('HTX Demo')).toBeVisible();
    await expect(page.getByTestId('tree-images-panel')).toContainText('Ảnh thực địa của cây');
    await expect(page.getByTestId('tree-cultivation-history')).toContainText('Bón phân hữu cơ');
    await expect(page.getByTestId('tree-harvest-history')).toContainText('42 kg');

    await page.goto('/dashboard/map');
    await expect(page.getByTestId('gis-map')).toBeVisible();
    await expect(page.getByTestId('gis-map').locator('.leaflet-container')).toBeVisible();
    await expect(page.getByTestId('gis-map')).toHaveAttribute('data-marker-count', '1');
    await expect(page.getByTestId('gis-map').locator('.leaflet-overlay-pane canvas')).toHaveCount(1);
    await expect(page.getByText('1 cây có tọa độ')).toBeVisible();
  });

  test('fills tree coordinates from the phone GPS permission flow', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 10.4458, longitude: 105.718 });

    await page.goto('/dashboard/trees');
    await page.getByRole('button', { name: 'Tạo hồ sơ cây' }).click();
    await page.getByTestId('use-current-location').click();

    await expect(page.getByRole('status')).toContainText('10.445800, 105.718000');
    await expect(page.getByLabel('Vĩ độ (nội bộ)')).toHaveValue('10.445800');
    await expect(page.getByLabel('Kinh độ (nội bộ)')).toHaveValue('105.718000');
  });

  test('uploads a tree image before creating the passport', async ({ page }) => {
    await page.goto('/dashboard/trees');
    await page.getByRole('button', { name: 'Tạo hồ sơ cây' }).click();
    await page.getByTestId('tree-image-upload').locator('input[type="file"]').setInputFiles({ name: 'tree.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('tree-image') });

    await expect(page.getByTestId('tree-image-upload').locator('img')).toHaveCount(1);
    await expect(page.getByTestId('tree-image-upload').locator('img')).toHaveAttribute('src', 'https://cdn.example.test/tree.jpg');
  });

  test('issues a tree QR directly from the passport detail', async ({ page }) => {
    await page.goto('/dashboard/trees/tree-no-qr');
    await expect(page.getByTestId('issue-tree-qr')).toBeVisible();
    await page.getByTestId('issue-tree-qr').click();

    await expect(page.getByTestId('tree-qr-card')).toContainText('TREE-XOI-VLM-01-000002');
    await expect(page.getByTestId('tree-qr-card').getByAltText('QR cây XOI-VLM-01-000002')).toBeVisible();
  });

  test('loads the two public traceability routes without requiring an account', async ({ page }) => {
    await page.goto('/cay/XOI-VLM-01-000001');
    await expect(page.locator('body')).toContainText(/Không tìm thấy hộ chiếu cây|Đã xác thực/);
    await page.goto('/truy-xuat/SP-DEMO-000001');
    await expect(page.locator('body')).toContainText(/Không tìm thấy sản phẩm truy xuất|Đã xác thực/);
  });
});
