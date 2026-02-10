import { test, expect } from "@playwright/test";
import { mockTauri } from "./tauri-mock";

test.describe("Composer Flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockTauri(page);
    await page.goto("/");
    // Assume we start at a workspace or need to select one
    // For simplicity, assuming default view has composer or navigation to it
  });

  test("can type in composer", async ({ page }) => {
    const composer = page.getByPlaceholder("Ask Codex to do something...");
    await composer.fill("Hello world");
    await expect(composer).toHaveValue("Hello world");
  });

  test("send button enables when text is present", async ({ page }) => {
    const composer = page.getByPlaceholder("Ask Codex to do something...");
    const sendButton = page.getByLabel("Send", { exact: true });

    await expect(sendButton).toBeDisabled();
    await composer.fill("Task");
    await expect(sendButton).toBeEnabled();
  });

  test("can submit a task", async ({ page }) => {
    const composer = page.getByPlaceholder("Ask Codex to do something...");
    await composer.fill("List files");
    await page.keyboard.press("Enter");

    // Expect some loading state or message appearance
    // This depends on the mock backend or actual behavior
    // Just checking input clears might be a good first step if we can't fully mock backend in this E2E scope without more setup
    await expect(composer).toHaveValue("");
  });
});
