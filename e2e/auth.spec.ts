import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should sign in successfully', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in sign-in form
    await page.fill('input[type="email"]', 'admin@enchipai.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid|error/i')).toBeVisible();
  });

  test('should sign out successfully', async ({ page }) => {
    // Sign in first
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'admin@enchipai.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for admin page
    await page.waitForURL(/\/admin/);

    // Click sign out
    await page.click('button:has-text("Sign Out")');

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });
});

