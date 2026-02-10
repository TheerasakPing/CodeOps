import { describe, it, expect } from "vitest";
import { parseDiff } from "./diff";

describe("parseDiff", () => {
  it("parses hunk headers correctly", () => {
    const diff = "@@ -1,5 +1,6 @@";
    const parsed = parseDiff(diff);
    expect(parsed).toEqual([
      {
        type: "hunk",
        oldLine: null,
        newLine: null,
        text: "@@ -1,5 +1,6 @@",
      },
    ]);
  });

  it("parses added lines correctly", () => {
    const diff = "@@ -1,1 +1,2 @@\n+added line";
    const parsed = parseDiff(diff);
    expect(parsed).toEqual([
      {
        type: "hunk",
        oldLine: null,
        newLine: null,
        text: "@@ -1,1 +1,2 @@",
      },
      {
        type: "add",
        oldLine: null,
        newLine: 1,
        text: "added line",
      },
    ]);
  });

  it("parses deleted lines correctly", () => {
    const diff = "@@ -1,2 +1,1 @@\n-deleted line";
    const parsed = parseDiff(diff);
    expect(parsed).toEqual([
      {
        type: "hunk",
        oldLine: null,
        newLine: null,
        text: "@@ -1,2 +1,1 @@",
      },
      {
        type: "del",
        oldLine: 1,
        newLine: null,
        text: "deleted line",
      },
    ]);
  });

  it("parses context lines correctly", () => {
    const diff = "@@ -1,2 +1,2 @@\n context line";
    const parsed = parseDiff(diff);
    expect(parsed).toEqual([
      {
        type: "hunk",
        oldLine: null,
        newLine: null,
        text: "@@ -1,2 +1,2 @@",
      },
      {
        type: "context",
        oldLine: 1,
        newLine: 1,
        text: "context line",
      },
    ]);
  });
});
