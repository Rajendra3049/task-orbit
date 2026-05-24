"use client";

import { create } from "zustand";

export type WorkspaceMode = "personal" | "office";

type UiState = {
  isSidebarCollapsed: boolean;
  mode: WorkspaceMode;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  setMode: (mode: WorkspaceMode) => void;
  toggleMode: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  mode: "personal",
  setSidebarCollapsed: (isCollapsed) => set({ isSidebarCollapsed: isCollapsed }),
  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((state) => ({ mode: state.mode === "personal" ? "office" : "personal" })),
}));
