import { expect, test } from '@playwright/test';
import { baseUrls, htxAdminUser, seedAuthenticatedSession, superAdminUser } from '../helpers/auth';

test.describe('admin CRUD forms', () => {
  test.setTimeout(90_000);
  test.beforeEach(({}, testInfo) => {
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
    await expect(page.getByTestId('page-title')).toContainText('Gói dịch vụ SaaS', { timeout: 45_000 });

    await page.getByTestId('plan-create-button').click();
    await page.getByTestId('plan-name-input').fill('E2E Cleanup Plan');
    await page.getByTestId('plan-slug-input').fill('e2e-cleanup-plan');
    await page.getByTestId('plan-priceMonthly-input').fill('12345');
    await page.getByTestId('plan-priceYearly-input').fill('123450');
    await page.getByRole('button', { name: 'Lưu gói' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);

    await page.getByRole('button', { name: 'Sửa', exact: true }).click();
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
    await expect(page.getByTestId('page-title')).toContainText('Người dùng hệ thống', { timeout: 45_000 });
    await page.getByTestId('user-create-button').click();
    await page.getByTestId('user-name-input').fill('E2E Cleanup User');
    await page.getByTestId('user-email-input').fill('e2e-cleanup-user@example.com');
    await page.getByTestId('user-password-input').fill('StrongPass123!');
    await page.getByTestId('user-cooperative-select').selectOption('coop-e2e');
    await page.getByRole('button', { name: 'Lưu tài khoản' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    await page.getByRole('button', { name: 'Sửa', exact: true }).click();
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
    await expect(page.getByTestId('page-title')).toContainText('Hóa đơn SaaS', { timeout: 45_000 });
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

  test('@admin invoice paid lifecycle restores unpaid state', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const actions: string[] = [];
    let invoice: ReturnType<typeof invoiceFixture> & { paidAt: string | null } = invoiceFixture('invoice-lifecycle-e2e', 'INV-LIFECYCLE', 'UNPAID');
    await page.route('**/api/v1/invoices**', async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (request.method() === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [invoice], meta: { total: 1 } }));
        return;
      }
      actions.push(path);
      if (path.endsWith('/mark-paid')) invoice = { ...invoice, status: 'PAID', paidAt: '2026-09-04T00:00:00.000Z' };
      if (path.endsWith('/mark-unpaid')) invoice = { ...invoice, status: 'UNPAID', paidAt: null };
      await route.fulfill(jsonEnvelope(invoice));
    });
    await page.route('**/api/v1/cooperatives?*', async (route) => await route.fulfill(jsonEnvelope({ data: [], meta: { total: 0 } })));
    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/invoices`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Hóa đơn SaaS', { timeout: 45_000 });
    const card = page.locator('article').filter({ hasText: 'INV-LIFECYCLE' });
    await card.getByRole('button', { name: 'Mark paid' }).click();
    await expect.poll(() => actions.length).toBe(1);
    await card.getByRole('button', { name: 'Mark unpaid' }).click();
    await expect.poll(() => actions.length).toBe(2);
    expect(actions[0]).toMatch(/\/invoices\/invoice-lifecycle-e2e\/mark-paid$/);
    expect(actions[1]).toMatch(/\/invoices\/invoice-lifecycle-e2e\/mark-unpaid$/);
    expect(invoice.status).toBe('UNPAID');
    expect(invoice.paidAt).toBeNull();
  });

  test('@admin @form @crud cooperative create edit and archive cleanup', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let cooperative = cooperativeFixture('coop-seed', 'HTX Seed', 'HTX-SEED', 'ACTIVE');

    await page.route('**/api/v1/cooperatives**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [cooperative], meta: { page: 1, limit: 100, total: 1 } }));
        return;
      }
      const body = (method === 'DELETE' ? undefined : request.postDataJSON()) as Record<string, unknown> | undefined;
      mutations.push({ method, path, body });
      if (method === 'POST') cooperative = { ...cooperative, id: 'coop-e2e', ...body } as typeof cooperative;
      else if (method === 'PATCH') cooperative = { ...cooperative, ...body } as typeof cooperative;
      else if (method === 'DELETE') cooperative = { ...cooperative, status: 'ARCHIVED' };
      await route.fulfill(jsonEnvelope(cooperative));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/cooperatives`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('HTX cấp nền tảng', { timeout: 45_000 });
    await page.getByTestId('cooperative-create-button').click();
    await page.getByTestId('cooperative-name-input').fill('E2E Cleanup HTX');
    await page.getByTestId('cooperative-code-input').fill('E2E-HTX');
    await page.getByTestId('cooperative-address-editor').fill('Đồng Tháp');
    await page.getByTestId('cooperative-phone-input').fill('0907001200');
    await page.getByTestId('cooperative-save-button').click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    await page.getByRole('button', { name: 'Sửa' }).click();
    await page.getByTestId('cooperative-name-input').fill('E2E Cleanup HTX Edited');
    await page.getByTestId('cooperative-save-button').click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(1);
    await page.getByRole('button', { name: 'Ngừng' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'DELETE').length).toBe(1);
    expect(mutations.map((item) => item.method)).toEqual(['POST', 'PATCH', 'DELETE']);
    expect(mutations[0].body).toMatchObject({ name: 'E2E Cleanup HTX', code: 'E2E-HTX', address: 'Đồng Tháp', phone: '0907001200' });
    expect(mutations[1].body).toMatchObject({ name: 'E2E Cleanup HTX Edited' });
  });

  test('@admin @form @crud role update restores original settings', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const updates: Array<Record<string, unknown>> = [];
    await page.route('**/api/v1/roles/permissions', async (route) => {
      await route.fulfill(jsonEnvelope({ permissions: [{ key: 'products.read', group: 'Sản phẩm', label: 'Xem sản phẩm' }], wildcard: [] }));
    });
    await page.route('**/api/v1/roles', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill(jsonEnvelope([{ id: 'role-member', slug: 'MEMBER_HTX', name: 'Thành viên HTX', description: 'Original', permissions: ['products.read'], isSystem: true }]));
        return;
      }
      updates.push(request.postDataJSON());
      await route.fulfill(jsonEnvelope({ id: 'role-member', slug: 'MEMBER_HTX', name: updates.at(-1)?.name || 'Thành viên HTX', description: updates.at(-1)?.description || 'Original', permissions: ['products.read'], isSystem: true }));
    });
    await page.route('**/api/v1/roles/*', async (route) => {
      if (new URL(route.request().url()).pathname.endsWith('/permissions')) {
        await route.fulfill(jsonEnvelope({ permissions: [{ key: 'products.read', group: 'Sản phẩm', label: 'Xem sản phẩm' }], wildcard: [] }));
        return;
      }
      const payload = route.request().postDataJSON() as Record<string, unknown>;
      updates.push(payload);
      await route.fulfill(jsonEnvelope({ id: 'role-member', slug: 'MEMBER_HTX', name: payload.name || 'Thành viên HTX', description: payload.description || 'Original', permissions: ['products.read'], isSystem: true }));
    });
    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/roles`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Vai trò & quyền' })).toBeVisible({ timeout: 45_000 });
    const nameInput = page.locator('label').filter({ hasText: 'Tên vai trò' }).first().locator('input');
    await nameInput.fill('E2E Temporary Role');
    await page.getByRole('button', { name: 'Lưu' }).first().click();
    await expect.poll(() => updates.length).toBe(1);
    await nameInput.fill('Thành viên HTX');
    await page.getByRole('button', { name: 'Lưu' }).first().click();
    await expect.poll(() => updates.length).toBe(2);
    expect(updates[0]).toMatchObject({ name: 'E2E Temporary Role' });
    expect(updates[1]).toMatchObject({ name: 'Thành viên HTX' });
  });

  test('@admin @form @crud news create edit and archive cleanup', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let article = newsFixture('news-seed', 'Bài seed để kiểm thử');

    await page.route('**/api/v1/news**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/categories') && method === 'GET') {
        await route.fulfill(jsonEnvelope([newsCategoryFixture()]));
        return;
      }
      if (path.endsWith('/categories')) {
        await route.fulfill(jsonEnvelope(newsCategoryFixture()));
        return;
      }
      if (method === 'GET' && /\/news\/[^/]+$/.test(path)) {
        await route.fulfill(jsonEnvelope(article));
        return;
      }
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [article], meta: { page: 1, limit: 50, total: 1 } }));
        return;
      }
      const body = method === 'DELETE' ? undefined : request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method, path, body });
      if (method === 'POST') article = { ...article, id: 'news-e2e', ...body } as typeof article;
      else if (method === 'PATCH') article = { ...article, ...body } as typeof article;
      else if (method === 'DELETE') article = { ...article, status: 'ARCHIVED' };
      await route.fulfill(jsonEnvelope(article));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/news`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Tin tức', { timeout: 45_000 });
    await expect(page.getByTestId('news-list-row-news-seed')).toBeVisible();
    await expect(page.getByTestId('news-list-create-button')).toBeVisible();
    await page.getByTestId('news-list-create-button').click();
    await expect(page).toHaveURL(/\/dashboard\/news\/new\?siteKey=AGRIPASSPORT/);
    await page.getByTestId('news-title-input').fill('E2E Bài viết truy xuất nguồn gốc');
    await page.getByTestId('news-content-editor').fill('Nội dung bài viết E2E để kiểm tra luồng lưu nháp.');
    await page.getByTestId('news-save-draft-button').click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);

    await page.getByRole('button', { name: 'Nâng cao', exact: true }).click();
    await expect(page.getByRole('button', { name: 'HTML' })).toBeVisible();
    await page.getByRole('button', { name: 'Danh sách bài viết' }).click();
    await expect(page).toHaveURL(/\/dashboard\/news$/);
    await page.getByTestId('news-list-row-news-e2e').getByRole('link', { name: /Sửa bài/ }).click();
    await expect(page).toHaveURL(/\/dashboard\/news\/news-e2e\?siteKey=AGRIPASSPORT/);
    await expect(page.getByTestId('news-title-input')).toHaveValue('E2E Bài viết truy xuất nguồn gốc');
    await page.getByTestId('news-title-input').fill('E2E Bài viết truy xuất nguồn gốc đã sửa');
    await page.getByTestId('news-save-draft-button').click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(1);

    await page.getByRole('button', { name: 'Danh sách bài viết' }).click();
    await page.once('dialog', (dialog) => dialog.accept());
    await page.getByTestId('news-list-delete-news-e2e').click();
    await expect.poll(() => mutations.filter((item) => item.method === 'DELETE').length).toBe(1);
    expect(mutations.map((item) => item.method)).toEqual(['POST', 'PATCH', 'DELETE']);
    expect(mutations[0].body).toMatchObject({ title: 'E2E Bài viết truy xuất nguồn gốc', status: 'DRAFT' });
    expect(mutations[1].body).toMatchObject({ title: 'E2E Bài viết truy xuất nguồn gốc đã sửa', status: 'DRAFT' });
  });

  test('@admin @form news site selector stays focused and accepts another website', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let article = newsFixture('news-site-switch-seed', 'Bài kiểm tra đổi website');

    await page.route('**/api/v1/news**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/categories') && method === 'GET') {
        await route.fulfill(jsonEnvelope([newsCategoryFixture()]));
        return;
      }
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [article], meta: { page: 1, limit: 50, total: 1 } }));
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method, path, body });
      article = { ...article, id: 'news-site-switch-e2e', ...body } as typeof article;
      await route.fulfill(jsonEnvelope(article));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/news`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Tin tức', { timeout: 45_000 });
    await expect(page.getByTestId('news-list-site-filter')).toHaveValue('AGRIPASSPORT');
    await page.getByTestId('news-list-site-filter').selectOption('PASSPORT');
    await expect(page.getByTestId('news-list-site-filter')).toHaveValue('PASSPORT');
    await page.getByTestId('news-list-create-button').click();
    await expect(page).toHaveURL(/\/dashboard\/news\/new\?siteKey=PASSPORT/);
    await expect(page.getByTestId('news-site-filter')).toHaveValue('PASSPORT');
    await page.getByTestId('news-title-input').fill('Bài đăng Passport từ form admin');
    await page.getByTestId('news-content-editor').fill('Nội dung bài đăng HTXONLINE để kiểm tra payload.');
    await page.getByTestId('news-save-draft-button').click();

    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    expect(mutations[0].body).toMatchObject({
      siteKey: 'PASSPORT',
      status: 'DRAFT',
      title: 'Bài đăng Passport từ form admin'
    });
  });

  test('@admin @form rich text toolbar keeps headings on their own line', async ({ page }) => {
    const { adminUrl } = baseUrls();
    let article = newsFixture('news-editor-format-seed', 'Bài kiểm tra định dạng');

    await page.route('**/api/v1/news**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/categories') && method === 'GET') {
        await route.fulfill(jsonEnvelope([newsCategoryFixture()]));
        return;
      }
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [article], meta: { page: 1, limit: 50, total: 1 } }));
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      article = { ...article, id: 'news-editor-format-e2e', ...body } as typeof article;
      await route.fulfill(jsonEnvelope(article));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/news/new`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Tin tức', { timeout: 45_000 });
    await page.getByRole('button', { name: 'Nâng cao', exact: true }).click();

    const editor = page.getByTestId('news-content-editor');
    await editor.fill('Nội dung mở đầu');
    await editor.press('End');
    await page.getByRole('button', { name: 'Chèn tiêu đề H3' }).click();
    await expect(editor.locator('h3')).toHaveCount(1);
    await expect(editor.locator('p')).toHaveCount(1);
    await expect(editor.locator('h3')).toHaveText('Nội dung mở đầu');

    await editor.fill('Một đoạn văn bình thường');
    await editor.press('End');
    await expect(page.getByRole('button', { name: 'Chữ đậm' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Chữ nghiêng' })).toHaveCount(1);
    await expect(editor.locator('strong')).toHaveCount(0);
  });

  test('@admin @form news pastes a clipboard image through the public upload flow', async ({ page }) => {
    const { adminUrl } = baseUrls();
    let uploadRequested = false;
    let uploadedBytes = 0;
    let uploadContentType = '';

    await page.route('**/api/v1/news**', async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/categories')) {
        await route.fulfill(jsonEnvelope([newsCategoryFixture()]));
        return;
      }
      await route.fulfill(jsonEnvelope({ data: [], meta: { page: 1, limit: 50, total: 0 } }));
    });
    await page.route('**/api/v1/files/upload', async (route) => {
      uploadRequested = true;
      uploadedBytes = route.request().postDataBuffer()?.length ?? 0;
      uploadContentType = route.request().headers()['content-type'] || '';
      await route.fulfill(jsonEnvelope({ id: 'file-news-clipboard', publicUrl: 'https://cdn.example.com/e2e/news-clipboard.png', objectKey: 'e2e/news-clipboard.png' }));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/news/new`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Tin tức', { timeout: 45_000 });
    await expect(page.getByText('Định dạng và công cụ thêm', { exact: true })).toBeVisible();

    const editor = page.getByTestId('news-content-editor');
    await editor.click();
    await editor.evaluate((node) => {
      const clipboard = new DataTransfer();
      clipboard.items.add(new File([new Uint8Array([137, 80, 78, 71])], 'clipboard.png', { type: 'image/png' }));
      const event = new Event('paste', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'clipboardData', { value: clipboard });
      node.dispatchEvent(event);
    });

    await expect.poll(() => uploadRequested).toBe(true);
    await expect.poll(() => uploadedBytes).toBeGreaterThan(0);
    expect(uploadContentType).toMatch(/^multipart\/form-data; boundary=/);
    await expect(editor.locator('img')).toHaveCount(1);
    await expect(page.getByTestId('news-upload-error')).toHaveCount(0);
    await expect(editor.locator('img')).toHaveAttribute('src', 'https://cdn.example.com/e2e/news-clipboard.png');
  });

  test('@admin @form news stays compact and usable on a small viewport', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const article = newsFixture('news-list-mobile-seed', 'Bài viết hiển thị trên màn hình nhỏ');

    await page.route('**/api/v1/news**', async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      await route.fulfill(path.endsWith('/categories')
        ? jsonEnvelope([newsCategoryFixture()])
        : jsonEnvelope({ data: [article], meta: { page: 1, limit: 20, total: 1 } }));
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/news`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Tin tức', { timeout: 45_000 });
    await expect(page.getByTestId('news-list-row-news-list-mobile-seed')).toBeVisible();
    await expect(page.getByTestId('news-list-create-button')).toBeVisible();
    await expect(page.getByTestId('news-list-search-input')).toBeVisible();

    const compactMetrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    expect(compactMetrics.scrollWidth).toBeLessThanOrEqual(compactMetrics.clientWidth + 1);

    await page.getByTestId('news-list-create-button').click();
    await expect(page).toHaveURL(/\/dashboard\/news\/new\?siteKey=AGRIPASSPORT/);
    await expect(page.getByTestId('news-title-input')).toBeVisible();
  });

  test('@admin @form news exposes complete SEO metadata controls in advanced mode', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let article = newsFixture('news-seo-e2e', 'Bài kiểm tra SEO');

    await page.route('**/api/v1/news**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/categories')) {
        await route.fulfill(jsonEnvelope([newsCategoryFixture()]));
        return;
      }
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [], meta: { page: 1, limit: 50, total: 0 } }));
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method, path, body });
      article = { ...article, id: 'news-seo-e2e-created', ...body } as typeof article;
      await route.fulfill(jsonEnvelope(article));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/news/new`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Tin tức', { timeout: 45_000 });
    await page.getByTestId('news-title-input').fill('Nông sản số và truy xuất nguồn gốc');
    await page.getByTestId('news-content-editor').fill('Nội dung bài viết về dữ liệu nông sản và truy xuất nguồn gốc.');
    await page.getByRole('button', { name: 'Nâng cao', exact: true }).click();

    const seoPanel = page.locator('details').filter({ hasText: 'SEO cơ bản' }).first();
    await seoPanel.locator('summary').click();
    for (const testId of [
      'news-focus-keyword-input',
      'news-seo-title-input',
      'news-seo-description-input',
      'news-canonical-url-input',
      'news-schema-type-select',
      'news-noindex-switch',
      'news-nofollow-switch'
    ]) {
      await expect(page.getByTestId(testId)).toBeVisible();
    }

    const socialPanel = page.locator('details').filter({ has: page.locator('summary').filter({ hasText: 'Mạng xã hội' }) }).first();
    await socialPanel.locator('summary').click();
    for (const testId of [
      'news-og-title-input',
      'news-og-description-input',
      'news-og-image-input',
      'news-twitter-title-input',
      'news-twitter-description-input',
      'news-twitter-image-input'
    ]) {
      await expect(page.getByTestId(testId)).toBeVisible();
    }

    await page.getByTestId('news-focus-keyword-input').fill('nông sản số');
    await page.getByTestId('news-seo-title-input').fill('Nông sản số và truy xuất nguồn gốc');
    await page.getByTestId('news-seo-description-input').fill('Tìm hiểu dữ liệu nông sản số, truy xuất nguồn gốc và cách minh bạch thông tin để người mua an tâm hơn.');
    await page.getByTestId('news-canonical-url-input').fill('https://agripassport.com/tin-tuc/nong-san-so-truy-xuat');
    await page.getByTestId('news-og-title-input').fill('Nông sản số minh bạch dữ liệu');
    await page.getByTestId('news-og-description-input').fill('Dữ liệu rõ ràng giúp người mua hiểu đúng hành trình nông sản.');
    await page.getByTestId('news-twitter-title-input').fill('Nông sản số minh bạch dữ liệu');
    await page.getByTestId('news-twitter-description-input').fill('Xem cách dữ liệu tạo niềm tin cho nông sản Việt.');
    await page.getByTestId('news-publish-button').click();

    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    expect(mutations[0].body).toMatchObject({
      status: 'PUBLISHED',
      focusKeyword: 'nông sản số',
      seoTitle: 'Nông sản số và truy xuất nguồn gốc',
      canonicalUrl: 'https://agripassport.com/tin-tuc/nong-san-so-truy-xuat',
      ogTitle: 'Nông sản số minh bạch dữ liệu',
      twitterTitle: 'Nông sản số minh bạch dữ liệu'
    });
  });

  test('@admin @form @passport publishes public news to Hộ chiếu Nông nghiệp', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let article = newsFixture('passport-news-seed', 'Bài Hộ chiếu seed');

    await page.route('**/api/v1/news**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/categories') && method === 'GET') {
        await route.fulfill(jsonEnvelope([newsCategoryFixture()]));
        return;
      }
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [article], meta: { page: 1, limit: 50, total: 1 } }));
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method, path, body });
      article = { ...article, id: 'passport-news-e2e', ...body, siteKey: 'PASSPORT', publicVerified: true } as typeof article;
      await route.fulfill(jsonEnvelope(article));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/news/new?siteKey=PASSPORT`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Tin tức', { timeout: 45_000 });
    await expect(page.getByTestId('news-site-filter')).toHaveValue('PASSPORT');
    await expect(page.getByTestId('news-quick-guide')).toContainText('tiêu đề + nội dung');
    await expect(page.getByRole('button', { name: 'Chèn tiêu đề H2' })).toBeVisible();
    await page.getByRole('button', { name: 'Công cụ' }).click();
    await expect(page.getByRole('button', { name: 'Chèn tiêu đề H2' })).toBeHidden();
    await page.getByRole('button', { name: 'Công cụ' }).click();
    await expect(page.getByRole('button', { name: 'Chèn tiêu đề H2' })).toBeVisible();
    await expect(page.getByTestId('news-site-filter')).toHaveValue('PASSPORT');
    await page.getByTestId('news-passport-topic-select').selectOption('nhat-ky-san-xuat-dien-tu');
    await expect(page.getByTestId('news-title-input')).toHaveValue('Nhật ký sản xuất điện tử là gì? Lợi ích cho nông hộ và hợp tác xã');
    await expect(page.getByTestId('news-slug-input')).toBeHidden();
    await page.locator('details').filter({ hasText: 'Đường dẫn, mô tả ngắn và danh mục' }).locator('summary').click();
    await expect(page.getByTestId('news-slug-input')).toBeVisible();
    await page.getByTestId('news-content-editor').fill('<p>Nội dung bài viết Hộ chiếu Nông nghiệp.</p>');
    await expect(page.getByTestId('news-slug-input')).toBeVisible();
    await expect(page.getByTestId('news-publish-button')).toBeEnabled();
    await page.getByTestId('news-publish-button').click();

    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    expect(mutations[0].body).toMatchObject({
      siteKey: 'PASSPORT',
      status: 'PUBLISHED',
      publicVerified: true,
      title: 'Nhật ký sản xuất điện tử là gì? Lợi ích cho nông hộ và hợp tác xã'
    });
  });

  test('@admin @form news Ctrl+S saves a draft', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let article = newsFixture('news-shortcut-seed', 'Bài shortcut seed');

    await page.route('**/api/v1/news**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/categories') && method === 'GET') {
        await route.fulfill(jsonEnvelope([newsCategoryFixture()]));
        return;
      }
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [article], meta: { page: 1, limit: 50, total: 1 } }));
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method, path, body });
      article = { ...article, id: 'news-shortcut-e2e', ...body } as typeof article;
      await route.fulfill(jsonEnvelope(article));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/news/new`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Tin tức', { timeout: 45_000 });
    await page.getByTestId('news-title-input').fill('E2E lưu nháp bằng phím tắt');
    await page.getByTestId('news-content-editor').fill('Nội dung bài viết được lưu bằng Control S.');
    await page.getByTestId('news-content-editor').press('Control+s');

    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    expect(mutations[0].body).toMatchObject({ title: 'E2E lưu nháp bằng phím tắt', status: 'DRAFT' });
  });

  test('@htx @form @crud product create edit and archive cleanup', async ({ page }) => {
    const { htxUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let product = productFixture('product-seed', 'Sản phẩm seed');

    await page.route('**/api/v1/products**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/categories') && method === 'GET') {
        await route.fulfill(jsonEnvelope([{ id: 'category-e2e', name: 'Nông sản', slug: 'nong-san', isActive: true }]));
        return;
      }
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [product], meta: { page: 1, limit: 60, total: 1 } }));
        return;
      }
      const body = method === 'DELETE' ? undefined : request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method, path, body });
      if (method === 'POST') product = { ...product, id: 'product-e2e', ...body } as typeof product;
      else if (method === 'PATCH') product = { ...product, ...body } as typeof product;
      else if (method === 'DELETE') product = { ...product, status: 'ARCHIVED' };
      await route.fulfill(jsonEnvelope(product));
    });
    await page.route('**/api/v1/zones?*', async (route) => {
      await route.fulfill(jsonEnvelope({ data: [{ id: 'zone-e2e', code: 'ZONE-E2E', name: 'Vùng E2E', status: 'ACTIVE' }], meta: { total: 1 } }));
    });
    await page.route('**/api/v1/users?*', async (route) => {
      await route.fulfill(jsonEnvelope({ data: [{ id: 'farmer-e2e', fullName: 'Nông dân E2E', status: 'ACTIVE' }], meta: { total: 1 } }));
    });

    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(`${htxUrl}/dashboard/products`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Sản phẩm', { timeout: 45_000 });
    await page.getByTestId('product-create-button').click();
    await page.getByTestId('product-code-input').fill('E2E-PRODUCT');
    await page.getByTestId('product-name-input').fill('E2E Sản phẩm');
    await page.getByTestId('product-price-input').fill('89000');
    await page.getByTestId('product-save-draft-button').click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    await page.getByRole('button', { name: 'Sửa', exact: true }).click();
    await page.getByTestId('product-name-input').fill('E2E Sản phẩm đã sửa');
    await page.getByTestId('product-save-draft-button').click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(1);
    await page.getByRole('button', { name: 'Ẩn', exact: true }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'DELETE').length).toBe(1);
    expect(mutations.map((item) => item.method)).toEqual(['POST', 'PATCH', 'DELETE']);
    expect(mutations[0].body).toMatchObject({ code: 'E2E-PRODUCT', name: 'E2E Sản phẩm', price: 89000, status: 'DRAFT' });
    expect(mutations[1].body).toMatchObject({ name: 'E2E Sản phẩm đã sửa' });
  });

  test('@htx @form product image upload flow completes before cleanup', async ({ page }) => {
    const { htxUrl } = baseUrls();
    const actions: string[] = [];
    let product = productFixture('product-seed', 'Sản phẩm seed');
    await page.route('**/api/v1/products**', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [product], meta: { total: 1 } }));
        return;
      }
      const body = request.method() === 'DELETE' ? undefined : request.postDataJSON() as Record<string, unknown>;
      actions.push(request.method());
      if (request.method() === 'POST') product = { ...product, id: 'product-upload-e2e', ...body } as typeof product;
      else if (request.method() === 'DELETE') product = { ...product, status: 'ARCHIVED' };
      await route.fulfill(jsonEnvelope(product));
    });
    await page.route('**/api/v1/zones?*', async (route) => await route.fulfill(jsonEnvelope({ data: [], meta: { total: 0 } })));
    await page.route('**/api/v1/users?*', async (route) => await route.fulfill(jsonEnvelope({ data: [], meta: { total: 0 } })));
    await page.route('**/api/v1/files/presign-upload', async (route) => {
      actions.push('PRESIGN');
      await route.fulfill(jsonEnvelope({ bucket: 'e2e', objectKey: 'e2e/product.png', uploadUrl: 'http://127.0.0.1:3000/e2e-upload', method: 'PUT', headers: {}, publicUrl: 'https://cdn.example.com/e2e/product.png' }));
    });
    await page.route('http://127.0.0.1:3000/e2e-upload', async (route) => {
      actions.push('PUT');
      await route.fulfill({ status: 200, body: '' });
    });
    await page.route('**/api/v1/files/confirm-upload', async (route) => {
      actions.push('CONFIRM');
      await route.fulfill(jsonEnvelope({ id: 'file-e2e', objectKey: 'e2e/product.png', publicUrl: 'https://cdn.example.com/e2e/product.png' }));
    });
    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(`${htxUrl}/dashboard/products`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Sản phẩm', { timeout: 45_000 });
    await page.getByTestId('product-create-button').click();
    await page.locator('input[type="file"]').setInputFiles({ name: 'e2e-product.png', mimeType: 'image/png', buffer: Buffer.from('fake-png') });
    await expect.poll(() => actions.includes('CONFIRM')).toBe(true);
    await expect(page.getByTestId('product-image-input')).toHaveValue('https://cdn.example.com/e2e/product.png');
    await page.getByTestId('product-code-input').fill('E2E-UPLOAD');
    await page.getByTestId('product-name-input').fill('E2E Product Upload');
    await page.getByTestId('product-price-input').fill('99000');
    await page.getByTestId('product-save-draft-button').click();
    await expect.poll(() => actions.includes('POST')).toBe(true);
    await page.getByRole('button', { name: 'Ẩn', exact: true }).click();
    await expect.poll(() => actions.includes('DELETE')).toBe(true);
    expect(actions.slice(0, 3)).toEqual(['PRESIGN', 'PUT', 'CONFIRM']);
  });

  test('@htx @form @crud certification create edit and cleanup', async ({ page }) => {
    const { htxUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let certification = certificationFixture('cert-seed', 'Chứng nhận seed');
    await page.route('**/api/v1/certifications**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [certification], meta: { total: 1 } }));
        return;
      }
      const body = method === 'DELETE' ? undefined : request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method, path, body });
      if (method === 'POST') certification = { ...certification, id: 'cert-e2e', ...body } as typeof certification;
      else if (method === 'PATCH') certification = { ...certification, ...body } as typeof certification;
      await route.fulfill(jsonEnvelope(certification));
    });
    await page.route('**/api/v1/products?*', async (route) => await route.fulfill(jsonEnvelope({ data: [productFixture('product-e2e', 'E2E Sản phẩm')], meta: { total: 1 } })));
    await page.route('**/api/v1/zones?*', async (route) => await route.fulfill(jsonEnvelope({ data: [{ id: 'zone-e2e', code: 'ZONE-E2E', name: 'Vùng E2E', status: 'ACTIVE' }], meta: { total: 1 } })));
    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(`${htxUrl}/dashboard/certifications`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Chứng nhận', { timeout: 45_000 });
    await page.getByTestId('certification-create-button').click();
    await page.getByTestId('certification-name-input').fill('E2E Chứng nhận');
    await page.getByRole('button', { name: 'Lưu chứng nhận' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    await page.getByRole('button', { name: 'Sửa', exact: true }).click();
    await page.getByTestId('certification-name-input').fill('E2E Chứng nhận đã sửa');
    await page.getByRole('button', { name: 'Lưu chứng nhận' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(1);
    await page.getByRole('button', { name: 'Xóa', exact: true }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'DELETE').length).toBe(1);
    expect(mutations.map((item) => item.method)).toEqual(['POST', 'PATCH', 'DELETE']);
  });

  test('@htx @form certification document upload flow completes before cleanup', async ({ page }) => {
    const { htxUrl } = baseUrls();
    const actions: string[] = [];
    let certification = certificationFixture('cert-upload-seed', 'Chứng nhận seed');
    await page.route('**/api/v1/certifications**', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [certification], meta: { total: 1 } }));
        return;
      }
      const body = request.method() === 'DELETE' ? undefined : request.postDataJSON() as Record<string, unknown>;
      actions.push(request.method());
      if (request.method() === 'POST') certification = { ...certification, id: 'cert-upload-e2e', ...body } as typeof certification;
      await route.fulfill(jsonEnvelope(certification));
    });
    await page.route('**/api/v1/products?*', async (route) => await route.fulfill(jsonEnvelope({ data: [productFixture('product-e2e', 'E2E Sản phẩm')], meta: { total: 1 } })));
    await page.route('**/api/v1/zones?*', async (route) => await route.fulfill(jsonEnvelope({ data: [{ id: 'zone-e2e', code: 'ZONE-E2E', name: 'Vùng E2E', status: 'ACTIVE' }], meta: { total: 1 } })));
    await page.route('**/api/v1/files/presign-upload', async (route) => {
      actions.push('PRESIGN');
      await route.fulfill(jsonEnvelope({ bucket: 'e2e', objectKey: 'e2e/cert.pdf', uploadUrl: 'http://127.0.0.1:3000/e2e-cert-upload', method: 'PUT', headers: {}, publicUrl: 'https://cdn.example.com/e2e/cert.pdf' }));
    });
    await page.route('http://127.0.0.1:3000/e2e-cert-upload', async (route) => {
      actions.push('PUT');
      await route.fulfill({ status: 200, body: '' });
    });
    await page.route('**/api/v1/files/confirm-upload', async (route) => {
      actions.push('CONFIRM');
      await route.fulfill(jsonEnvelope({ id: 'file-cert-e2e', objectKey: 'e2e/cert.pdf', publicUrl: 'https://cdn.example.com/e2e/cert.pdf' }));
    });
    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(`${htxUrl}/dashboard/certifications`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Chứng nhận', { timeout: 45_000 });
    await page.getByTestId('certification-create-button').click();
    await page.locator('input[type="file"]').setInputFiles({ name: 'e2e-cert.pdf', mimeType: 'application/pdf', buffer: Buffer.from('fake-pdf') });
    await expect.poll(() => actions.includes('CONFIRM')).toBe(true);
    await expect(page.getByTestId('certification-file-input')).toHaveValue('https://cdn.example.com/e2e/cert.pdf');
    await page.getByTestId('certification-name-input').fill('E2E Chứng nhận upload');
    await page.getByRole('button', { name: 'Lưu chứng nhận' }).click();
    await expect.poll(() => actions.includes('POST')).toBe(true);
    await page.getByRole('button', { name: 'Xóa', exact: true }).click();
    await expect.poll(() => actions.includes('DELETE')).toBe(true);
    expect(actions.slice(0, 3)).toEqual(['PRESIGN', 'PUT', 'CONFIRM']);
  });

  test('@htx @form @crud farming log create edit and archive cleanup', async ({ page }) => {
    const { htxUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let log = farmingLogFixture('log-seed', 'Nhật ký seed');
    await page.route('**/api/v1/farming-logs**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [log], meta: { total: 1 } }));
        return;
      }
      const body = method === 'DELETE' ? undefined : request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method, path, body });
      if (method === 'POST') log = { ...log, id: 'log-e2e', ...body } as typeof log;
      else if (method === 'PATCH') log = { ...log, ...body } as typeof log;
      await route.fulfill(jsonEnvelope(log));
    });
    await page.route('**/api/v1/products?*', async (route) => await route.fulfill(jsonEnvelope({ data: [productFixture('product-e2e', 'E2E Sản phẩm')], meta: { total: 1 } })));
    await page.route('**/api/v1/zones?*', async (route) => await route.fulfill(jsonEnvelope({ data: [{ id: 'zone-e2e', code: 'ZONE-E2E', name: 'Vùng E2E', status: 'ACTIVE' }], meta: { total: 1 } })));
    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(`${htxUrl}/dashboard/farming-logs`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Nhật ký canh tác', { timeout: 45_000 });
    await page.getByTestId('farming-log-create-button').click();
    await page.getByTestId('farming-log-product-select').selectOption('product-e2e');
    await page.getByTestId('farming-log-date-input').fill('2026-09-03');
    await page.getByTestId('farming-log-description-editor').fill('E2E ghi nhận hoạt động canh tác.');
    await page.getByTestId('farming-log-save-draft-button').click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    await page.getByRole('button', { name: 'Sửa', exact: true }).click();
    await page.getByTestId('farming-log-description-editor').fill('E2E ghi nhận đã sửa.');
    await page.getByTestId('farming-log-save-draft-button').click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(1);
    await page.getByRole('button', { name: 'Ẩn', exact: true }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'DELETE').length).toBe(1);
    expect(mutations.map((item) => item.method)).toEqual(['POST', 'PATCH', 'DELETE']);
  });

  test('@htx @form @crud passport create edit and hide cleanup', async ({ page }) => {
    const { htxUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let passport = passportFixture('passport-seed');
    await page.route('**/api/v1/passports**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [passport], meta: { total: 1 } }));
        return;
      }
      const body = method === 'DELETE' ? undefined : request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method, path, body });
      if (method === 'POST') passport = { ...passport, id: 'passport-e2e', ...body } as typeof passport;
      else if (method === 'PATCH') passport = { ...passport, ...body } as typeof passport;
      else if (method === 'DELETE') passport = { ...passport, status: 'HIDDEN' };
      await route.fulfill(jsonEnvelope(passport));
    });
    await page.route('**/api/v1/products?*', async (route) => await route.fulfill(jsonEnvelope({ data: [productFixture('product-e2e', 'E2E Sản phẩm')], meta: { total: 1 } })));
    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(`${htxUrl}/dashboard/passports`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('QR Passport', { timeout: 45_000 });
    await page.getByTestId('passport-create-button').click();
    await page.getByTestId('passport-product-select').selectOption('product-e2e');
    await page.getByTestId('passport-save-draft-button').click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    await page.getByRole('button', { name: 'Sửa', exact: true }).click();
    await page.getByTestId('passport-status-select').selectOption('PUBLISHED');
    await page.getByTestId('passport-save-draft-button').click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(1);
    await page.getByRole('button', { name: 'Ẩn', exact: true }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'DELETE').length).toBe(1);
    expect(mutations.map((item) => item.method)).toEqual(['POST', 'PATCH', 'DELETE']);
  });

  test('@admin @form contact update restores original state', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let contact = contactFixture('contact-e2e');
    await page.route('**/api/v1/contacts**', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [contact], meta: { total: 1 } }));
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method: request.method(), path: new URL(request.url()).pathname, body });
      contact = { ...contact, ...body } as typeof contact;
      await route.fulfill(jsonEnvelope(contact));
    });
    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/contacts`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Liên hệ từ trang công khai', { timeout: 45_000 });
    const card = page.locator('article').filter({ hasText: 'Khách E2E' });
    await card.getByRole('combobox').selectOption('IN_PROGRESS');
    await card.getByRole('textbox').fill('Ghi chú tạm E2E');
    await card.getByRole('button', { name: 'Lưu xử lý' }).click();
    await expect.poll(() => mutations.length).toBe(1);
    await expect(card.getByRole('combobox')).toHaveValue('IN_PROGRESS');
    await expect(card.getByRole('textbox')).toHaveValue('Ghi chú tạm E2E');
    await card.getByRole('combobox').selectOption('NEW');
    await card.getByRole('textbox').fill('');
    await card.getByRole('button', { name: 'Lưu xử lý' }).click();
    await expect.poll(() => mutations.length).toBe(2);
    expect(mutations[0].body).toMatchObject({ status: 'IN_PROGRESS', note: 'Ghi chú tạm E2E' });
    expect(mutations[1].body).toMatchObject({ status: 'NEW' });
  });

  test('@htx @form order note update restores original state', async ({ page }) => {
    const { htxUrl } = baseUrls();
    const mutations: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    let order = orderFixture('order-e2e');
    await page.route('**/api/v1/orders**', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [order], meta: { total: 1 } }));
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method: request.method(), path: new URL(request.url()).pathname, body });
      order = { ...order, ...body } as typeof order;
      await route.fulfill(jsonEnvelope(order));
    });
    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(`${htxUrl}/dashboard/orders`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Đơn hàng COD', { timeout: 45_000 });
    const card = page.getByTestId('order-card');
    const saveNoteButton = card.getByRole('button', { name: 'Lưu ghi chú' });
    await card.getByRole('textbox').fill('Ghi chú tạm E2E');
    await saveNoteButton.click();
    await expect.poll(() => mutations.length).toBe(1);
    await expect(saveNoteButton).toBeEnabled();
    await card.getByRole('textbox').fill('');
    await saveNoteButton.click();
    await expect.poll(() => mutations.length).toBe(2);
    expect(mutations[0].body).toMatchObject({ note: 'Ghi chú tạm E2E' });
    expect(mutations[1].body).toMatchObject({ note: '' });
  });

  test('@admin @form settings profile update restores original state', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<Record<string, unknown>> = [];
    let profileGets = 0;
    let profile = { appName: 'Agri Passport', supportEmail: 'support@example.com', timezone: 'Asia/Ho_Chi_Minh' };
    await page.route('**/api/v1/settings', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        profileGets += 1;
        await route.fulfill(jsonEnvelope([{ key: 'system.profile', value: profile, description: 'Hồ sơ hệ thống' }]));
        return;
      }
      const payload = request.postDataJSON() as Record<string, unknown>;
      mutations.push(payload);
      profile = payload.value as typeof profile;
      await route.fulfill(jsonEnvelope({ key: 'system.profile', value: profile, description: 'Hồ sơ hệ thống' }));
    });
    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/settings`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Cài đặt hệ thống' })).toBeVisible({ timeout: 45_000 });
    await page.getByTestId('settings-tab-profile').click();
    const form = page.locator('form').first();
    await form.locator('input[name="appName"]').fill('E2E Tên tạm');
    await form.locator('input[name="supportEmail"]').fill('e2e-temp@example.com');
    await form.getByRole('button', { name: 'Lưu' }).click();
    await expect.poll(() => mutations.length).toBe(1);
    await expect.poll(() => profileGets).toBeGreaterThan(1);
    await expect(form.locator('input[name="appName"]')).toHaveValue('E2E Tên tạm');
    await expect(form.locator('input[name="supportEmail"]')).toHaveValue('e2e-temp@example.com');
    await form.locator('input[name="appName"]').fill('Agri Passport');
    await form.locator('input[name="supportEmail"]').fill('support@example.com');
    await form.getByRole('button', { name: 'Lưu' }).click();
    await expect.poll(() => mutations.length).toBe(2);
    expect((mutations[0].value as Record<string, unknown>)).toMatchObject({ appName: 'E2E Tên tạm', supportEmail: 'e2e-temp@example.com' });
    expect((mutations[1].value as Record<string, unknown>)).toMatchObject({ appName: 'Agri Passport', supportEmail: 'support@example.com' });
  });

  test('@admin backup create download and restore confirmation flow', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const actions: string[] = [];
    const backup = { fileName: 'e2e-backup.sql', sizeBytes: 1024, createdAt: '2026-09-01T00:00:00.000Z', downloadPath: '/backups/e2e-backup.sql/download', restoreConfirmation: 'RESTORE E2E' };
    await page.route('**/api/v1/backups**', async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/download')) {
        actions.push('download');
        await route.fulfill({ status: 200, contentType: 'application/sql', body: 'e2e backup' });
        return;
      }
      if (path.endsWith('/restore')) {
        actions.push('restore');
        expect(request.postDataJSON()).toMatchObject({ confirmation: 'RESTORE E2E' });
        await route.fulfill(jsonEnvelope({ restored: true }));
        return;
      }
      if (request.method() === 'POST') {
        actions.push('create');
        await route.fulfill(jsonEnvelope(backup));
        return;
      }
      await route.fulfill(jsonEnvelope([backup]));
    });
    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/backups`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Sao lưu' })).toBeVisible({ timeout: 45_000 });
    await page.getByRole('button', { name: 'Tạo bản sao lưu' }).click();
    await expect.poll(() => actions.filter((item) => item === 'create').length).toBe(1);
    const card = page.getByRole('heading', { name: 'e2e-backup.sql' }).locator('..').locator('..');
    await card.getByRole('button', { name: 'Tải' }).click();
    await expect.poll(() => actions.filter((item) => item === 'download').length).toBe(1);
    await card.getByRole('textbox').fill('RESTORE E2E');
    await card.getByRole('button', { name: 'Khôi phục' }).click();
    await expect.poll(() => actions.filter((item) => item === 'restore').length).toBe(1);
    expect(actions).toEqual(['create', 'download', 'restore']);
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
    paidAt: null as string | null,
    note: '',
    subscription: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  };
}

