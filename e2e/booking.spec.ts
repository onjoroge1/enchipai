import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as guest
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'guest@example.com');
    await page.fill('input[type="password"]', 'guest123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('should complete booking flow', async ({ page }) => {
    // Navigate to tents
    await page.goto('/tents');

    // Click on a tent
    await page.click('text=View Details').first();

    // Fill booking form
    await page.fill('input[name="checkIn"]', '2026-03-01');
    await page.fill('input[name="checkOut"]', '2026-03-05');
    await page.fill('input[name="guests"]', '2');

    // Submit booking
    await page.click('button:has-text("Book Now")');

    // Should show confirmation or redirect
    await expect(page).toHaveURL(/\/bookings\/|\/confirmation/);
  });

  test('should show booking in dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should see bookings section
    await expect(page.locator('text=/my bookings|bookings/i')).toBeVisible();
  });
});

