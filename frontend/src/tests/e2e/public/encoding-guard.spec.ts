import { expect, test, type Page } from '@playwright/test';
import { baseUrls, htxAdminUser, seedAuthenticatedSession, superAdminUser } from '../helpers/auth';

const suspiciousTextPattern = /(?:\u00c3|\u00c2|\u00c4|\u00c5|\u00c6)[\u0080-\u00ff]|\ufffd/;
const invalidLoginMessage = 'Email ho\u1eb7c m\u1eadt kh\u1ea9u kh\u00f4ng \u0111\u00fang';
const dashboardTitle = 'T\u1ed5ng quan';
const contactErrorMessage = 'Kh\u00f4ng th\u1ec3 g\u1eedi li\u00ean h\u1ec7';
const orderLookupErrorMessage = 'Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u01a1n h\u00e0ng';

test.describe('text encoding guard', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Encoding guard runs once on desktop chromium');
  });

  test('@public public routes keep Vietnamese text intact', async ({ page }) => {
    const { publicUrl } = baseUrls();

    for (const route of ['/', '/lien-he', '/thanh-toan', '/login']) {
      await page.goto(joinUrl(publicUrl, route), { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await expectNoMojibake(page, route);
    }
  });

  test('@public login error message keeps accents intact', async ({ page }) => {
    const { publicUrl } = baseUrls();

    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: invalidLoginMessage,
          errors: []
        })
      });
    });

    await page.goto(joinUrl(publicUrl, '/login'));
    await page.getByTestId('login-email-input').fill('nobody@example.com');
    await page.getByTestId('login-password-input').fill('wrongpass123');
    await page.getByTestId('login-submit-button').click();

    await expect(page.getByText(invalidLoginMessage)).toBeVisible();
    await expectNoMojibake(page, '/login error');
  });

  test('@public contact error message keeps accents intact', async ({ page }) => {
    const { publicUrl } = baseUrls();

    await page.route('**/api/v1/contacts/public', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: contactErrorMessage,
          errors: []
        })
      });
    });

    await page.goto(joinUrl(publicUrl, '/lien-he'), { waitUntil: 'networkidle' });
    await page.getByTestId('contact-name-input').fill('Nguyen Van A');
    await page.getByTestId('contact-phone-input').fill('0912345678');
    await page.getByTestId('contact-message-input').fill('Toi muon duoc lien he tu van them ve san pham va QR.');
    await page.getByTestId('contact-submit-button').click();

    await expect(page.getByTestId('toast-error')).toContainText(contactErrorMessage);
    await expectNoMojibake(page, '/lien-he error');
  });

  test('@public order lookup error message keeps accents intact', async ({ page }) => {
    const { publicUrl } = baseUrls();

    await page.route('**/api/v1/orders/public/lookup**', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: orderLookupErrorMessage,
          errors: []
        })
      });
    });

    await page.goto(joinUrl(publicUrl, '/tra-cuu-don-hang'), { waitUntil: 'networkidle' });
    await page.getByTestId('order-code-input').fill('ORD-NOT-FOUND');
    await page.getByTestId('order-phone-input').fill('0912345678');
    await page.getByTestId('order-lookup-submit-button').click();

    await expect(page.getByTestId('toast-error')).toContainText(orderLookupErrorMessage);
    await expectNoMojibake(page, '/tra-cuu-don-hang error');
  });

  test('@public order success page keeps accents intact', async ({ page }) => {
    const { publicUrl } = baseUrls();

    await page.addInitScript(() => {
      window.localStorage.setItem(
        'htxonline_last_order',
        JSON.stringify({
          groupCode: 'ORD-GRP-E2E01',
          orders: [
            {
              orderCode: 'ORD-A',
              status: 'NEW',
              totalAmount: 100000,
              cooperative: { name: 'HTX A', code: 'htx-a' },
              buyerName: 'Khach hang',
              buyerPhone: '0912345678',
              address: '123 Duong A',
              province: 'Dong Thap',
              paymentMethod: 'COD',
              items: []
            }
          ]
        })
      );
    });

    await page.goto(joinUrl(publicUrl, '/dat-hang-thanh-cong?groupCode=ORD-GRP-E2E01'), { waitUntil: 'networkidle' });
    await expect(page.getByTestId('order-success')).toBeVisible();
    await expectNoMojibake(page, '/dat-hang-thanh-cong');
  });

  test('@dashboard admin shell keeps accents intact', async ({ page }) => {
    const { adminUrl } = baseUrls();

    await seedAuthenticatedSession(page, superAdminUser);
    await page.route('**/api/v1/reports/overview', async (route) => {
      await route.fulfill(okEnvelope({ metrics: [] }));
    });

    await page.goto(joinUrl(adminUrl, '/dashboard'), { waitUntil: 'networkidle' });
    await expect(page.getByTestId('page-title')).toContainText(dashboardTitle);
    await expectNoMojibake(page, 'admin dashboard');
  });

  test('@dashboard htx shell keeps accents intact', async ({ page }) => {
    const { htxUrl } = baseUrls();

    await seedAuthenticatedSession(page, htxAdminUser);
    await page.route('**/api/v1/reports/overview', async (route) => {
      await route.fulfill(okEnvelope({ metrics: [] }));
    });

    await page.goto(joinUrl(htxUrl, '/dashboard'), { waitUntil: 'networkidle' });
    await expect(page.getByTestId('page-title')).toContainText(dashboardTitle);
    await expectNoMojibake(page, 'htx dashboard');
  });
});

async function expectNoMojibake(page: Page, label: string) {
  const [html, text] = await Promise.all([page.content(), page.locator('body').innerText()]);
  expect.soft(html, `${label} html should not contain mojibake`).not.toMatch(suspiciousTextPattern);
  expect(text, `${label} text should not contain mojibake`).not.toMatch(suspiciousTextPattern);
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

function okEnvelope<T>(data: T) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, message: 'OK', data })
  };
}