function cooperativeFixture(id: string, name: string, code: string, status: string) {
  return {
    id,
    code,
    name,
    taxCode: '',
    phone: '',
    email: '',
    address: 'Địa chỉ seed',
    province: 'Đồng Tháp',
    district: '',
    ward: '',
    representative: '',
    avatarUrl: '',
    status,
    subscriptions: [],
    _count: { users: 0, products: 0, zones: 0, passports: 0 },
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  };
}

function newsCategoryFixture() {
  return { id: 'category-e2e', name: 'Tin vận hành', slug: 'tin-van-hanh', description: '', sortOrder: 1, isActive: true };
}

function newsFixture(id: string, title: string) {
  return {
    id,
    siteKey: 'AGRIPASSPORT',
    categoryId: 'category-e2e',
    title,
    slug: 'bai-seed-de-kiem-thu',
    excerpt: 'Mô tả bài viết seed.',
    bodyHtml: '<p>Nội dung seed.</p>',
    coverImageUrl: null,
    coverImageAlt: null,
    status: 'DRAFT',
    isFeatured: false,
    showOnHome: false,
    focusKeyword: '',
    seoTitle: '',
    seoDescription: '',
    canonicalUrl: '',
    robotsNoIndex: false,
    robotsNoFollow: false,
    schemaType: 'NewsArticle',
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImageUrl: '',
    tagsJson: [],
    seoScore: 0,
    readabilityScore: 0,
    publishedAt: null,
    scheduledAt: null,
    viewCount: 0,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    category: newsCategoryFixture(),
    author: null
  };
}

