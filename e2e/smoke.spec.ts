import { test, expect } from "@playwright/test";
import { mockTauri } from "./tauri-mock";

test.beforeEach(async ({ page }) => {
  await mockTauri(page);
});

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Tauri \+ React \+ Typescript/);
});
