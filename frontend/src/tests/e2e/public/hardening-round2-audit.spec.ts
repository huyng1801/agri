import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 568, name: 'iPhone SE (320px)' },
  { width: 360, height: 800, name: 'Galaxy S20 (360px)' },
  { width: 390, height: 844, name: 'iPhone 14 (390px)' },
  { width: 768, height: 1024, name: 'iPad Mini (768px)' },
  { width: 1024, height: 768, name: 'iPad Pro (1024px)' },
  { width: 1280, height: 800, name: 'Desktop HD (1280px)' },
  { width: 1440, height: 900, name: 'Desktop 1440p' }
];

const ROUTES = [
  '/',
  '/san-pham',
  '/san-pham?page=2',
  '/san-pham/tra-xanh-shan',
  '/htx',
  '/htx/htx-ca-phe-buon-ma-thuot',
  '/lien-he',
  '/tuyen-cong-tac-vien',
  '/gioi-thieu'
];

test.describe('HARDENING ROUND 2: Production QA & Responsive Audit', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name}`, () => {
      for (const route of ROUTES) {
        test(`Route ${route} has zero horizontal overflow`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
          expect(response?.status()).toBe(200);

          // Check horizontal overflow
          const overflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
          });
          expect(overflow, `Horizontal overflow detected on ${route} at ${vp.width}px`).toBe(false);

          // Check for banned legal/brand wording
          const content = await page.content();
          expect(content.includes('Hạ tầng Dữ liệu Nông sản Quốc gia')).toBe(false);

          // Specific route checks
          if (route === '/san-pham') {
            const productCards = await page.locator('article, .product-card').count();
            // Should render max 12 items on the page
            const cardLinks = await page.evaluate(() => {
              const links = Array.from(document.querySelectorAll('a[href^="/san-pham/"]'));
              return [...new Set(links.map(a => (a as HTMLAnchorElement).pathname))];
            });
            expect(cardLinks.length).toBeLessThanOrEqual(13); // 12 products + at most breadcrumb
          }

          if (route === '/san-pham/tra-xanh-shan') {
            // Check no raw FERTILIZING text visible in DOM
            const bodyText = await page.evaluate(() => document.body.innerText);
            expect(bodyText.includes('FERTILIZING')).toBe(false);
          }

          if (route === '/htx') {
            const bodyText = await page.evaluate(() => document.body.innerText);
            expect(bodyText.includes('Mã định danh: htx-')).toBe(false);
          }
        });
      }
    });
  }
});
