import { describe, it, expect } from "vitest";
import { formatDownloadSize } from "./formatting";

describe("formatDownloadSize", () => {
  it("formats zero or negative bytes as 0 MB", () => {
    expect(formatDownloadSize(0)).toBe("0 MB");
    expect(formatDownloadSize(-100)).toBe("0 MB");
    expect(formatDownloadSize(null)).toBe("0 MB");
  });

  it("formats megabytes correctly", () => {
    expect(formatDownloadSize(1024 * 1024)).toBe("1.0 MB");
    expect(formatDownloadSize(500 * 1024 * 1024)).toBe("500 MB");
    expect(formatDownloadSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });

  it("formats gigabytes correctly", () => {
    expect(formatDownloadSize(1024 * 1024 * 1024)).toBe("1.0 GB");
    expect(formatDownloadSize(2.5 * 1024 * 1024 * 1024)).toBe("2.5 GB");
    expect(formatDownloadSize(10 * 1024 * 1024 * 1024)).toBe("10 GB");
  });
});
