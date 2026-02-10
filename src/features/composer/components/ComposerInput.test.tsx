import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ComposerInput } from "./ComposerInput";
import type { ComponentProps } from "react";

type ComposerInputProps = ComponentProps<typeof ComposerInput>;

// Mock dependencies
vi.mock("../hooks/useComposerEditorState", () => ({
  useComposerEditorState: () => ({
    editorState: { text: "" },
    setEditorState: vi.fn(),
  }),
}));

vi.mock("../hooks/useComposerAutocomplete", () => ({
  useComposerAutocomplete: () => ({
    handleKeyDown: vi.fn(),
    suggestions: [],
  }),
}));

vi.mock("../hooks/useComposerImageDrop", () => ({
  useComposerImageDrop: () => ({
    dropTargetRef: { current: null },
    isDragOver: false,
    handleDragOver: vi.fn(),
    handleDragEnter: vi.fn(),
    handleDragLeave: vi.fn(),
    handleDrop: vi.fn(),
    handlePaste: vi.fn(),
  }),
}));

// Mock lucide icons
vi.mock("lucide-react/dist/esm/icons/image-plus", () => ({ default: () => <svg data-testid="icon-image-plus" /> }));
vi.mock("lucide-react/dist/esm/icons/chevron-down", () => ({ default: () => <svg data-testid="icon-chevron-down" /> }));
vi.mock("lucide-react/dist/esm/icons/chevron-up", () => ({ default: () => <svg data-testid="icon-chevron-up" /> }));
vi.mock("lucide-react/dist/esm/icons/mic", () => ({ default: () => <svg data-testid="icon-mic" /> }));
vi.mock("lucide-react/dist/esm/icons/square", () => ({ default: () => <svg data-testid="icon-square" /> }));
vi.mock("lucide-react/dist/esm/icons/plus", () => ({ default: () => <svg data-testid="icon-plus" /> }));

describe("ComposerInput", () => {
  const defaultProps: ComposerInputProps = {
    text: "",
    disabled: false,
    sendLabel: "Send",
    canStop: false,
    canSend: false,
    isProcessing: false,
    onStop: vi.fn(),
    onSend: vi.fn(),
    onTextChange: vi.fn(),
    onSelectionChange: vi.fn(),
    onKeyDown: vi.fn(),
    textareaRef: { current: document.createElement("textarea") },
    suggestionsOpen: false,
    suggestions: [],
    highlightIndex: -1,
    onHighlightIndex: vi.fn(),
    onSelectSuggestion: vi.fn(),
  };

  const renderComponent = (props: Partial<ComposerInputProps> = {}) => {
    return render(<ComposerInput {...defaultProps} {...props} />);
  };

  it("renders the input area", () => {
    renderComponent();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("handles text input", () => {
    const onTextChange = vi.fn();
    renderComponent({ onTextChange });
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Hello world" } });
    expect(onTextChange).toHaveBeenCalledWith("Hello world", expect.any(Number));
  });

  it("calls onSend when send button is clicked", () => {
    const onSend = vi.fn();
    renderComponent({ onSend, canSend: true });
    
    // Find the send button (it's the one with sendLabel when not loading/stopping)
    const sendButton = screen.getByLabelText("Send");
    fireEvent.click(sendButton);
    expect(onSend).toHaveBeenCalled();
  });

  it("calls onStop when stop button is clicked", () => {
    const onStop = vi.fn();
    renderComponent({ onStop, canStop: true, isProcessing: true });
    
    const stopButton = screen.getByLabelText("Stop");
    fireEvent.click(stopButton);
    expect(onStop).toHaveBeenCalled();
  });

  it("renders disabled state correctly", () => {
    renderComponent({ disabled: true });
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("shows placeholder text", () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/Ask Codex to do something/i)).toBeInTheDocument();
  });
});
