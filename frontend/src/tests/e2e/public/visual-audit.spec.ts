import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { baseUrls } from '../helpers/auth';

const DEMO_FIXTURES = {
  productSlug: 'tra-xanh-shan',
  productSlugRice: 'gao-st25-huu-co',
  cooperativeCode: 'htx-lua-dong-thap',
  cooperativeCodeTea: 'htx-tra-shan-tuyet-ha-giang',
  newsSlug: 'st25-niem-tu-hao-gao-viet-tren-ban-an-quoc-te'
};

type AuditRoute = {
  id: string;
  path: string | ((ctx: AuditContext) => string);
  prepare?: 'cart' | 'order-success';
  batch: string;
  note: string;
};

type AuditContext = {
  passportCode: string;
};

const AUDIT_ROUTES: AuditRoute[] = [
  { id: 'home', path: '/', batch: 'Shell', note: 'Hero, stats, featured grids' },
  { id: 'products', path: '/san-pham', batch: 'Shell', note: 'Filter form, product grid' },
  { id: 'products-search', path: '/san-pham?search=tra', batch: 'Shell', note: 'Search results state' },
  { id: 'cooperatives', path: '/htx', batch: 'Shell', note: 'HTX cards with avatars' },
  { id: 'news', path: '/tin-tuc', batch: 'Shell', note: 'Featured article + grid' },
  { id: 'product-detail', path: `/san-pham/${DEMO_FIXTURES.productSlug}`, batch: 'Chi tiết', note: 'PublicImage hero, HTX link' },
  { id: 'product-detail-rice', path: `/san-pham/${DEMO_FIXTURES.productSlugRice}`, batch: 'Chi tiết', note: 'Rice product from Đồng Tháp HTX' },
  { id: 'cooperative-detail', path: `/htx/${DEMO_FIXTURES.cooperativeCode}`, batch: 'Chi tiết', note: 'Avatar overlap, product list' },
  { id: 'cooperative-detail-tea', path: `/htx/${DEMO_FIXTURES.cooperativeCodeTea}`, batch: 'Chi tiết', note: 'Tea HTX profile' },
  { id: 'news-detail', path: `/tin-tuc/${DEMO_FIXTURES.newsSlug}`, batch: 'Chi tiết', note: 'Article layout, related posts' },
  { id: 'about', path: '/gioi-thieu', batch: 'Nội dung', note: 'Static intro cards' },
  { id: 'about-us', path: '/ve-chung-toi', batch: 'Nội dung', note: 'Mission / offerings' },
  { id: 'buying-guide', path: '/huong-dan-mua-hang', batch: 'Nội dung', note: 'Step-by-step guide' },
  { id: 'privacy-policy', path: '/chinh-sach-bao-mat', batch: 'Nội dung', note: 'Policy body spacing' },
  { id: 'shipping-policy', path: '/chinh-sach-van-chuyen', batch: 'Nội dung', note: 'Shipping policy' },
  { id: 'return-policy', path: '/chinh-sach-doi-tra', batch: 'Nội dung', note: 'Return policy' },
  { id: 'terms', path: '/dieu-khoan-su-dung', batch: 'Nội dung', note: 'Terms of use' },
  { id: 'cart', path: '/gio-hang', batch: 'Mua hàng', prepare: 'cart', note: 'Cart thumbnails + summary' },
  { id: 'checkout', path: '/thanh-toan', batch: 'Mua hàng', prepare: 'cart', note: 'Checkout form with items' },
  { id: 'order-lookup', path: '/tra-cuu-don-hang', batch: 'Mua hàng', note: 'Lookup form' },
  { id: 'contact', path: '/lien-he', batch: 'Mua hàng', note: 'Contact form + map iframe' },
  { id: 'order-success', path: '/dat-hang-thanh-cong', batch: 'Mua hàng', prepare: 'order-success', note: 'Post-checkout confirmation' },
  { id: 'passport', path: (ctx) => `/passport/${ctx.passportCode}`, batch: 'QR', note: 'Minimal HTXONLINE strip + product' },
  { id: 'qr-alias', path: (ctx) => `/qr/${ctx.passportCode}`, batch: 'QR', note: 'QR redirect alias to passport' }
];

const OUTPUT_ROOT = join(process.cwd(), 'test-results', 'ui-audit');
const ANALYSIS_PATH = join(OUTPUT_ROOT, 'analysis.md');

