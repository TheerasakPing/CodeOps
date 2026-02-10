import { Page } from "@playwright/test";

/**
 * Injects a Tauri mock into the page.
 * This is necessary because the app calls Tauri APIs on mount,
 * and Playwright runs in a regular browser where these APIs are missing.
 */
export async function mockTauri(page: Page) {
  await page.addInitScript(() => {
    (window as any).__TAURI__ = {
      invoke: async (cmd: string, args: any) => {
        console.log("[Tauri Mock] invoke:", cmd, args);

        switch (cmd) {
          case "list_workspaces":
            return [];
          case "get_app_settings":
            return {
              workspaceGroups: [],
              theme: "dark",
              fontSize: 14,
            };
          case "get_workspace_settings":
            return {};
          case "is_mobile_runtime":
            return false;
          case "get_git_status":
            return {
              files: [],
              stagedFiles: [],
              unstagedFiles: [],
              branchName: "main",
              totalAdditions: 0,
              totalDeletions: 0,
            };
          case "get_git_log":
            return { total: 0, entries: [] };
          case "is_macos_debug_build":
            return false;
          default:
            return undefined;
        }
      },
      listen: async (name: string, _cb: (event: any) => void) => {
        console.log("[Tauri Mock] listen:", name);
        // Return an unlisten function
        return () => {
          console.log("[Tauri Mock] unlisten:", name);
        };
      },
    };

    // mock for v1 or certain plugins that expect this
    (window as any).__TAURI_POST_MESSAGE__ = (message: any) => {
      console.log("[Tauri Mock] postMessage:", message);
    };
  });
}
