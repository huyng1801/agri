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

  test('@admin @form system settings tabs save and restore every configuration form', async ({ page }) => {
    const { adminUrl } = baseUrls();
    const mutations: Array<{ key: string; value: Record<string, unknown> }> = [];
    let settingsGets = 0;
    const records: Record<string, Record<string, unknown>> = {
      'system.profile': { appName: 'Agri Passport', supportEmail: 'support@example.com', timezone: 'Asia/Ho_Chi_Minh' },
      'system.email': { fromName: 'HTXONLINE', fromEmail: 'no-reply@example.com', smtpHost: 'smtp.example.com', smtpPort: '587' },
      'system.r2': { bucket: 'agri-passport', publicBaseUrl: 'https://cdn.example.com', note: 'Metadata R2' },
      'system.security': { sessionHours: '24', corsOrigins: 'https://agripassport.com', rateLimitMax: '120' },
      'system.notifications': { orderAlerts: true, invoiceAlerts: false, contactAlerts: true },
      'system.backup': { enabled: true, schedule: '0 2 * * *', retentionDays: '30' }
    };
    await page.route('**/api/v1/settings/test-r2', async (route) => {
      await route.fulfill(jsonEnvelope({ ok: true, message: 'Kết nối R2 thành công' }));
    });
    await page.route('**/api/v1/settings', async (route) => {
      if (route.request().method() === 'GET') {
        settingsGets += 1;
        await route.fulfill(jsonEnvelope(Object.entries(records).map(([key, value]) => ({ key, value, description: key }))));
        return;
      }
      const payload = route.request().postDataJSON() as { key: string; value: Record<string, unknown> };
      mutations.push(payload);
      records[payload.key] = payload.value;
      await route.fulfill(jsonEnvelope({ key: payload.key, value: payload.value, description: payload.key }));
    });

    await seedAuthenticatedSession(page, superAdminUser);
    await page.goto(`${adminUrl}/dashboard/settings`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Cài đặt hệ thống' })).toBeVisible({ timeout: 45_000 });

    const saveAndWaitForRefetch = async (expectedMutations: number) => {
      await page.getByRole('button', { name: 'Lưu', exact: true }).click();
      await expect.poll(() => mutations.length).toBe(expectedMutations);
      await expect.poll(() => settingsGets).toBeGreaterThan(expectedMutations);
    };

    await page.getByTestId('settings-tab-email').click();
    await page.getByLabel('Tên người gửi').fill('E2E Sender');
    await page.getByLabel('Email gửi').fill('sender-e2e@example.com');
    await page.getByLabel('Máy chủ SMTP').fill('smtp-e2e.example.com');
    await page.getByLabel('Cổng SMTP').fill('2525');
    await saveAndWaitForRefetch(1);
    await expect(page.getByLabel('Tên người gửi')).toHaveValue('E2E Sender');
    await page.getByLabel('Tên người gửi').fill('HTXONLINE');
    await page.getByLabel('Email gửi').fill('no-reply@example.com');
    await page.getByLabel('Máy chủ SMTP').fill('smtp.example.com');
    await page.getByLabel('Cổng SMTP').fill('587');
    await saveAndWaitForRefetch(2);

    await page.getByTestId('settings-tab-r2').click();
    await page.getByLabel('Bucket lưu trữ').fill('e2e-bucket');
    await page.getByLabel('URL công khai gốc').fill('https://e2e.example.com');
    await page.getByLabel('Ghi chú').fill('E2E metadata');
    await saveAndWaitForRefetch(3);
    await page.getByTestId('settings-test-r2-button').click();
    await expect(page.getByText('Kết nối R2 thành công')).toBeVisible();
    await page.getByLabel('Bucket lưu trữ').fill('agri-passport');
    await page.getByLabel('URL công khai gốc').fill('https://cdn.example.com');
    await page.getByLabel('Ghi chú').fill('Metadata R2');
    await saveAndWaitForRefetch(4);

    await page.getByTestId('settings-tab-security').click();
    await page.getByLabel('Phiên đăng nhập (giờ)').fill('48');
    await page.getByLabel('Giới hạn request tối đa').fill('240');
    await page.getByLabel('Nguồn CORS').fill('https://e2e.example.com');
    await saveAndWaitForRefetch(5);
    await page.getByLabel('Phiên đăng nhập (giờ)').fill('24');
    await page.getByLabel('Giới hạn request tối đa').fill('120');
    await page.getByLabel('Nguồn CORS').fill('https://agripassport.com');
    await saveAndWaitForRefetch(6);

    await page.getByTestId('settings-tab-notifications').click();
    const notificationChecks = page.getByRole('checkbox');
    await notificationChecks.nth(0).uncheck();
    await notificationChecks.nth(1).check();
    await notificationChecks.nth(2).uncheck();
    await saveAndWaitForRefetch(7);
    await notificationChecks.nth(0).check();
    await notificationChecks.nth(1).uncheck();
    await notificationChecks.nth(2).check();
    await saveAndWaitForRefetch(8);

    await page.getByTestId('settings-tab-backup').click();
    const backupEnabled = page.getByRole('checkbox');
    await backupEnabled.uncheck();
    await page.getByLabel('Lịch cron').fill('30 3 * * *');
    await page.getByLabel('Giữ (ngày)').fill('14');
    await saveAndWaitForRefetch(9);
    await backupEnabled.check();
    await page.getByLabel('Lịch cron').fill('0 2 * * *');
    await page.getByLabel('Giữ (ngày)').fill('30');
    await saveAndWaitForRefetch(10);

    expect(mutations.map((mutation) => mutation.key)).toEqual([
      'system.email', 'system.email', 'system.r2', 'system.r2', 'system.security',
      'system.security', 'system.notifications', 'system.notifications', 'system.backup', 'system.backup'
    ]);
  });
});

function jsonEnvelope(data: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data })
  };
}
