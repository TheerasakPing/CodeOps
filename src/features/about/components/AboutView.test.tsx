import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { AboutView } from "./AboutView";
import { openUrl } from "@tauri-apps/plugin-opener";

// Mock the openUrl function
vi.mock("@tauri-apps/plugin-opener", () => ({
  openUrl: vi.fn(),
}));

// Mock getVersion
vi.mock("@tauri-apps/api/app", () => ({
  getVersion: vi.fn().mockResolvedValue("1.0.0"),
}));

describe("AboutView", () => {
  it("renders correctly", async () => {
    render(<AboutView />);
    // Verify the text "Codex Monitor" instead of "CodexOps"
    expect(screen.getByText("Codex Monitor")).toBeInTheDocument();
    expect(await screen.findByText(/Version 1.0.0/)).toBeInTheDocument();
  });

  it("opens the GitHub repository when the GitHub button is clicked", () => {
    render(<AboutView />);
    // It's a button, not a link
    const button = screen.getByRole("button", { name: /GitHub/i });
    fireEvent.click(button);
    expect(openUrl).toHaveBeenCalledWith(
      "https://github.com/TheerasakPing/CodeOps",
    );
  });
});
