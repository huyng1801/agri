import { expect, test } from '@playwright/test';
import { baseUrls, seedAuthenticatedSession, superAdminUser } from '../helpers/auth';

test.describe('admin public settings', () => {
  test('@admin @form public content settings save and restore the original profile', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ key: string; value: Record<string, unknown> }> = [];
    let profileGets = 0;
    let profile: Record<string, unknown> = {
      appName: 'HTXONLINE',
      hotline: '0907001200',
      hotlineDisplay: '0907 001 200',
      supportEmail: 'Agripassport@gmail.com',
      address: 'Đồng Tháp',
      mapEmbedUrl: '',
      messengerUrl: '',
      logoUrl: '',
      faqs: [{ question: 'Câu hỏi mẫu?', answer: 'Trả lời mẫu.' }],
      pageContent: { homeTitle: 'Trang chủ mẫu', homeDescription: 'Mô tả mẫu.' }
    };
    await page.route('**/api/v1/settings', async (route) => {
      if (route.request().method() === 'GET') {
        profileGets += 1;
        await route.fulfill(jsonEnvelope([{ key: 'public.siteProfile', value: profile, description: 'Thông tin công khai của sàn' }]));
        return;
      }
      const payload = route.request().postDataJSON() as { key: string; value: Record<string, unknown> };
      mutations.push(payload);
      profile = payload.value;
      await route.fulfill(jsonEnvelope({ key: payload.key, value: profile, description: 'Thông tin công khai của sàn' }));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/settings`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('settings-tab-public').click();
    await page.getByLabel('Tên hiển thị').fill('Agri Public E2E');
    await page.getByLabel('Hotline hiển thị').fill('0908 888 999');
    await page.getByLabel('Email liên hệ').fill('public-e2e@example.com');
    await page.getByLabel('Địa chỉ').fill('Cao Lãnh, Đồng Tháp');
    await page.getByLabel('FAQ (hỏi|đáp mỗi dòng)').fill('HTX là gì?|Nền tảng số cho HTX.');
    await page.getByLabel('Tiêu đề trang chủ').fill('Hero E2E');
    await page.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect.poll(() => mutations.length).toBe(1);
    await expect.poll(() => profileGets).toBeGreaterThan(1);
    await expect(page.getByLabel('Tên hiển thị')).toHaveValue('Agri Public E2E');
    expect(mutations[0]).toMatchObject({ key: 'public.siteProfile', value: { appName: 'Agri Public E2E', hotlineDisplay: '0908 888 999', supportEmail: 'public-e2e@example.com', address: 'Cao Lãnh, Đồng Tháp' } });

    await page.getByLabel('Tên hiển thị').fill('HTXONLINE');
    await page.getByLabel('Hotline hiển thị').fill('0907 001 200');
    await page.getByLabel('Email liên hệ').fill('Agripassport@gmail.com');
    await page.getByLabel('Địa chỉ').fill('Đồng Tháp');
    await page.getByLabel('FAQ (hỏi|đáp mỗi dòng)').fill('Câu hỏi mẫu?|Trả lời mẫu.');
    await page.getByLabel('Tiêu đề trang chủ').fill('Trang chủ mẫu');
    await page.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect.poll(() => mutations.length).toBe(2);
    expect(mutations[1].value).toMatchObject({ appName: 'HTXONLINE', hotlineDisplay: '0907 001 200', supportEmail: 'Agripassport@gmail.com', address: 'Đồng Tháp' });
  });
});

function jsonEnvelope(data: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
