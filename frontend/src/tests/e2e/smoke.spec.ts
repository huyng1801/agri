import { expect, test } from '@playwright/test';

test('home page renders primary entry points', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Agri Passport' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Đăng nhập/ })).toBeVisible();
});

test('login form validates on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await page.getByRole('button', { name: /Đăng nhập/ }).click();
  await expect(page.getByText('Email không hợp lệ')).toBeVisible();
});
