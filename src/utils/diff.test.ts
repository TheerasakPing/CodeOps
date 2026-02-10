import { describe, it, expect } from "vitest";
import { parseDiff } from "./diff";

describe("parseDiff", () => {
  it("parses hunks correctly", () => {
    const diff = "@@ -1,2 +1,2 @@";
    const result = parseDiff(diff);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: "hunk",
      oldLine: null,
      newLine: null,
      text: "@@ -1,2 +1,2 @@",
    });
  });

  it("parses added lines correctly", () => {
    const diff = "@@ -0,0 +1 @@\n+added line";
    const result = parseDiff(diff);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({
      type: "add",
      oldLine: null,
      newLine: 1,
      text: "added line",
    });
  });

  it("parses deleted lines correctly", () => {
    const diff = "@@ -1 +0,0 @@\n-deleted line";
    const result = parseDiff(diff);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({
      type: "del",
      oldLine: 1,
      newLine: null,
      text: "deleted line",
    });
  });

  it("parses context lines correctly", () => {
    const diff = "@@ -1 +1 @@\n context line";
    const result = parseDiff(diff);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({
      type: "context",
      oldLine: 1,
      newLine: 1,
      text: "context line",
    });
  });

  it("parses meta lines correctly", () => {
    const diff = "@@ -1 +1 @@\n\\ No newline at end of file";
    const result = parseDiff(diff);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({
      type: "meta",
      oldLine: null,
      newLine: null,
      text: "\\ No newline at end of file",
    });
  });

  it("handles complex diffs", () => {
    const diff = `@@ -1,3 +1,3 @@
-old
+new
 context
-end`;
    const result = parseDiff(diff);
    expect(result).toHaveLength(5);
    expect(result[0].type).toBe("hunk");
    expect(result[1]).toEqual({ type: "del", oldLine: 1, newLine: null, text: "old" });
    expect(result[2]).toEqual({ type: "add", oldLine: null, newLine: 1, text: "new" });
    expect(result[3]).toEqual({ type: "context", oldLine: 2, newLine: 2, text: "context" });
    expect(result[4]).toEqual({ type: "del", oldLine: 3, newLine: null, text: "end" });
  });
});
