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
              sidebarCollapsed: false,
              theme: "dark",
              uiScale: 1,
              uiFontFamily: "Inter",
              codeFontFamily: "Fira Code",
              codeFontSize: 14,
              workspaceGroups: [],
              openAppTargets: [],
              selectedOpenAppId: "",
              dictationEnabled: false,
              dictationModelId: "default",
              composerEditorPreset: "default",
            };
          case "get_workspace_settings":
            return {};
          case "is_mobile_runtime":
            return false;
          case "get_git_status":
            return {
              branchName: "main",
              files: [],
              stagedFiles: [],
              unstagedFiles: [],
              totalAdditions: 0,
              totalDeletions: 0,
            };
          case "get_git_log":
            return {
              total: 0,
              entries: [],
              ahead: 0,
              behind: 0,
              aheadEntries: [],
              behindEntries: [],
              upstream: null,
            };
          case "is_macos_debug_build":
            return false;
          case "local_usage_snapshot":
            return {
              updatedAt: Date.now(),
              days: [],
              totals: {
                last7DaysTokens: 0,
                last30DaysTokens: 0,
                averageDailyTokens: 0,
                cacheHitRatePercent: 0,
                peakDay: null,
                peakDayTokens: 0,
              },
              topModels: [],
            };
          case "dictation_model_status":
            return {
              state: "ready",
              modelId: "default",
            };
          case "menu_set_accelerators":
            return;
          case "orbit_connect_test":
            return { ok: true, latencyMs: 10, message: "Connected" };
          case "tailscale_status":
            return {
              installed: false,
              running: false,
              message: "Not installed",
              ipv4: [],
              ipv6: [],
            };
          case "codex_doctor":
            return {
              ok: true,
              codexBin: "/usr/bin/codex",
              version: "1.0.0",
              appServerOk: true,
              nodeOk: true,
            };
          case "get_github_issues":
            return { total: 0, issues: [] };
          case "get_github_pull_requests":
            return { total: 0, pullRequests: [] };
          case "list_git_roots":
            return [];
          default:
            console.warn(`[Tauri Mock] Unmocked command: ${cmd}`);
            return null;
        }
      },
      transformCallback: (callback: any) => callback,
      convertFileSrc: (filePath: string) => filePath,
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
