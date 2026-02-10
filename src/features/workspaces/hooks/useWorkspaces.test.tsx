import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWorkspaces } from "./useWorkspaces";
import * as tauri from "../../../services/tauri";

// Mock Tauri services
vi.mock("../../../services/tauri", () => ({
  listWorkspaces: vi.fn(),
  addWorkspace: vi.fn(),
  addClone: vi.fn(),
  addWorktree: vi.fn(),
  removeWorkspace: vi.fn(),
  pickWorkspacePath: vi.fn(),
}));

describe("useWorkspaces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads workspaces on mount", async () => {
    const mockWorkspaces = [
      { id: "ws-1", name: "Workspace 1", settings: {} },
      { id: "ws-2", name: "Workspace 2", settings: {} },
    ];
    vi.mocked(tauri.listWorkspaces).mockResolvedValue(mockWorkspaces as any);

    const { result } = renderHook(() => useWorkspaces());

    expect(result.current.hasLoaded).toBe(false);

    await waitFor(() => {
      expect(result.current.hasLoaded).toBe(true);
    });

    expect(result.current.workspaces).toEqual(mockWorkspaces);
  });

  it("handles empty workspace list", async () => {
    vi.mocked(tauri.listWorkspaces).mockResolvedValue([]);

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.hasLoaded).toBe(true);
    });

    expect(result.current.workspaces).toEqual([]);
  });

  it("adds a workspace via file picker", async () => {
    const newWorkspace = { id: "ws-new", name: "New Workspace", settings: {} };
    vi.mocked(tauri.listWorkspaces).mockResolvedValue([]);
    vi.mocked(tauri.pickWorkspacePath).mockResolvedValue("/path/to/new");
    vi.mocked(tauri.addWorkspace).mockResolvedValue(newWorkspace as any);

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.hasLoaded).toBe(true);
    });

    await act(async () => {
      await result.current.addWorkspace();
    });

    expect(tauri.pickWorkspacePath).toHaveBeenCalled();
    expect(tauri.addWorkspace).toHaveBeenCalledWith("/path/to/new", null);
    expect(result.current.workspaces).toContainEqual(newWorkspace);
    expect(result.current.activeWorkspaceId).toBe("ws-new");
  });

  it("does not add workspace if picker is cancelled", async () => {
    vi.mocked(tauri.listWorkspaces).mockResolvedValue([]);
    vi.mocked(tauri.pickWorkspacePath).mockResolvedValue(null);

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.hasLoaded).toBe(true);
    });

    await act(async () => {
      await result.current.addWorkspace();
    });

    expect(tauri.addWorkspace).not.toHaveBeenCalled();
    expect(result.current.workspaces).toEqual([]);
  });

  it("adds a clone agent", async () => {
    const sourceWorkspace = { id: "ws-src", name: "Source", settings: {} };
    const cloneWorkspace = { id: "ws-clone", name: "Clone", settings: {} };
    vi.mocked(tauri.listWorkspaces).mockResolvedValue([sourceWorkspace] as any);
    vi.mocked(tauri.addClone).mockResolvedValue(cloneWorkspace as any);

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.hasLoaded).toBe(true);
    });

    await act(async () => {
      await result.current.addCloneAgent(
        sourceWorkspace as any,
        "Clone",
        "/copies"
      );
    });

    expect(tauri.addClone).toHaveBeenCalledWith("ws-src", "/copies", "Clone");
    expect(result.current.workspaces).toContainEqual(cloneWorkspace);
    expect(result.current.activeWorkspaceId).toBe("ws-clone");
  });

  it("adds a worktree agent", async () => {
    const parentWorkspace = { id: "ws-parent", name: "Parent", settings: {} };
    const worktreeWorkspace = { id: "ws-tree", name: "Tree", settings: {} };
    vi.mocked(tauri.listWorkspaces).mockResolvedValue([parentWorkspace] as any);
    vi.mocked(tauri.addWorktree).mockResolvedValue(worktreeWorkspace as any);

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.hasLoaded).toBe(true);
    });

    await act(async () => {
      await result.current.addWorktreeAgent(parentWorkspace as any, "feature-branch");
    });

    expect(tauri.addWorktree).toHaveBeenCalledWith(
      "ws-parent",
      "feature-branch",
      null,
      true
    );
    expect(result.current.workspaces).toContainEqual(worktreeWorkspace);
    expect(result.current.activeWorkspaceId).toBe("ws-tree");
  });

  it("removes a workspace", async () => {
    const workspaceToRemove = { id: "ws-remove", name: "Remove Me", settings: {} };
    vi.mocked(tauri.listWorkspaces).mockResolvedValue([workspaceToRemove] as any);
    vi.mocked(tauri.removeWorkspace).mockResolvedValue(undefined);
    
    // Mock the dialog confirm to return true
    vi.mock("@tauri-apps/plugin-dialog", () => ({
      ask: vi.fn().mockResolvedValue(true),
      message: vi.fn(),
    }));

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.hasLoaded).toBe(true);
    });

    await act(async () => {
      await result.current.removeWorkspace("ws-remove");
    });

    expect(tauri.removeWorkspace).toHaveBeenCalledWith("ws-remove");
    expect(result.current.workspaces).toEqual([]);
  });

  it("sets active workspace id", async () => {
    const ws1 = { id: "ws-1", name: "1", settings: {} };
    const ws2 = { id: "ws-2", name: "2", settings: {} };
    vi.mocked(tauri.listWorkspaces).mockResolvedValue([ws1, ws2] as any);

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.hasLoaded).toBe(true);
    });

    act(() => {
      result.current.setActiveWorkspaceId("ws-2");
    });

    expect(result.current.activeWorkspaceId).toBe("ws-2");
    expect(result.current.activeWorkspace).toEqual(ws2);
  });

  it("groups workspaces correctly", async () => {
    const ws1 = { id: "ws-1", name: "1", settings: { groupId: "g1" } };
    const ws2 = { id: "ws-2", name: "2", settings: { groupId: "g1" } };
    const ws3 = { id: "ws-3", name: "3", settings: {} }; // Ungrouped

    vi.mocked(tauri.listWorkspaces).mockResolvedValue([ws1, ws2, ws3] as any);

    const appSettings = {
        workspaceGroups: [{ id: "g1", name: "Group 1", sortOrder: 1, copiesFolder: null }]
    } as any;

    const { result } = renderHook(() => useWorkspaces({ appSettings }));

    await waitFor(() => {
      expect(result.current.hasLoaded).toBe(true);
    });

    const grouped = result.current.groupedWorkspaces;
    expect(grouped).toHaveLength(2); // Group 1 + Ungrouped
    
    const group1 = grouped.find(g => g.id === "g1");
    expect(group1?.workspaces).toHaveLength(2);
    expect(group1?.name).toBe("Group 1");

    const ungrouped = grouped.find(g => g.id === null);
    expect(ungrouped?.workspaces).toHaveLength(1);
    expect(ungrouped?.name).toBe("Ungrouped");
  });

  it("validates inputs before adding clone", async () => {
    vi.mocked(tauri.listWorkspaces).mockResolvedValue([]);
    const sourceWorkspace = { id: "ws-src", name: "Source", settings: {} };

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.hasLoaded).toBe(true);
    });

    // Empty name
    const nullResult = await result.current.addCloneAgent(
      sourceWorkspace as any,
      "   ", 
      "/copies"
    );
    expect(nullResult).toBeNull();
    expect(tauri.addClone).not.toHaveBeenCalled();

    // Empty folder throws
    await expect(
      result.current.addCloneAgent(sourceWorkspace as any, "Name", "   ")
    ).rejects.toThrow("Copies folder is required.");
  });
});
