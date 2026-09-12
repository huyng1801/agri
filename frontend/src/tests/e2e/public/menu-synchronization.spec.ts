import { expect, test, type Locator } from '@playwright/test';

const publicSites = [
  { host: 'hochieunongnghiep.com', siteKey: 'passport', labels: ['Trang chủ', 'Giới thiệu', 'Hộ chiếu cây', 'Đối tác', 'Tin tức', 'Liên hệ'] },
  { host: 'agripassport.com', siteKey: 'agripassport', labels: ['Trang chủ', 'Về Agripassport', 'Sản phẩm', 'Hợp tác xã', 'Truy xuất QR', 'Tin tức', 'Liên hệ'] },
  { host: 'htxonline.vn', siteKey: 'htxonline', labels: ['Trang chủ', 'Sản phẩm', 'HTX', 'Dịch vụ', 'Tin tức', 'Liên hệ'] }
] as const;

async function navigationLinks(locator: Locator) {
  return locator.evaluateAll((links) => links.map((link) => ({
    label: link.textContent?.trim() || '',
    href: link.getAttribute('href') || ''
  })));
}

test.describe('Desktop and mobile menu synchronization', () => {
  for (const site of publicSites) {
    test(`${site.siteKey} uses the same ordered menu on desktop and mobile`, async ({ page }) => {
      await page.setExtraHTTPHeaders({ 'x-forwarded-host': site.host });

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const desktopNav = page.locator('nav[aria-label="Menu chính"]');
      const desktopLinks = await navigationLinks(desktopNav.locator(':scope > a, :scope > div > a'));

      await page.setViewportSize({ width: 390, height: 844 });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('header').getByRole('button', { name: 'Mở menu điều hướng' }).click();
      const drawer = page.getByRole('dialog', { name: 'Menu điều hướng' });
      await expect(drawer).toBeVisible();
      const mobileNav = drawer.getByTestId(site.siteKey === 'passport' ? 'passport-mobile-nav' : 'public-mobile-nav');
      await expect(mobileNav).toBeVisible();
      // The dropdown is closed here, so all links are the shared top-level entries.
      const mobileLinks = await navigationLinks(mobileNav.locator('a'));

      expect(desktopLinks.map((link) => link.label)).toEqual(site.labels);
      expect(mobileLinks.map((link) => link.label)).toEqual(site.labels);
      expect(mobileLinks.map((link) => link.href)).toEqual(desktopLinks.map((link) => link.href));
      expect(await mobileNav.locator('a').evaluateAll((links) => links.every((link) => link.getBoundingClientRect().height >= 44))).toBe(true);
    });
  }
});
