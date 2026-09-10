import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3100';
const EVIDENCE_DIR = join(process.cwd(), 'test-results', 'validation-evidence');

const VIEWPORTS = {
  v360: { width: 360, height: 800 },
  v375: { width: 375, height: 812 },
  v390: { width: 390, height: 844 },
  v430: { width: 430, height: 932 },
  v768: { width: 768, height: 1024 },
  v1024: { width: 1024, height: 768 },
  v1280: { width: 1280, height: 800 },
  v1440: { width: 1440, height: 900 },
  v1920: { width: 1920, height: 1080 }
};

const superAdminUser = {
  id: 'e2e-super-admin',
  email: 'super-admin@htxonline.vn',
  fullName: 'Quản trị viên Hệ thống',
  cooperativeId: null,
  roles: ['SUPER_ADMIN'],
  permissions: ['*']
};

const htxAdminUser = {
  id: 'e2e-htx-admin',
  email: 'admin@htxdongthap.vn',
  fullName: 'Nguyễn Văn Quản Trị',
  cooperativeId: 'htx-lua-dong-thap',
  roles: ['ADMIN_HTX'],
  permissions: ['products.*', 'certifications.*', 'zones.*', 'farming_logs.*', 'passports.*', 'orders.*', 'reports.overview', 'cooperatives.read', 'cooperatives.update']
};

async function seedAuth(page, user) {
  await page.addInitScript((currentUser) => {
    window.localStorage.setItem('agri_access_token', 'e2e-token');
    window.localStorage.setItem('agri_refresh_token', 'e2e-token');
    window.localStorage.setItem('agri_user', JSON.stringify(currentUser));
  }, user);
}

