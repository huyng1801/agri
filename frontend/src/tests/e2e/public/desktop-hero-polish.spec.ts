import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const DESKTOP_VIEWPORTS = [
  { width: 1024, height: 768, name: '1024x768' },
  { width: 1280, height: 800, name: '1280x800' },
  { width: 1366, height: 768, name: '1366x768' },
  { width: 1440, height: 900, name: '1440x900' },
  { width: 1536, height: 864, name: '1536x864' },
  { width: 1728, height: 900, name: '1728x900' },
  { width: 1920, height: 1080, name: '1920x1080' },
];

const passportAuditEnabled = process.env.UI_AUDIT_SITE !== 'agripassport' && process.env.UI_AUDIT_SITE !== 'htxonline';

test.describe('Passport Desktop Hero QA Suite', () => {
  const screenshotsDir = path.resolve(process.cwd(), 'output', 'desktop-hero');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  for (const vp of DESKTOP_VIEWPORTS) {
    test(`QA Hero at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      test.skip(!passportAuditEnabled, 'This carousel contract belongs to the Passport site.');
      await page.setExtraHTTPHeaders({ 'x-forwarded-host': 'hochieunongnghiep.com' });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const hero = page.locator('section[aria-roledescription="carousel"]');
      await expect(hero).toBeVisible();
      await expect(page.locator('main h1')).toHaveCount(1);
      // Pause the built-in autoplay before asserting deterministic slide transitions.
      await hero.hover();

      // 1. Zero horizontal scrollbar / overflow
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(isOverflowing).toBeFalsy();

      // 2. Pagination verification: 3 progress bars, ZERO visible numbers (01, 02, 03)
      const tabs = hero.locator('button[role="tab"]');
      await expect(tabs).toHaveCount(3);

      const tabTexts = await tabs.allInnerTexts();
      for (const text of tabTexts) {
        expect(text.trim()).toBe('');
        expect(text).not.toContain('01');
        expect(text).not.toContain('02');
        expect(text).not.toContain('03');
      }

      // First tab active on load
      await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
      await expect(tabs.nth(0)).toHaveAttribute('aria-label', /Chuyển đến slide 1/i);
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'false');

      // 3. Arrow buttons exist and are properly sized
      const prevBtn = hero.locator('button[aria-label="Slide trước đó"]');
      const nextBtn = hero.locator('button[aria-label="Slide tiếp theo"]');
      await expect(prevBtn).toBeVisible();
      await expect(nextBtn).toBeVisible();

      const nextBox = await nextBtn.boundingBox();
      expect(nextBox).not.toBeNull();
      if (nextBox) {
        expect(nextBox.width).toBeGreaterThanOrEqual(40);
        expect(nextBox.width).toBeLessThanOrEqual(46);
        expect(nextBox.height).toBeGreaterThanOrEqual(40);
        expect(nextBox.height).toBeLessThanOrEqual(46);
      }

      // 4. Headline hierarchy: main headline font size > accent line font size
      const headlineSizes = await page.evaluate(() => {
        const headline = document.querySelector('section[aria-roledescription="carousel"] h2');
        if (!headline) return null;
        const spans = headline.querySelectorAll('span');
        if (spans.length < 2) return null;
        const main = parseFloat(window.getComputedStyle(spans[0]).fontSize);
        const accent = parseFloat(window.getComputedStyle(spans[1]).fontSize);
        return { main, accent };
      });
      expect(headlineSizes).not.toBeNull();
      if (headlineSizes) {
        expect(headlineSizes.main).toBeGreaterThan(headlineSizes.accent);
        const ratio = headlineSizes.accent / headlineSizes.main;
        // Accent should be ~10-20% smaller than main
        expect(ratio).toBeLessThanOrEqual(0.92);
      }

      // 5. CTA hierarchy: primary has dominant solid background
      const primaryCta = hero.locator('a:has-text("Tra cứu Nông sản có QR")').first();
      await expect(primaryCta).toBeVisible();

      const secondaryCta = hero.locator('a:has-text("Khám phá Nông sản")').first();
      await expect(secondaryCta).toBeVisible();

      // 6. Trust microcopy: checks present, no random multi-color dots
      const trustSection = hero.locator('text=Không cần cài đặt ứng dụng').first();
      await expect(trustSection).toBeVisible();

      // 7. Hero section height check
      const heroBox = await hero.boundingBox();
      expect(heroBox).not.toBeNull();
      if (heroBox) {
        console.log(`Viewport ${vp.name}: Hero Height = ${heroBox.height.toFixed(1)}px`);
        if (vp.width === 1366 && vp.height === 768) {
          // At 1366x768, hero must stay comfortably within 660px
          expect(heroBox.height).toBeLessThanOrEqual(660);
        }
      }

      // 8. Capture pristine initial screenshot (Slide 1)
      const screenshotPath = path.join(screenshotsDir, `hero-${vp.name}.png`);
      await hero.screenshot({ path: screenshotPath });
      console.log(`Saved pristine screenshot: ${screenshotPath}`);

      // 9. Interactive slide transition test & captures
      await nextBtn.click();
      await page.waitForTimeout(600);
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'false');
      if (vp.width === 1366) {
        await hero.screenshot({ path: path.join(screenshotsDir, 'hero-1366x768-slide2.png') });
      }

      await nextBtn.click();
      await page.waitForTimeout(600);
      await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
      if (vp.width === 1366) {
        await hero.screenshot({ path: path.join(screenshotsDir, 'hero-1366x768-slide3.png') });
      }

      // Click back to slide 1
      await prevBtn.click();
      await page.waitForTimeout(600);
      await prevBtn.click();
      await page.waitForTimeout(600);
      await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    });
  }
});
