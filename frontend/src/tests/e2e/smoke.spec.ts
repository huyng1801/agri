import { expect, test } from '@playwright/test';

test('home page renders primary entry points', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('link', { name: 'Sản phẩm', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tin tức', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Đăng nhập/ }).first()).toBeVisible();
});

test('login form validates on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await expect(page.getByTestId('login-email-input')).toBeVisible();
  await expect(page.getByTestId('login-password-input')).toBeVisible();
  await expect(page.getByTestId('login-submit-button')).toBeVisible();
});

test('public news route renders searchable page', async ({ page }) => {
  await page.goto('/tin-tuc');
  await expect(page.getByRole('heading', { name: 'Tin tức', exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('Tìm bài viết')).toBeVisible();
});
