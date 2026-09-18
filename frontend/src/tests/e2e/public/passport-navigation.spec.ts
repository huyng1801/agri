import { expect, test } from '@playwright/test';

test.describe('Passport public navigation and copy', () => {
  test.describe.configure({ timeout: 180_000 });

  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-forwarded-host': 'hochieunongnghiep.com' });
  });

  test('keeps the desktop menu concise and groups all lookup destinations', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const header = page.locator('header');
    await expect(header.getByRole('link', { name: 'Tra cứu', exact: true })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Trang chủ', exact: true })).toHaveAttribute('href', '/');
    await expect(header.getByRole('link', { name: 'Cộng tác viên', exact: true })).toHaveCount(0);

    const menuToggle = header.getByRole('button', { name: 'Mở menu Tra cứu' });
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await menuToggle.click();

    const menu = header.getByRole('menu', { name: 'Các trang trong Tra cứu' });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem')).toHaveCount(3);
    await expect(menu.getByRole('menuitem', { name: /Tra cứu sản phẩm/ })).toHaveAttribute('href', '/truy-xuat');
    await expect(menu.getByRole('menuitem', { name: /Hộ chiếu cây/ })).toHaveAttribute('href', '/cay');
    await expect(menu.getByRole('menuitem', { name: /Sản phẩm có QR/ })).toHaveAttribute('href', '/san-pham?hasQr=true');
  });

  test('keeps the active lookup menu in sync when only the QR query changes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/san-pham?hasQr=true', { waitUntil: 'domcontentloaded' });

    const header = page.locator('header');
    const lookupLink = header.getByRole('link', { name: 'Tra cứu', exact: true });
    await expect(lookupLink).toHaveAttribute('aria-current', 'page');

    await page.getByRole('link', { name: 'Xóa lọc' }).click();
    await expect(page).toHaveURL(/\/san-pham$/);
    await expect(lookupLink).not.toHaveAttribute('aria-current', 'page');

    await header.getByRole('button', { name: 'Mở menu Tra cứu' }).click();
    const menu = header.getByRole('menu', { name: 'Các trang trong Tra cứu' });
    const qrProductsLink = menu.getByRole('menuitem', { name: /Sản phẩm có QR/ });
    await expect(qrProductsLink).not.toHaveAttribute('aria-current', 'page');
    await qrProductsLink.click();

    await expect(page).toHaveURL(/\/san-pham\?hasQr=true$/);
    await expect(lookupLink).toHaveAttribute('aria-current', 'page');

    await header.getByRole('button', { name: 'Mở menu Tra cứu' }).click();
    await expect(
      header.getByRole('menu', { name: 'Các trang trong Tra cứu' }).getByRole('menuitem', { name: /Sản phẩm có QR/ })
    ).toHaveAttribute('aria-current', 'page');
  });

  test('uses the same ordered destinations in the mobile drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const header = page.locator('header');
    const bottomNav = page.getByTestId('public-bottom-nav');
    await expect(bottomNav).toBeVisible();
    await header.getByRole('button', { name: 'Mở menu điều hướng' }).click();
    const drawer = page.getByRole('dialog', { name: 'Menu điều hướng' });
    await expect(bottomNav).toBeHidden();
    const nav = drawer.getByTestId('passport-mobile-nav');

    await expect(nav).toBeVisible();
    await expect(drawer.getByText('Khám phá Dữ liệu')).toHaveCount(0);
    await expect(drawer.getByText('Hỗ trợ & Kết nối')).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Trang chủ', exact: true })).toHaveAttribute('href', '/');
    await expect(nav.getByRole('link', { name: 'Cộng tác viên', exact: true })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Giới thiệu', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Tra cứu', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Đối tác', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Tin tức', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Liên hệ', exact: true })).toBeVisible();

    await nav.getByRole('button', { name: 'Mở menu Tra cứu' }).click();
    await expect(nav.locator('#passport-mobile-submenu').getByRole('link')).toHaveCount(3);
    await expect(nav.getByRole('link', { name: 'Tra cứu sản phẩm', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Hộ chiếu cây', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Sản phẩm có QR', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Tra cứu sản phẩm', exact: true })).toHaveAttribute('href', '/truy-xuat');
    await expect(nav.getByRole('link', { name: 'Hộ chiếu cây', exact: true })).toHaveAttribute('href', '/cay');
    await expect(nav.getByRole('link', { name: 'Sản phẩm có QR', exact: true })).toHaveAttribute('href', '/san-pham?hasQr=true');
    await header.getByRole('button', { name: 'Đóng menu' }).click();
    await expect(bottomNav).toBeVisible();
  });

  test('keeps the mobile bottom bar focused on buyer and lookup tasks', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const bottomNav = page.getByTestId('public-bottom-nav');
    const links = bottomNav.getByRole('link');
    await expect(links).toHaveCount(5);
    await expect(links.evaluateAll((items) => items.map((item) => ({ label: item.textContent?.trim(), href: item.getAttribute('href') })))).resolves.toEqual([
      { label: 'Trang chủ', href: '/' },
      { label: 'Sản phẩm', href: '/san-pham' },
      { label: 'Truy xuất QR', href: '/truy-xuat' },
      { label: 'Tin tức', href: '/tin-tuc' },
      { label: 'Liên hệ', href: '/lien-he' }
    ]);
    await expect(links.nth(0)).toHaveAttribute('aria-current', 'page');

    await page.goto('/truy-xuat', { waitUntil: 'domcontentloaded' });
    await expect(bottomNav.getByRole('link', { name: 'Truy xuất QR', exact: true })).toHaveAttribute('aria-current', 'page');
  });

  test('keeps Passport footer content site-specific and free of login copy', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link', { name: /đăng nhập/i })).toHaveCount(0);
    await expect(footer).not.toContainText('HỘ CHIẾU NÔNG NGHIỆP');
    await expect(footer).toContainText('Hộ chiếu cây');
    await expect(footer).toContainText('Truy xuất');
  });

  test('renders the balanced Passport logo without cover distortion', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const logo = page.locator('header img[alt="Hộ chiếu nông nghiệp"]').first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveCSS('object-fit', 'contain');
    await expect(logo).toHaveJSProperty('naturalWidth', 1984);
    expect(await logo.evaluate((image) => (image as HTMLImageElement).naturalHeight)).toBeLessThan(400);
  });

  test('keeps Passport introduction pages separate from Agripassport', async ({ page }) => {
    for (const path of ['/gioi-thieu', '/ve-chung-toi']) {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
      await expect(page.locator('main h1')).toHaveCount(1);
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toContain('Agripassport là nền tảng');
      expect(bodyText).not.toContain('Cách Agripassport hoạt động');
      expect(bodyText).not.toContain('HỘ CHIẾU NÔNG NGHIỆP');
      expect(bodyText).toContain(path === '/gioi-thieu' ? 'Từ dữ liệu sản xuất đến hồ sơ nông sản minh bạch' : 'Mỗi cây, mỗi lô hàng, một hồ sơ rõ ràng');
      if (path === '/gioi-thieu') {
        await expect(page.getByTestId('passport-data-readiness')).toBeVisible();
        expect(bodyText).not.toContain('Từ vùng trồng đến hồ sơ QR');
      }
    }
  });

  test('keeps contact focused on the support form and FAQs on their own page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/lien-he', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('main').getByRole('heading', { name: 'Câu hỏi thường gặp' })).toHaveCount(0);
    await expect(page.getByText('Nhu cầu hỗ trợ', { exact: true })).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(4);

    await page.goto('/cau-hoi-thuong-gap', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main').getByRole('heading', { name: 'Câu hỏi thường gặp' })).toBeVisible();
  });

  test('keeps the cooperative directory on the Passport brand surface', async ({ page }) => {
    await page.goto('/htx', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main h1')).toHaveText('Danh bạ Đơn vị Sản xuất & Hợp tác xã');
    await expect(page.locator('main')).not.toContainText('Agripassport');
    await expect(page.getByRole('button', { name: 'Tìm kiếm HTX' })).toHaveCSS('background-color', 'rgb(13, 122, 40)');
  });

  test('keeps the public Passport content model consistent across primary pages', async ({ page }) => {
    const publicPaths = [
      '/',
      '/gioi-thieu',
      '/ve-chung-toi',
      '/san-pham',
      '/tin-tuc',
      '/truy-xuat',
      '/lien-he',
      '/cau-hoi-thuong-gap',
      '/tuyen-cong-tac-vien',
      '/huong-dan-mua-hang',
      '/chinh-sach-bao-mat',
      '/dieu-khoan-su-dung'
    ];

    for (const path of publicPaths) {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `unexpected status for ${path}`).toBe(200);

      const bodyText = await page.locator('body').innerText();
      expect(bodyText, `Agripassport copy leaked on ${path}`).not.toContain('Agripassport là nền tảng');
      expect(bodyText, `legacy uppercase Passport copy leaked on ${path}`).not.toContain('HỘ CHIẾU NÔNG NGHIỆP');
      expect(bodyText, `legacy HTX abbreviation leaked on ${path}`).not.toMatch(/\bHTX\b/);
      expect(bodyText, `legacy BVTV abbreviation leaked on ${path}`).not.toMatch(/\bBVTV\b/);
    }
  });

  test('keeps visible Passport labels in sentence case', async ({ page }) => {
    const publicPaths = [
      '/',
      '/gioi-thieu',
      '/ve-chung-toi',
      '/san-pham',
      '/tin-tuc',
      '/truy-xuat',
      '/cay',
      '/lien-he',
      '/cau-hoi-thuong-gap',
      '/tuyen-cong-tac-vien',
      '/huong-dan-mua-hang',
      '/chinh-sach-bao-mat',
      '/dieu-khoan-su-dung'
    ];

    for (const path of publicPaths) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const uppercaseLabels = await page.locator('[data-public-site="passport"] *').evaluateAll((elements) =>
        elements
          .filter((element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.textTransform === 'uppercase' && rect.width > 0 && rect.height > 0 && Boolean(element.textContent?.trim());
          })
          .map((element) => ({ tag: element.tagName, text: element.textContent?.trim().slice(0, 100), className: element.className }))
      );

      expect(uppercaseLabels, `visible uppercase labels found on ${path}`).toEqual([]);
    }
  });
});
