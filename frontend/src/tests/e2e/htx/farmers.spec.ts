import { expect, test } from '@playwright/test';
import { baseUrls, htxAdminUser, seedAuthenticatedSession } from '../helpers/auth';

test.describe('htx farmers dashboard', () => {
  test('@htx @form @crud farmer create edit lock and cleanup', async ({ page }) => {
    const { htxUrl } = baseUrls();
    const mutations: Array<{ method: string; body?: Record<string, unknown> }> = [];
    let farmer = {
      id: 'farmer-seed',
      email: 'farmer-seed@example.com',
      fullName: 'Nông dân mẫu',
      phone: '0907001200',
      status: 'ACTIVE',
      roles: ['FARMER'],
      cooperativeId: 'e2e-cooperative-id',
      farmerProfile: { assignedZoneIds: ['zone-1'] },
      farmerSummary: {
        assignedZoneCount: 1,
        areaM2: 12500,
        zonesWithArea: 1,
        treeCount: 7,
        varieties: [{ cropTypeName: 'Xoài', variety: 'Cát Chu', treeCount: 7 }],
        seasonalProduction: [{ seasonId: 'season-1', seasonName: 'Vụ 2026', harvestCount: 3, recordedMassKg: 2500, otherUnits: [] }]
      },
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z'
    };

    await page.route('**/api/v1/zones**', async (route) => {
      await route.fulfill(jsonEnvelope([{ id: 'zone-1', code: 'V01', name: 'Vườn mẫu', areaM2: 12500, status: 'ACTIVE' }]));
    });

    await page.route('**/api/v1/users**', async (route) => {
      const request = route.request();
      const method = request.method();
      const path = new URL(request.url()).pathname;
      if (path.endsWith('/roles') && method === 'GET') {
        await route.fulfill(jsonEnvelope([{ id: 'role-farmer', slug: 'FARMER', name: 'Nông dân' }]));
        return;
      }
      if (method === 'GET') {
        await route.fulfill(jsonEnvelope({ data: [farmer], meta: { page: 1, limit: 100, total: 1 } }));
        return;
      }
      const body = method === 'DELETE' ? undefined : request.postDataJSON() as Record<string, unknown>;
      mutations.push({ method, body });
      if (method === 'POST') farmer = { ...farmer, id: 'farmer-e2e', ...body, roles: ['FARMER'], farmerProfile: { assignedZoneIds: (body?.assignedZoneIds as string[]) ?? [] } } as typeof farmer;
      if (method === 'PATCH') farmer = { ...farmer, ...body, farmerProfile: { assignedZoneIds: (body?.assignedZoneIds as string[]) ?? farmer.farmerProfile.assignedZoneIds } } as typeof farmer;
      if (method === 'DELETE') farmer = { ...farmer, status: 'INACTIVE' };
      await route.fulfill(jsonEnvelope(farmer));
    });

    await seedAuthenticatedSession(page, htxAdminUser);
    await page.goto(`${htxUrl}/dashboard/farmers`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('page-title')).toContainText('Nông dân', { timeout: 45_000 });
    await expect(page.getByTestId('farmer-production-summary')).toContainText('1,25 ha');
    await expect(page.getByTestId('farmer-production-summary')).toContainText('Xoài · Cát Chu');
    await expect(page.getByTestId('farmer-production-summary')).toContainText('2,5 t');
    await page.getByTestId('farmer-create-button').click();
    await page.getByTestId('farmer-name-input').fill('Nông dân E2E');
    await page.getByTestId('farmer-email-input').fill('farmer-e2e@example.com');
    await page.getByTestId('farmer-password-input').fill('StrongPass123!');
    await page.getByTestId('farmer-phone-input').fill('0912345678');
    await page.getByTestId('farmer-zone-checkbox-zone-1').check();
    await page.getByRole('button', { name: 'Lưu tài khoản' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'POST').length).toBe(1);
    await page.getByRole('button', { name: 'Sửa', exact: true }).click();
    await page.getByTestId('farmer-name-input').fill('Nông dân E2E đã sửa');
    await page.getByRole('button', { name: 'Lưu tài khoản' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(1);
    await page.getByRole('button', { name: 'Khóa' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'PATCH').length).toBe(2);
    await page.getByRole('button', { name: 'Ngừng' }).click();
    await expect.poll(() => mutations.filter((item) => item.method === 'DELETE').length).toBe(1);
    expect(mutations.map((item) => item.method)).toEqual(['POST', 'PATCH', 'PATCH', 'DELETE']);
    expect(mutations[0].body).toMatchObject({ fullName: 'Nông dân E2E', email: 'farmer-e2e@example.com', role: 'FARMER', assignedZoneIds: ['zone-1'] });
    expect(mutations[1].body).toMatchObject({ fullName: 'Nông dân E2E đã sửa', assignedZoneIds: ['zone-1'] });
    expect(mutations[2].body).toMatchObject({ status: 'LOCKED' });
  });
});

function jsonEnvelope(data: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
