import { describe, it, expect } from "vitest";
import { normalizeItem } from "./threadItems";
import type { ConversationItem } from "../types";

describe("normalizeItem", () => {
  it("truncates long message text", () => {
    const longText = "a".repeat(20005);
    const item: ConversationItem = {
      id: "1",
      kind: "message",
      role: "assistant",
      text: longText,
    };
    const normalized = normalizeItem(item) as Extract<ConversationItem, { kind: "message" }>;
    expect(normalized.text.length).toBeLessThan(longText.length);
    expect(normalized.text.endsWith("...")).toBe(true);
  });

  it("truncates long reasoning content", () => {
    const longContent = "b".repeat(20005);
    const item: ConversationItem = {
      id: "2",
      kind: "reasoning",
      summary: "summary",
      content: longContent,
    };
    const normalized = normalizeItem(item) as Extract<ConversationItem, { kind: "reasoning" }>;
    expect(normalized.content.length).toBeLessThan(longContent.length);
    expect(normalized.content.endsWith("...")).toBe(true);
  });

  it("truncates long tool output", () => {
    const longOutput = "c".repeat(20005);
    const item: ConversationItem = {
      id: "3",
      kind: "tool",
      toolType: "someTool",
      title: "Tool",
      detail: "Detail",
      status: "completed",
      output: longOutput,
    };
    const normalized = normalizeItem(item) as Extract<ConversationItem, { kind: "tool" }>;
    expect(normalized.output?.length).toBeLessThan(longOutput.length);
    expect(normalized.output?.endsWith("...")).toBe(true);
  });
});
