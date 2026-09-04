import { expect, test } from '@playwright/test';
import { baseUrls, seedAuthenticatedSession, superAdminUser } from '../helpers/auth';

test.describe('admin CRUD forms', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Admin CRUD interaction runs once on desktop chromium');
  });

  test('@admin @form @crud subscription plan create edit and cleanup', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let plan = planFixture('plan-seed', 'Basic');

    await page.route('**/api/v1/subscription-plans**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [plan], meta: { page: 1, limit: 80, total: 1 } }));
        return;
      }
      const body = (method === 'DELETE' ? undefined : request.postDataJSON()) as Record<string, unknown> | undefined;
      mutations.push({ method, path, body });
      if (method === 'POST') {
        plan = { ...plan, id: 'plan-e2e', ...body } as typeof plan;
      } else if (method === 'PATCH') {
        plan = { ...plan, ...body } as typeof plan;
      } else if (method === 'DELETE') {
        plan = { ...plan, isActive: false };
      }
      await route.fulfill(jsonEnvelope(plan));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/subscription-plans`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Gói dịch vụ SaaS', { timeout: 15_000 });

    await page.getByTestId('plan-create-button').click();
    await page.getByTestId('plan-name-input').fill('E2E Cleanup Plan');
    await page.getByTestId('plan-slug-input').fill('e2e-cleanup-plan');
    await page.getByTestId('plan-priceMonthly-input').fill('12345');
    await page.getByTestId('plan-priceYearly-input').fill('123450');
    await page.getByRole('button', { name: 'Lưu gói' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);

    await page.getByRole('button', { name: 'Sửa' }).click();
    await page.getByTestId('plan-name-input').fill('E2E Cleanup Plan Edited');
    await page.getByRole('button', { name: 'Lưu gói' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(1);

    await page.getByRole('button', { name: 'Tắt' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'DELETE').length).toBe(1);
    expect(mutations.map((item) => item.method)).toEqual(['POST', 'PATCH', 'DELETE']);
    expect(mutations[0].body).toMatchObject({ name: 'E2E Cleanup Plan', slug: 'e2e-cleanup-plan', priceMonthly: 12345, priceYearly: 123450 });
    expect(mutations[1].body).toMatchObject({ name: 'E2E Cleanup Plan Edited' });
  });

  test('@admin @form @crud user create edit and cleanup', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let user = userFixture('user-seed', 'Existing User', 'existing@example.com');

    await page.route('**/api/v1/users**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/roles') && method === 'GET') {
        await route.fulfill(jsonEnvelope([{ id: 'role-member', slug: 'MEMBER_HTX', name: 'Thành viên HTX' }]));
        return;
      }
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [user], meta: { page: 1, limit: 100, total: 1 } }));
        return;
      }
      const body = (method === 'DELETE' ? undefined : request.postDataJSON()) as Record<string, unknown> | undefined;
      mutations.push({ method, path, body });
      if (method === 'POST') user = { ...user, id: 'user-e2e', ...body, roles: [String(body?.role || 'MEMBER_HTX')] } as typeof user;
      if (method === 'PATCH') user = { ...user, ...body, roles: (body?.roles as string[]) || user.roles } as typeof user;
      if (method === 'DELETE') user = { ...user, status: 'INACTIVE' };
      await route.fulfill(jsonEnvelope(user));
    });
    await page.route('**/api/v1/cooperatives?*', async (route) => {
      await route.fulfill(jsonEnvelope({ data: [{ id: 'coop-e2e', code: 'HTX-E2E', name: 'HTX E2E', status: 'ACTIVE' }], meta: { total: 1 } }));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/users`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Người dùng hệ thống', { timeout: 15_000 });
    await page.getByTestId('user-create-button').click();
    await page.getByTestId('user-name-input').fill('E2E Cleanup User');
    await page.getByTestId('user-email-input').fill('e2e-cleanup-user@example.com');
    await page.getByTestId('user-password-input').fill('StrongPass123!');
    await page.getByTestId('user-cooperative-select').selectOption('coop-e2e');
    await page.getByRole('button', { name: 'Lưu tài khoản' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    await page.getByRole('button', { name: 'Sửa' }).click();
    await page.getByTestId('user-name-input').fill('E2E Cleanup User Edited');
    await page.getByRole('button', { name: 'Lưu tài khoản' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(1);
    await page.getByRole('button', { name: 'Ngừng' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'DELETE').length).toBe(1);
    expect(mutations.map((item) => item.method)).toEqual(['POST', 'PATCH', 'DELETE']);
  });

  test('@admin @form @crud invoice create edit and cancel cleanup', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let invoice = invoiceFixture('invoice-seed', 'INV-SEED', 'DRAFT');

    await page.route('**/api/v1/invoices**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [invoice], meta: { page: 1, limit: 80, total: 1 } }));
        return;
      }
      const body = (method === 'POST' ? request.postDataJSON() : request.postDataJSON()) as Record<string, unknown> | undefined;
      mutations.push({ method, path, body });
      if (path.endsWith('/cancel')) invoice = { ...invoice, status: 'CANCELLED' };
      else if (method === 'POST') invoice = { ...invoice, id: 'invoice-e2e', invoiceCode: 'INV-E2E', ...body } as typeof invoice;
      else if (method === 'PATCH') invoice = { ...invoice, ...body } as typeof invoice;
      await route.fulfill(jsonEnvelope(invoice));
    });
    await page.route('**/api/v1/cooperatives?*', async (route) => {
      await route.fulfill(jsonEnvelope({ data: [{ id: 'coop-e2e', code: 'HTX-E2E', name: 'HTX E2E', status: 'ACTIVE' }], meta: { total: 1 } }));
    });
    await page.route('**/api/v1/cooperatives/coop-e2e/subscription', async (route) => {
      await route.fulfill(jsonEnvelope({ id: 'subscription-e2e', status: 'ACTIVE', plan: { name: 'Basic' } }));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/invoices`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Hóa đơn SaaS', { timeout: 15_000 });
    await page.getByTestId('invoice-create-button').click();
    await page.getByTestId('invoice-cooperative-select').selectOption('coop-e2e');
    await page.getByTestId('invoice-amount-input').fill('456789');
    await page.getByTestId('invoice-dueDate-input').fill('2026-12-31');
    await page.getByRole('button', { name: 'Lưu hóa đơn' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST' && item.path.endsWith('/invoices')).length).toBe(1);
    await page.getByRole('button', { name: 'Sửa' }).click();
    await page.getByTestId('invoice-amount-input').fill('567890');
    await page.getByRole('button', { name: 'Lưu hóa đơn' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(1);
    await page.getByRole('button', { name: 'Hủy' }).click();
    await expect.poll(() => mutations.filter((item) => item.path.endsWith('/cancel')).length).toBe(1);
    expect(mutations.map((item) => item.method)).toEqual(['POST', 'PATCH', 'POST']);
    expect(mutations[2].path).toMatch(/\/invoices\/invoice-e2e\/cancel$/);
  });
});

function planFixture(id: string, name: string) {
  return {
    id,
    name,
    slug: name.toLowerCase(),
    priceMonthly: 0,
    priceYearly: 0,
    maxCooperatives: null,
    maxProducts: null,
    maxMembers: null,
    maxZones: null,
    featuresJson: [],
    isActive: true,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  };
}

function userFixture(id: string, fullName: string, email: string) {
  return {
    id,
    email,
    fullName,
    phone: null,
    status: 'ACTIVE',
    cooperativeId: 'coop-e2e',
    cooperative: { id: 'coop-e2e', code: 'HTX-E2E', name: 'HTX E2E', status: 'ACTIVE' },
    roles: ['MEMBER_HTX'],
    lastLoginAt: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  };
}

function invoiceFixture(id: string, invoiceCode: string, status: string) {
  return {
    id,
    invoiceCode,
    cooperativeId: 'coop-e2e',
    cooperative: { id: 'coop-e2e', code: 'HTX-E2E', name: 'HTX E2E' },
    amount: 100000,
    currency: 'VND',
    status,
    dueDate: '2026-12-01T00:00:00.000Z',
    paidAt: null,
    note: '',
    subscription: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  };
}

function jsonEnvelope(data: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, message: 'ok', data })
  };
}