test.describe('public visual audit', () => {
  test.describe.configure({ mode: 'serial' });

  let passportCode = 'DEMO-PASSPORT';
  const findings: Array<{
    route: string;
    viewport: string;
    status: 'ok' | 'warn' | 'fail';
    layout: string;
    images: string;
    mobile: string;
  }> = [];

  test.beforeAll(async ({ request }) => {
    const { apiUrl } = baseUrls();
    try {
      const response = await request.get(`${apiUrl}/products/public?limit=12&hasQr=true`);
      if (response.ok()) {
        const body = (await response.json()) as { data?: { data?: Array<{ passportCode?: string }> } | Array<{ passportCode?: string }> };
        const list = Array.isArray(body.data) ? body.data : body.data?.data;
        const code = list?.find((item) => item.passportCode)?.passportCode;
        if (code) passportCode = code;
      }
    } catch {
      // Keep fallback passport code for offline screenshot runs.
    }
    mkdirSync(OUTPUT_ROOT, { recursive: true });
  });

  for (const route of AUDIT_ROUTES) {
    test(`@audit capture ${route.id}`, async ({ page }, testInfo) => {
      test.skip(!['chromium', 'iphone'].includes(testInfo.project.name), 'Visual audit runs on desktop chromium and iPhone only');

      if (testInfo.project.name === 'chromium') {
        await page.setViewportSize({ width: 1280, height: 800 });
      }

      const viewportLabel = testInfo.project.name === 'iphone' ? 'mobile' : 'desktop';
      const path = typeof route.path === 'function' ? route.path({ passportCode }) : route.path;

      await preparePage(page, route.prepare);
      const response = await page.goto(path, { waitUntil: 'networkidle' });
      expect(response?.status()).toBeLessThan(400);

      await page.waitForTimeout(500);
      const shotDir = join(OUTPUT_ROOT, route.id);
      mkdirSync(shotDir, { recursive: true });
      const shotPath = join(shotDir, `${viewportLabel}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });

      const imageStats = await analyzeImages(page);
      const layoutNotes = await analyzeLayout(page, route.id);
      const status = imageStats.broken > 0 ? 'fail' : imageStats.total === 0 ? 'warn' : 'ok';

      findings.push({
        route: `${path} (${route.id})`,
        viewport: viewportLabel,
        status,
        layout: layoutNotes,
        images: `${imageStats.loaded}/${imageStats.total} loaded, ${imageStats.broken} broken`,
        mobile: viewportLabel === 'mobile' ? layoutNotes : '—'
      });
    });
  }

  test.afterAll(() => {
    const rows = findings
      .map(
        (item) =>
          `| ${item.route} | ${item.viewport} | ${item.status} | ${item.layout} | ${item.images} | ${item.mobile} |`
      )
      .join('\n');

    const markdown = `# HTXONLINE public UI audit

Generated: ${new Date().toISOString()}
Passport fixture: \`${passportCode}\`

## Per-page analysis

| Route | Viewport | Status | Layout notes | Images | Mobile notes |
| --- | --- | --- | --- | --- | --- |
${rows}

## Batches

${Array.from(new Set(AUDIT_ROUTES.map((route) => route.batch)))
  .map((batch) => `- **${batch}**: ${AUDIT_ROUTES.filter((route) => route.batch === batch).map((route) => route.id).join(', ')}`)
  .join('\n')}

## Screenshots

Saved under \`frontend/test-results/ui-audit/{route}/{desktop|mobile}.png\`.
`;

    mkdirSync(dirname(ANALYSIS_PATH), { recursive: true });
    writeFileSync(ANALYSIS_PATH, markdown, 'utf8');
  });
});

async function preparePage(page: Page, prepare?: AuditRoute['prepare']) {
  if (prepare === 'cart') {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'htxonline_cart_items',
        JSON.stringify([
          {
            productId: 'demo-product-1',
            slug: 'tra-xanh-shan',
            name: 'Trà xanh Shan',
            price: 280000,
            unit: 'kg',
            cooperativeId: 'demo-coop-1',
            cooperativeName: 'HTX Trà Shan Tuyết Hà Giang',
            imageUrl: 'https://picsum.photos/seed/htxonline-tea/900/600',
            quantity: 2
          },
          {
            productId: 'demo-product-2',
            slug: 'gao-st25-huu-co',
            name: 'Gạo ST25 hữu cơ',
            price: 28000,
            unit: 'kg',
            cooperativeId: 'demo-coop-2',
            cooperativeName: 'HTX Nông nghiệp hữu cơ Đồng Tháp',
            imageUrl: 'https://picsum.photos/seed/htxonline-rice/900/600',
            quantity: 1
          }
        ])
      );
    });
  }

  if (prepare === 'order-success') {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'htxonline_last_order',
        JSON.stringify({
          groupCode: 'ORD-GRP-AUDIT01',
          orders: [
            {
              orderCode: 'ORD-AUDIT-A',
              status: 'NEW',
              totalAmount: 588000,
              cooperative: { name: 'HTX Trà Shan Tuyết Hà Giang' },
              buyerName: 'Khách audit',
              buyerPhone: '0912345678',
              address: '123 Đường audit',
              province: 'Hà Nội'
            }
          ]
        })
      );
    });
  }
}

async function analyzeImages(page: Page) {
  return page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    let loaded = 0;
    let broken = 0;
    for (const image of images) {
      if (image.complete && image.naturalWidth > 0) loaded += 1;
      else if (image.complete) broken += 1;
    }
    return { total: images.length, loaded, broken };
  });
}

async function analyzeLayout(page: Page, routeId: string) {
  return page.evaluate((id) => {
    const notes: string[] = [];
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    if (!header) notes.push('missing header');
    if (!main) notes.push('missing main');
    if (window.innerWidth < 768 && header && header.scrollWidth > window.innerWidth + 4) {
      notes.push('header horizontal overflow');
    }
    if (id.includes('cart') || id === 'checkout') {
      const empty = document.querySelector('[data-testid="cart-empty"]');
      if (empty) notes.push('cart empty state visible');
    }
    return notes.length ? notes.join('; ') : 'shell + main present';
  }, routeId);
}
