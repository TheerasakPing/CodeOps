import { test, expect } from "@playwright/test";
import { mockTauri } from "./tauri-mock";

test.describe("User Journey", () => {
  test.beforeEach(async ({ page }) => {
    await mockTauri(page);
  });

  test("Navigate to Home -> Go to About", async ({ page }) => {
    // 1. Navigate to Home
    await page.goto("/");
    await expect(page).toHaveTitle(/Tauri \+ React \+ Typescript/);

    // 2. Go to About (Simulated via query param hook)
    // In a real desktop app, this would be a menu click.
    // For E2E web testing, we use the test hook we injected.
    await page.goto("/?window_label=about");

    // 3. Verify About Page Content
    await expect(page.locator(".about-title")).toHaveText("Codex Monitor");

    // Check for version text (might be "Version —" if backend not connected)
    await expect(page.locator(".about-version")).toBeVisible();

    // 4. Verify GitHub interaction point
    const githubBtn = page.locator("button.about-link").first();
    await expect(githubBtn).toBeVisible();

    // Optional: Verify text or icon presence if needed, but class check is good start.
    // The component has two buttons, first is GitHub, second is Twitter.
    // We can be more specific if we want.
  });
});
