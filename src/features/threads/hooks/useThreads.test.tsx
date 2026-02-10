import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useThreads } from "./useThreads";
import { useWorkspaces } from "../../workspaces/hooks/useWorkspaces";
import { invoke } from "@tauri-apps/api/core";

// Mock dependencies
vi.mock("../../workspaces/hooks/useWorkspaces");
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("useThreads", () => {
  // Fix: Mock workspace must have all required properties expected by thread actions
  const mockWorkspace = { 
      id: "workspace-123", 
      name: "Test Workspace",
      path: "/test/path", // Added path for normalizeRootPath
      created_at: "2023-01-01",
      updated_at: "2023-01-01"
  };
  
  const mockUseWorkspaces = {
    activeWorkspaceId: "workspace-123",
    workspaces: [mockWorkspace],
    activeWorkspace: mockWorkspace,
  };

  const defaultProps = {
    activeWorkspace: mockWorkspace as any,
    onWorkspaceConnected: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (useWorkspaces as any).mockReturnValue(mockUseWorkspaces);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useThreads(defaultProps));

    expect(result.current.threadsByWorkspace).toEqual({});
    expect(result.current.activeThreadId).toBeNull();
    expect(result.current.threadListLoadingByWorkspace).toEqual({});
  });

  it("starts a new thread", async () => {
    const mockThread = { id: "thread-new", created_at: "2023-01-01" };
    (invoke as any).mockResolvedValue({
      result: {
        thread: mockThread,
      },
    });

    const { result } = renderHook(() => useThreads(defaultProps));

    let newThreadId;
    await act(async () => {
      newThreadId = await result.current.startThread();
    });

    expect(invoke).toHaveBeenCalledWith("start_thread", {
      workspaceId: "workspace-123",
    });
    expect(newThreadId).toBe("thread-new");
    expect(result.current.activeThreadId).toBe("thread-new");
  });

  it("loads older threads (via loadOlderThreadsForWorkspace/listThreads)", async () => {
    const mockThreads = [
      { id: "thread-1", created_at: "2023-01-01" },
      { id: "thread-2", created_at: "2023-01-02" },
    ];
    (invoke as any).mockResolvedValue({
      threads: mockThreads,
      next_cursor: "cursor-123",
    });

    const { result } = renderHook(() => useThreads(defaultProps));

    await act(async () => {
      await result.current.listThreadsForWorkspace(mockWorkspace as any);
    });
    
    expect(invoke).toHaveBeenCalledWith("list_threads", expect.objectContaining({
        workspaceId: "workspace-123"
    }));
  });

  it("renames a thread", async () => {
      const { result } = renderHook(() => useThreads(defaultProps));

      await act(async () => {
          await result.current.renameThread("workspace-123", "thread-1", "New Name");
      });

      expect(invoke).toHaveBeenCalledWith("set_thread_name", {
          workspaceId: "workspace-123",
          threadId: "thread-1",
          name: "New Name"
      });
  });

  it("archives a thread (removeThread)", async () => {
      const { result } = renderHook(() => useThreads(defaultProps));

      await act(async () => {
          await result.current.removeThread("workspace-123", "thread-1");
      });

      expect(invoke).toHaveBeenCalledWith("archive_thread", {
          workspaceId: "workspace-123",
          threadId: "thread-1"
      });
  });
});
