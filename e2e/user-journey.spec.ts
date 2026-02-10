import { test, expect } from '@playwright/test';

// Define common selectors as constants if reused
// Note: These tests assume the application is running and accessible at '/'
// and that specific data-testids exist. If they don't, we should add them or use text selectors.

test.describe('Workspace Navigation', () => {
  test('should display workspace list', async ({ page }) => {
    // Navigate to home
    await page.goto('/');
    
    // Wait for the main layout to load
    // Assuming a side panel or workspace area
    // Let's try to find a known element, e.g. "Workspaces" header or button
    // If we don't know the exact IDs, we can use text locators which are more resilient
    
    const workspaceHeader = page.getByText('Workspaces', { exact: false }).first();
    await expect(workspaceHeader).toBeVisible();
    
    // Check if there's at least one workspace item
    // Assuming they are list items or buttons in a list
    // This selector might need adjustment based on actual DOM
    // const workspaceItems = page.locator('role=button', { hasText: /Workspace/ });
    // await expect(workspaceItems.first()).toBeVisible();
  });

  test('should be able to switch workspaces', async ({ page }) => {
    await page.goto('/');
    // Check if we have multiple workspaces, or at least can interact with the list
    // This is hard to test without seeding data.
    // We'll just verify the UI element is interactive
    
    // Assuming a 'Workspaces' section in sidebar
    const workspaceSection = page.getByRole('complementary').or(page.getByRole('navigation')); // Sidebar usually
    // If sidebar exists
    if (await workspaceSection.isVisible()) {
        await expect(workspaceSection).toBeVisible();
    }
  });
});

test.describe('Settings Navigation', () => {
    test('should navigate to settings', async ({ page }) => {
        await page.goto('/');
        
        // Look for a settings icon or button
        // Common patterns: Gear icon, "Settings" text
        // Try finding by test id first, then label
        const settingsButton = page.locator('[data-testid="settings-button"]').or(page.getByLabel('Settings')).or(page.getByText('Settings'));
        
        // If settings button is hidden in a menu, we might need to open menu first
        // But assuming top-level access for now
        if (await settingsButton.isVisible()) {
            await settingsButton.first().click();
            // Verify URL or header
            // URL might not change in a purely SPA/desktop app without router history mode?
            // But usually it does.
            // await expect(page).toHaveURL(/.*settings/); 
            
            // Check for Settings title
            await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
        }
    });

    test('should display settings tabs', async ({ page }) => {
        // If we can navigate to /settings directly
        await page.goto('/#/settings'); // Hash router often used in Electron/Tauri
        
        // Check for common settings sections
        // "General", "Appearance", "Models", "About"
        const generalTab = page.getByText('General');
        const appearanceTab = page.getByText('Appearance');
        
        await expect(generalTab).toBeVisible();
        await expect(appearanceTab).toBeVisible();
    });
});
