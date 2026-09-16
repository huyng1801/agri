import { expect, test } from '@playwright/test';

const publicSites = [
  {
    host: 'hochieunongnghiep.com',
    siteKey: 'passport',
    homeHeading: 'Hộ chiếu nông nghiệp',
    newsHeading: 'Tin tức truy xuất & hồ sơ số'
  },
  {
    host: 'agripassport.com',
    siteKey: 'agripassport',
    homeHeading: 'AGRIPASSPORT',
    newsHeading: 'Tin tức dữ liệu nông nghiệp'
  },
  {
    host: 'htxonline.vn',
    siteKey: 'htxonline',
    homeHeading: 'HTXONLINE giúp vận hành rõ ràng hơn.',
    newsHeading: 'Tin tức vận hành hợp tác xã'
  }
] as const;

test.describe('public site source and content separation', () => {
  test.describe.configure({ timeout: 180_000 });

  test('renders the dedicated homepage for each public host', async ({ page }) => {
    for (const site of publicSites) {
      await page.setExtraHTTPHeaders({ 'x-forwarded-host': site.host });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await expect(page.locator('[data-public-site]')).toHaveAttribute('data-public-site', site.siteKey);
      await expect(page.locator(`main[data-site-home="${site.siteKey}"]`)).toHaveCount(1);
      await expect(page.getByRole('heading', { name: site.homeHeading, exact: false }).first()).toBeVisible();

      for (const otherSite of publicSites) {
        if (otherSite.siteKey === site.siteKey) continue;
        await expect(page.locator(`main[data-site-home="${otherSite.siteKey}"]`)).toHaveCount(0);
      }
    }
  });

  test('renders the dedicated news entrypoint for each public host', async ({ page }) => {
    for (const site of publicSites) {
      await page.setExtraHTTPHeaders({ 'x-forwarded-host': site.host });
      await page.goto('/tin-tuc', { waitUntil: 'domcontentloaded' });

      await expect(page.locator('[data-public-site]')).toHaveAttribute('data-public-site', site.siteKey);
      await expect(page.getByRole('heading', { name: site.newsHeading, exact: true })).toBeVisible();
      await expect(page.getByText(site.newsHeading, { exact: true })).toBeVisible();

      const mainText = await page.locator('main').innerText();
      expect(mainText).toContain(site.newsHeading);
      expect(mainText).not.toContain(
        site.siteKey === 'passport' ? 'Tin tức vận hành hợp tác xã' : site.siteKey === 'htxonline' ? 'Tin tức truy xuất & hồ sơ số' : 'Tin tức vận hành hợp tác xã'
      );
    }
  });
});
