import { expect, test } from '@playwright/test';
import { baseUrls } from '../helpers/auth';

test.describe('public contact page', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Public contact assertions run once on desktop chromium');
  });

  test('@smoke @public contact form submits inquiry payload', async ({ page }) => {
    const { publicUrl } = baseUrls();
    const payloads: Array<Record<string, unknown>> = [];

    await page.route('**/api/v1/contacts/public', async (route) => {
      payloads.push(route.request().postDataJSON() as Record<string, unknown>);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'OK',
          data: { id: 'contact-1' }
        })
      });
    });

    await page.goto(joinUrl(publicUrl, '/lien-he'));
    await page.getByTestId('contact-name-input').fill('Nguyen Van A');
    await page.getByTestId('contact-phone-input').fill('0912345678');
    await page.getByTestId('contact-email-input').fill('buyer@example.com');
    await page.getByTestId('contact-message-input').fill('Toi can duoc tu van them ve giai phap QR truy xuat cho hop tac xa.');
    await page.getByTestId('contact-submit-button').click();

    await expect(page.getByTestId('toast-success')).toBeVisible();
    await expect.poll(() => payloads.length).toBe(1);
    expect(payloads[0]).toMatchObject({
      fullName: 'Nguyen Van A',
      phone: '0912345678',
      email: 'buyer@example.com',
      sourcePath: '/lien-he'
    });
  });
});

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}
