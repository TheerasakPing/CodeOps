import { test, expect } from '@playwright/test';

// Simple smoke test to ensure the app loads
test('smoke test - app loads', async ({ page }) => {
  await page.goto('/');
  // Check for the main title or a known element
  await expect(page).toHaveTitle(/CodexOps/);
  // Or check for a root element
  await expect(page.locator('#root')).toBeVisible();
});
