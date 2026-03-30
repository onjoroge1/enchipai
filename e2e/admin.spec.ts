import { test, expect } from '@playwright/test';

test.describe('Admin Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as admin
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'admin@enchipai.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=/dashboard|admin/i')).toBeVisible();
  });

  test('should view bookings table', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=/bookings/i')).toBeVisible();
  });

  test('should access tent management', async ({ page }) => {
    await page.goto('/admin/tents');
    await expect(page.locator('text=/tent management/i')).toBeVisible();
  });

  test('should access blog management', async ({ page }) => {
    await page.goto('/admin/blog');
    await expect(page.locator('text=/blog|posts/i')).toBeVisible();
  });
});