async function runValidation() {
  console.log('--- STARTING INDEPENDENT VALIDATION AUDIT ---');
  console.log('Target URL:', BASE_URL);
  mkdirSync(EVIDENCE_DIR, { recursive: true });

  const browser = await chromium.launch();
  const findings = [];

  async function auditPage({
    platform,
    routeId,
    path,
    hostHeader,
    user = null,
    viewports = ['v1440', 'v390']
  }) {
    console.log(`Auditing [${platform}] ${routeId} (${path})...`);
    for (const vpKey of viewports) {
      const vp = VIEWPORTS[vpKey];
      const context = await browser.newContext({
        viewport: vp,
        extraHTTPHeaders: hostHeader ? { 'x-forwarded-host': hostHeader } : {}
      });
      const page = await context.newPage();
      if (user) await seedAuth(page, user);

      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      let response;
      try {
        response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(600);
      } catch (err) {
        findings.push({
          platform,
          routeId,
          path,
          viewport: vpKey,
          severity: 'P0',
          type: 'PAGE_LOAD_FAILURE',
          details: `Failed to load page: ${err.message}`
        });
        await context.close();
        continue;
      }

      const status = response ? response.status() : 0;
      if (status >= 400) {
        findings.push({
          platform,
          routeId,
          path,
          viewport: vpKey,
          severity: 'P0',
          type: 'HTTP_ERROR',
          details: `Returned HTTP status ${status}`
        });
      }

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const bodyWidth = document.body.scrollWidth;
        return {
          hasOverflow: (docWidth - winWidth > 2) || (bodyWidth - winWidth > 2),
          docWidth: Math.round(docWidth),
          winWidth: Math.round(winWidth),
          bodyWidth: Math.round(bodyWidth)
        };
      });

      if (overflow.hasOverflow) {
        findings.push({
          platform,
          routeId,
          path,
          viewport: vpKey,
          severity: 'P1',
          type: 'HORIZONTAL_OVERFLOW',
          details: `Document scrollWidth (${overflow.docWidth}px) exceeds window (${overflow.winWidth}px)`
        });
      }

      // Check H1
      const h1Info = await page.evaluate(() => {
        const h1s = Array.from(document.querySelectorAll('h1'));
        return {
          count: h1s.length,
          texts: h1s.map(h => h.innerText.trim()).filter(Boolean)
        };
      });

      if (h1Info.count === 0) {
        findings.push({
          platform,
          routeId,
          path,
          viewport: vpKey,
          severity: 'P2',
          type: 'MISSING_H1',
          details: 'Page has no <h1> element'
        });
      }

      // Check broken images
      const brokenImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const broken = [];
        for (const img of imgs) {
          if (!img.src) continue;
          if (img.complete && img.naturalWidth === 0) {
            broken.push(img.src);
          }
        }
        return broken;
      });

      if (brokenImages.length > 0) {
        findings.push({
          platform,
          routeId,
          path,
          viewport: vpKey,
          severity: 'P1',
          type: 'BROKEN_IMAGES',
          details: `${brokenImages.length} broken images found: ${brokenImages.slice(0, 3).join(', ')}`
        });
      }

      // Touch targets
      if (vp.width <= 430) {
        const smallTargets = await page.evaluate(() => {
          const interactives = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
          const small = [];
          for (const el of interactives) {
            if (el.classList.contains('sr-only') || el.closest('.sr-only')) continue;
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
            const rect = el.getBoundingClientRect();
            if (rect.width <= 1 || rect.height <= 1) continue;
            if (rect.width < 32 || rect.height < 32) {
              const text = el.innerText?.trim() || el.getAttribute('aria-label') || el.className;
              small.push({ text: text.slice(0, 30), width: Math.round(rect.width), height: Math.round(rect.height) });
            }
          }
          return small.slice(0, 5);
        });

        if (smallTargets.length > 0) {
          findings.push({
            platform,
            routeId,
            path,
            viewport: vpKey,
            severity: 'P2',
            type: 'TOUCH_TARGET_SIZE',
            details: `Interactive targets < 32px on mobile: ${JSON.stringify(smallTargets)}`
          });
        }
      }

      // Save screenshot
      const shotDir = join(EVIDENCE_DIR, platform, routeId);
      mkdirSync(shotDir, { recursive: true });
      const shotFile = join(shotDir, `${vp.width}x${vp.height}.png`);
      await page.screenshot({ path: shotFile, fullPage: false });

      if (consoleErrors.length > 0) {
        findings.push({
          platform,
          routeId,
          path,
          viewport: vpKey,
          severity: 'P2',
          type: 'CONSOLE_ERROR',
          details: consoleErrors.slice(0, 2).join(' | ')
        });
      }
      if (pageErrors.length > 0) {
        findings.push({
          platform,
          routeId,
          path,
          viewport: vpKey,
          severity: 'P0',
          type: 'PAGE_ERROR',
          details: pageErrors.slice(0, 2).join(' | ')
        });
      }

      await context.close();
    }
  }

  // 1. AUDIT AGRIPASSPORT
  const agriRoutes = [
    { id: 'home', path: '/', viewports: ['v1440', 'v1024', 'v768', 'v390', 'v360'] },
    { id: 'products', path: '/san-pham', viewports: ['v1440', 'v390'] },
    { id: 'products-search-tra', path: '/san-pham?search=tra', viewports: ['v1440', 'v390'] },
    { id: 'products-search-empty', path: '/san-pham?search=khongtontai12345', viewports: ['v1440', 'v390'] },
    { id: 'product-detail-shan', path: '/san-pham/tra-xanh-shan', viewports: ['v1440', 'v390'] },
    { id: 'product-detail-st25', path: '/san-pham/gao-st25-huu-co', viewports: ['v1440', 'v390'] },
    { id: 'cooperatives', path: '/htx', viewports: ['v1440', 'v390'] },
    { id: 'cooperative-detail-dongthap', path: '/htx/htx-lua-dong-thap', viewports: ['v1440', 'v390'] },
    { id: 'cooperative-detail-hagiang', path: '/htx/htx-tra-shan-tuyet-ha-giang', viewports: ['v1440', 'v390'] },
    { id: 'news', path: '/tin-tuc', viewports: ['v1440', 'v390'] },
    { id: 'news-detail', path: '/tin-tuc/st25-niem-tu-hao-gao-viet-tren-ban-an-quoc-te', viewports: ['v1440', 'v390'] },
    { id: 'contact', path: '/lien-he', viewports: ['v1440', 'v390'] },
    { id: 'about-us', path: '/ve-chung-toi', viewports: ['v1440', 'v390'] },
    { id: 'about', path: '/gioi-thieu', viewports: ['v1440', 'v390'] },
    { id: 'buying-guide', path: '/huong-dan-mua-hang', viewports: ['v1440', 'v390'] },
    { id: 'privacy-policy', path: '/chinh-sach-bao-mat', viewports: ['v1440', 'v390'] },
    { id: 'terms', path: '/dieu-khoan-su-dung', viewports: ['v1440', 'v390'] },
    { id: 'login', path: '/login', viewports: ['v1440', 'v390'] },
    { id: 'register', path: '/register', viewports: ['v1440', 'v390'] }
  ];

  for (const r of agriRoutes) {
    await auditPage({
      platform: 'AGRIPASSPORT',
      routeId: r.id,
      path: r.path,
      viewports: r.viewports
    });
  }

  // 2. AUDIT HỘ CHIẾU NÔNG NGHIỆP
  const passportRoutes = [
    { id: 'passport-demo', path: '/passport/DEMO-PASSPORT', viewports: ['v390', 'v430', 'v768', 'v1440'] },
    { id: 'passport-home', path: '/', hostHeader: 'hochieunongnghiep.com', viewports: ['v1440', 'v390'] },
    { id: 'passport-products-qr', path: '/san-pham?hasQr=true', hostHeader: 'hochieunongnghiep.com', viewports: ['v1440', 'v390'] }
  ];

  for (const r of passportRoutes) {
    await auditPage({
      platform: 'PASSPORT',
      routeId: r.id,
      path: r.path,
      hostHeader: r.hostHeader,
      viewports: r.viewports
    });
  }

  // 3. AUDIT HTXONLINE
  const htxRoutes = [
    { id: 'htxonline-public-home', path: '/', hostHeader: 'htxonline.vn', viewports: ['v1440', 'v390'] },
    { id: 'dashboard-superadmin', path: '/dashboard', user: superAdminUser, viewports: ['v1440', 'v1024', 'v390'] },
    { id: 'dashboard-htxadmin', path: '/dashboard', user: htxAdminUser, viewports: ['v1440', 'v1024', 'v390'] },
    { id: 'dashboard-products', path: '/dashboard/products', user: htxAdminUser, viewports: ['v1440', 'v390'] },
    { id: 'dashboard-farmers', path: '/dashboard/farmers', user: htxAdminUser, viewports: ['v1440', 'v390'] },
    { id: 'dashboard-zones', path: '/dashboard/zones', user: htxAdminUser, viewports: ['v1440', 'v390'] },
    { id: 'dashboard-cooperatives', path: '/dashboard/cooperatives', user: superAdminUser, viewports: ['v1440', 'v390'] }
  ];

  for (const r of htxRoutes) {
    await auditPage({
      platform: 'HTXONLINE',
      routeId: r.id,
      path: r.path,
      hostHeader: r.hostHeader,
      user: r.user,
      viewports: r.viewports
    });
  }

  // Write findings log
  const findingsPath = join(EVIDENCE_DIR, 'findings.json');
  writeFileSync(findingsPath, JSON.stringify(findings, null, 2), 'utf8');
  console.log(`\nAudit complete. Total findings: ${findings.length}`);
  console.log(`Evidence saved to ${EVIDENCE_DIR}`);

  await browser.close();
}

runValidation().catch(err => {
  console.error('Audit run error:', err);
  process.exit(1);
});
