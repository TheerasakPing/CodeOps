import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function useWindowLabel(defaultLabel = "main") {
  const [label, setLabel] = useState(() => {
    // Debug/Test override priority during initialization to avoid flash of MainApp
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const labelOverride = params.get("window_label");
      if (labelOverride) {
        return labelOverride;
      }
    }
    return defaultLabel;
  });

  useEffect(() => {
    // If we already have an override from the URL (handled in useState), we don't need to check Tauri window label immediately
    // effectively, but we should still respect the environment if the URL param wasn't there.
    // However, for the specific case of the "About" window or others opened via window_label, the state initialization is sufficient.
    // For the main window in Tauri, we might want to ensure we get the real label.

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("window_label")) {
        // Already handled in initial state
        return;
      }
    }

    try {
      const window = getCurrentWindow();
      const currentLabel = window.label ?? defaultLabel;
      if (currentLabel !== label) {
        setLabel(currentLabel);
      }
    } catch {
      // Ignore Tauri errors in browser/test env
      if (label !== defaultLabel) {
        setLabel(defaultLabel);
      }
    }
  }, [defaultLabel, label]);

  return label;
}
