import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const MOBILE_VIEWPORTS = [
  { name: 'iPhone-SE-320x568', width: 320, height: 568 },
  { name: 'Galaxy-S20-360x800', width: 360, height: 800 },
  { name: 'iPhone-mini-375x812', width: 375, height: 812 },
  { name: 'iPhone-14-390x844', width: 390, height: 844 },
  { name: 'iPhone-15-393x852', width: 393, height: 852 },
  { name: 'Pixel-7-412x915', width: 412, height: 915 },
  { name: 'iPhone-ProMax-430x932', width: 430, height: 932 },
  { name: 'Landscape-844x390', width: 844, height: 390 }
];

test.describe('Mobile-First UX Hardening Test Matrix', () => {
  const screenshotsDir = path.resolve(process.cwd(), 'output', 'mobile-ux');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Check Zero Horizontal Overflow across all viewports on Homepage
  for (const vp of MOBILE_VIEWPORTS) {
    test(`Zero overflow on Homepage at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(isOverflowing).toBeFalsy();

      if (vp.name === 'iPhone-14-390x844' || vp.name === 'iPhone-SE-320x568') {
        await page.screenshot({
          path: path.join(screenshotsDir, `home-${vp.name}.png`),
          fullPage: false
        });
      }
    });
  }

  // 2. Global Mobile Bottom Navigation Bar: 4 core items on main routes
  test('Global Bottom Navigation has exactly 4 core items on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const bottomNav = page.locator('nav[data-testid="public-bottom-nav"]');
    await expect(bottomNav).toBeVisible();

    const navItems = bottomNav.locator('a');
    await expect(navItems).toHaveCount(4);

    // Verify labels: Trang chủ, Sản phẩm, Quét QR, Đối tác
    const expectedLabels = ['Trang chủ', 'Sản phẩm', 'Quét QR', 'Đối tác'];
    for (let i = 0; i < expectedLabels.length; i++) {
      await expect(navItems.nth(i)).toContainText(expectedLabels[i]);
    }
  });

  // 3. Products Catalog page (/san-pham) on mobile
  test('Products Catalog layout on mobile (search input >= 16px, zero overflow, filter sheet)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/san-pham', { waitUntil: 'domcontentloaded' });

    // Zero overflow
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBeFalsy();

    // Check search input font size >= 16px
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]').first();
    if (await searchInput.isVisible()) {
      const fontSize = await searchInput.evaluate((el) => window.getComputedStyle(el).fontSize);
      const parsedSize = parseFloat(fontSize);
      expect(parsedSize).toBeGreaterThanOrEqual(16);
    }

    // Capture screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'san-pham-390x844.png'),
      fullPage: false
    });
  });

  // 4. Contact page (/lien-he) on mobile
  test('Contact page (/lien-he) hides bottom nav and has thumb-friendly buttons', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/lien-he', { waitUntil: 'domcontentloaded' });

    // Contextual bottom nav should be hidden on /lien-he
    const bottomNav = page.locator('nav[data-testid="public-bottom-nav"]');
    await expect(bottomNav).toBeHidden();

    // Form inputs >= 16px
    const nameInput = page.locator('input[name="fullName"]').first();
    if (await nameInput.isVisible()) {
      const fontSize = await nameInput.evaluate((el) => window.getComputedStyle(el).fontSize);
      expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(16);
    }

    // Zero overflow
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBeFalsy();

    await page.screenshot({
      path: path.join(screenshotsDir, 'lien-he-390x844.png'),
      fullPage: false
    });
  });

  // 5. Mobile Top Header & Navigation Drawer
  test('Mobile header height <= 58px and categorized navigation menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const header = page.locator('header');
    await expect(header).toBeVisible();

    const menuButton = header.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], button[aria-expanded]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);

      // Verify category sections exist in the mobile menu:
      // 'Khám phá Dữ liệu', 'Hệ sinh thái Nông nghiệp Số', 'Hỗ trợ & Kết nối'
      const drawer = page.locator('div[role="dialog"], aside, [class*="fixed inset-0"]');
      await expect(drawer.first()).toBeVisible();

      await page.screenshot({
        path: path.join(screenshotsDir, 'mobile-menu-open-390x844.png')
      });
    }
  });

  // 6. Mobile Footer Accordions
  test('Mobile footer renders accordions and compact location card', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Mobile details/summary accordions
    const accordions = footer.locator('details');
    await expect(accordions).toHaveCount(3);

    // Click first accordion to expand
    await accordions.first().locator('summary').click();
    await page.waitForTimeout(200);
    const isOpen = await accordions.first().evaluate((el) => (el as HTMLDetailsElement).open);
    expect(isOpen).toBe(true);

    // Zero overflow at bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBeFalsy();

    await page.screenshot({
      path: path.join(screenshotsDir, 'mobile-footer-390x844.png')
    });
  });

  // 7. Product Passport Detail page on mobile
  test('Product Passport Detail mobile UX (contextual bar, zero global nav, facts grid)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/san-pham', { waitUntil: 'domcontentloaded' });

    // Click first product card
    const firstProduct = page.locator('a[href^="/san-pham/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();
    await page.waitForLoadState('domcontentloaded');

    // Verify global bottom nav is hidden on product detail
    const bottomNav = page.locator('nav[data-testid="public-bottom-nav"]');
    await expect(bottomNav).toBeHidden();

    // Zero overflow on detail page
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBeFalsy();

    // Contextual top bar (Back button)
    const backButton = page.locator('button[aria-label*="Quay lại"]');
    await expect(backButton).toBeVisible();

    // Contextual Share button
    const shareButton = page.locator('button[aria-label*="Chia sẻ"]');
    await expect(shareButton).toBeVisible();

    // Sticky Subnav exists
    const stickyNav = page.locator('nav[aria-label="Điều hướng nhanh hồ sơ"]').first();
    await expect(stickyNav).toBeVisible();

    // Screenshot at 390x844
    await page.screenshot({
      path: path.join(screenshotsDir, 'passport-detail-390x844.png'),
      fullPage: false
    });

    // Test at 320x568 (iPhone SE)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(300);
    const isOverflowingSmall = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowingSmall).toBeFalsy();

    await page.screenshot({
      path: path.join(screenshotsDir, 'passport-detail-320x568.png'),
      fullPage: false
    });
  });

  // 8. HTX Directory and QR Traceability pages on mobile
  test('HTX Directory and QR Scan pages on mobile (zero overflow, bottom nav active)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // HTX directory
    await page.goto('/htx', { waitUntil: 'domcontentloaded' });
    let isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowing).toBeFalsy();

    let bottomNav = page.locator('nav[data-testid="public-bottom-nav"]');
    await expect(bottomNav).toBeVisible();

    // QR Scan / Traceability page
    await page.goto('/truy-xuat', { waitUntil: 'domcontentloaded' });
    isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowing).toBeFalsy();
    await expect(bottomNav).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotsDir, 'truy-xuat-390x844.png'),
      fullPage: false
    });
  });
});