function productFixture(id: string, name: string) {
  return {
    id,
    cooperativeId: 'e2e-cooperative-id',
    code: 'PRODUCT-SEED',
    name,
    slug: 'san-pham-seed',
    status: 'DRAFT',
    categoryId: 'category-e2e',
    unit: 'kg',
    price: 50000,
    zoneId: 'zone-e2e',
    farmerId: 'farmer-e2e',
    description: '',
    packagingInfo: '',
    specification: '',
    imageUrl: null,
    thumbnail: null,
    category: { id: 'category-e2e', name: 'Nông sản' },
    zone: { id: 'zone-e2e', code: 'ZONE-E2E', name: 'Vùng E2E' },
    farmer: { id: 'farmer-e2e', fullName: 'Nông dân E2E' },
    _count: { farmingLogs: 0, passports: 0 },
    passports: [],
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  };
}

function certificationFixture(id: string, name: string) {
  return {
    id, cooperativeId: 'e2e-cooperative-id', name, issuer: 'Đơn vị E2E', productId: 'product-e2e', zoneId: 'zone-e2e',
    issuedAt: '2026-09-01T00:00:00.000Z', expiresAt: '2027-09-01T00:00:00.000Z', note: '', isPublic: false,
    fileId: null, fileUrl: null, fileObjectKey: '', file: null, product: { id: 'product-e2e', name: 'E2E Sản phẩm' },
    zone: { id: 'zone-e2e', name: 'Vùng E2E' }, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z'
  };
}

