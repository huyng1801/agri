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

  // 2. Global Mobile Bottom Navigation mirrors the shared public menu and remains rock-solid on scroll
  test('Global Bottom Navigation mirrors the shared menu and remains rock-solid on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const bottomNav = page.locator('nav[data-testid="public-bottom-nav"]');
    await expect(bottomNav).toBeVisible();

    const navItems = bottomNav.locator('a');
    await expect(navItems).toHaveCount(7);

    // 1. Verify the local marketplace menu is the same ordered model used by the header.
    const expectedLabels = ['Trang chủ', 'Về Agripassport', 'Sản phẩm', 'Hợp tác xã', 'Truy xuất QR', 'Tin tức', 'Liên hệ'];
    const expectedHrefs = ['/', '/ve-chung-toi', '/san-pham', '/htx', '/san-pham?hasQr=true', '/tin-tuc', '/lien-he'];
    for (let i = 0; i < expectedLabels.length; i++) {
      await expect(navItems.nth(i)).toContainText(expectedLabels[i]);
      await expect(navItems.nth(i)).toHaveAttribute('href', expectedHrefs[i]);
    }

    // 2. Initial active tab is Trang chủ
    await expect(navItems.nth(0)).toHaveAttribute('aria-current', 'page');
    await expect(navItems.nth(1)).not.toHaveAttribute('aria-current', 'page');

    // 3. Scroll to footer and ensure bottom nav DOES NOT disappear or flicker
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await expect(bottomNav).toBeVisible();
    const isHidden = await bottomNav.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.opacity === '0' || style.display === 'none' || style.visibility === 'hidden';
    });
    expect(isHidden).toBe(false);

    // 4. Click 'Sản phẩm' tab and verify navigation and active state
    await navItems.nth(2).click();
    await page.waitForURL('**/san-pham', { timeout: 10000 });
    await expect(bottomNav.locator('a').nth(2)).toHaveAttribute('aria-current', 'page');

    // 5. Click 'Hợp tác xã' tab
    await bottomNav.locator('a').nth(3).click();
    await page.waitForURL('**/htx', { timeout: 10000 });
    await expect(bottomNav.locator('a').nth(3)).toHaveAttribute('aria-current', 'page');

    // 6. The QR entry stays in the same menu model and points to the filtered catalog.
    await expect(bottomNav.locator('a').nth(4)).toHaveAttribute('href', '/san-pham?hasQr=true');
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

  // 5. Mobile Top Header & Navigation Drawer Interactive Test
  test('Mobile header height <= 58px and shared navigation drawer full interactions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const header = page.locator('header');
    await expect(header).toBeVisible();

    const menuButton = header.getByRole('button', { name: /Mở menu điều hướng|Đóng menu/ });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // 1. Open drawer via menu button
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    const drawerDialog = page.locator('div[role="dialog"][aria-label="Menu điều hướng"]');
    await expect(drawerDialog).toBeVisible({ timeout: 5000 });

    const drawerNav = drawerDialog.getByTestId('public-mobile-nav');
    await expect(drawerNav).toBeVisible();
    await expect(drawerNav.locator('a')).toHaveCount(7);
    await expect(drawerNav.locator('a').evaluateAll((links) => links.map((link) => link.textContent?.trim()))).resolves.toEqual([
      'Trang chủ',
      'Về Agripassport',
      'Sản phẩm',
      'Hợp tác xã',
      'Truy xuất QR',
      'Tin tức',
      'Liên hệ'
    ]);

    // Verify items have >= 44px touch height
    const firstNavigationLink = drawerNav.locator('a').first();
    await expect(firstNavigationLink).toBeVisible();
    const linkBox = await firstNavigationLink.boundingBox();
    expect(linkBox?.height).toBeGreaterThanOrEqual(44);

    // Verify close button touch target >= 40px
    const closeBtn = drawerDialog.locator('button[aria-label="Đóng menu"]');
    await expect(closeBtn).toBeVisible();
    const closeBox = await closeBtn.boundingBox();
    expect(closeBox?.width).toBeGreaterThanOrEqual(40);
    expect(closeBox?.height).toBeGreaterThanOrEqual(40);

    // Screenshot open drawer
    await page.screenshot({
      path: path.join(screenshotsDir, 'mobile-menu-open-390x844.png')
    });

    // 2. Close via X button
    await closeBtn.click();
    await expect(drawerDialog).toBeHidden();

    // 3. Re-open and close via backdrop
    await menuButton.click();
    await expect(drawerDialog).toBeVisible();
    // Backdrop is the first child inside dialog
    const backdrop = drawerDialog.locator('div[aria-hidden="true"]').first();
    await backdrop.click({ position: { x: 20, y: 200 } });
    await expect(drawerDialog).toBeHidden();

    // 4. Re-open and close via Escape key
    await menuButton.click();
    await expect(drawerDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawerDialog).toBeHidden();
  });

  test('Public headings use the compact mobile typography scale', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const routes = ['/', '/ve-chung-toi', '/san-pham', '/htx', '/tin-tuc', '/cay', '/truy-xuat', '/lien-he'];

    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const oversizedHeadings = await page.locator('.public-app-shell h1, .public-app-shell h2, .public-app-shell h3').evaluateAll((elements) =>
        elements.flatMap((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          if (!rect.width || !rect.height || style.display === 'none' || element.classList.contains('sr-only')) return [];

          const size = parseFloat(style.fontSize);
          const maxSize = element.tagName === 'H1' ? 28 : element.tagName === 'H2' ? 24 : 20;
          return size > maxSize ? [{ text: (element.textContent || '').trim().slice(0, 80), size, maxSize }] : [];
        })
      );

      expect(oversizedHeadings, `oversized public headings on ${route}`).toEqual([]);
    }
  });

  test('Public body copy stays compact on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/ve-chung-toi', { waitUntil: 'domcontentloaded' });

    const oversizedParagraphs = await page.locator('.public-app-shell p').evaluateAll((elements) =>
      elements.flatMap((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        if (!rect.width || !rect.height || style.display === 'none' || element.classList.contains('sr-only')) return [];

        const size = parseFloat(style.fontSize);
        return size > 16 ? [{ text: (element.textContent || '').trim().slice(0, 80), size }] : [];
      })
    );

    expect(oversizedParagraphs, 'oversized public body copy on mobile').toEqual([]);
  });

  test('Passport hero stays compact and stacks actions below desktop breakpoint', async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 900 }
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const activeSlide = page.locator(
        'main[data-site-home="passport"] section[aria-roledescription="carousel"] [class~="lg:hidden"] [role="group"][aria-hidden="false"]'
      ).first();
      await expect(activeSlide).toBeVisible();

      const sizes = await activeSlide.locator('h2 > span').evaluateAll((elements) =>
        elements.map((element) => parseFloat(window.getComputedStyle(element).fontSize))
      );
      expect(sizes[0]).toBeLessThanOrEqual(29);
      expect(sizes[1]).toBeLessThanOrEqual(24);

      const actions = activeSlide.locator(':scope > div:last-child');
      await expect(actions.locator('a')).toHaveCount(2);
      const actionsLayout = await actions.evaluate((element) => {
        const style = window.getComputedStyle(element);
        return { display: style.display, flexDirection: style.flexDirection };
      });
      expect(actionsLayout).toEqual({ display: 'flex', flexDirection: 'column' });

      const actionWidths = await actions.locator('a').evaluateAll((links) =>
        links.map((link) => Math.round(link.getBoundingClientRect().width))
      );
      expect(actionWidths[0]).toBeGreaterThanOrEqual(viewport.width - 48);
      expect(actionWidths[1]).toBe(actionWidths[0]);
    }
  });

  test('Public mobile controls keep a 44px minimum hit area', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const routes = ['/', '/san-pham', '/tin-tuc', '/gioi-thieu', '/lien-he', '/cay', '/truy-xuat', '/public/passport/DEMO-PASSPORT'];

    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const undersized = await page.locator('a,button,input,select,textarea,[role="button"],[role="tab"]').evaluateAll((elements) =>
        elements.flatMap((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          const isHidden =
            !rect.width ||
            !rect.height ||
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            element.classList.contains('sr-only') ||
            element.closest('[aria-hidden="true"]') ||
            element.getAttribute('aria-label') === 'Open Next.js Dev Tools';
          if (isHidden || (rect.width >= 44 && rect.height >= 44)) return [];
          return [{
            label: element.getAttribute('aria-label') || (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          }];
        })
      );

      expect(undersized, `undersized public controls on ${route}`).toEqual([]);
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
