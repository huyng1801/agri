import { expect, test } from '@playwright/test';

test('home page renders primary entry points', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /HTXONLINE/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Xem sản phẩm/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Khám phá HTX/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Giỏ hàng/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Đăng nhập|Tài khoản/ }).first()).toBeVisible();
});

test('login form validates on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await page.getByRole('button', { name: /Đăng nhập/ }).click();
  await expect(page.getByText('Email không hợp lệ')).toBeVisible();
});

test('public news route renders searchable page', async ({ page }) => {
  await page.goto('/tin-tuc');
  await expect(page.getByRole('heading', { name: 'Tin tức', exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('Tìm bài viết')).toBeVisible();
});