function farmingLogFixture(id: string, description: string) {
  return {
    id, cooperativeId: 'e2e-cooperative-id', productId: 'product-e2e', zoneId: 'zone-e2e', logDate: '2026-09-01T00:00:00.000Z',
    activityType: 'OTHER', status: 'DRAFT', description, inputMaterialsJson: [], imagesJson: [],
    product: { id: 'product-e2e', name: 'E2E Sản phẩm', code: 'E2E-PRODUCT' }, zone: { id: 'zone-e2e', name: 'Vùng E2E' },
    actor: { id: 'e2e-htx-admin', fullName: 'Admin HTX E2E' }, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z'
  };
}

function passportFixture(id: string) {
  return {
    id, cooperativeId: 'e2e-cooperative-id', productId: 'product-e2e', passportCode: 'E2E-PASSPORT', publicSlug: 'e2e-passport',
    status: 'DRAFT', expiredAt: null, publishedAt: null, qrDataUrl: null, viewCount: 0,
    product: { id: 'product-e2e', name: 'E2E Sản phẩm', code: 'E2E-PRODUCT', zone: { name: 'Vùng E2E' } },
    createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z'
  };
}

function contactFixture(id: string) {
  return {
    id, fullName: 'Khách E2E', phone: '0907001200', email: 'e2e@example.com', message: 'Cần tư vấn E2E',
    sourcePath: '/lien-he', status: 'NEW', note: '', createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z'
  };
}

function orderFixture(id: string) {
  return {
    id, cooperativeId: 'e2e-cooperative-id', orderCode: 'ORD-E2E', status: 'NEW', tenantStatus: 'NEW', totalAmount: 89000,
    visibleSubtotal: 89000, visibleItemsCount: 1, buyerName: 'Khách E2E', buyerPhone: '0907001200', buyerEmail: 'e2e@example.com',
    province: 'Đồng Tháp', district: '', ward: '', address: 'Địa chỉ E2E', paymentMethod: 'COD', note: '',
    cooperative: { id: 'e2e-cooperative-id', name: 'HTX E2E', code: 'HTX-E2E' }, itemCooperatives: [],
    items: [{ id: 'item-e2e', quantity: 1, unitPrice: 89000, status: 'NEW', note: '', cooperative: null, product: { id: 'product-e2e', name: 'E2E Sản phẩm', slug: 'e2e-san-pham', unit: 'kg', thumbnail: null } }],
    createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z'
  };
}

function jsonEnvelope(data: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, message: 'ok', data })
  };
}
