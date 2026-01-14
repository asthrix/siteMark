import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ============================================================================
// UI STORE - Client UI State
// ============================================================================
// Controls sidebar visibility, dialog states, view modes, and grid layout

export type ViewMode = "grid" | "list" | "compact";

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;

  // Dialogs
  isAddBookmarkOpen: boolean;
  isEditBookmarkOpen: boolean;
  editingBookmarkId: string | null;
  isCommandMenuOpen: boolean;

  // View settings
  viewMode: ViewMode;
  gridColumns: number;
}

interface UIActions {
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;

  // Dialog actions
  setAddBookmarkOpen: (open: boolean) => void;
  openEditBookmark: (bookmarkId: string) => void;
  closeEditBookmark: () => void;
  setCommandMenuOpen: (open: boolean) => void;

  // View actions
  setViewMode: (mode: ViewMode) => void;
  setGridColumns: (columns: number) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      isAddBookmarkOpen: false,
      isEditBookmarkOpen: false,
      editingBookmarkId: null,
      isCommandMenuOpen: false,
      viewMode: "grid",
      gridColumns: 4,

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebarCollapse: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      // Dialog actions
      setAddBookmarkOpen: (open) => set({ isAddBookmarkOpen: open }),
      openEditBookmark: (bookmarkId) =>
        set({
          isEditBookmarkOpen: true,
          editingBookmarkId: bookmarkId,
        }),
      closeEditBookmark: () =>
        set({
          isEditBookmarkOpen: false,
          editingBookmarkId: null,
        }),
      setCommandMenuOpen: (open) => set({ isCommandMenuOpen: open }),

      // View actions
      setViewMode: (mode) => set({ viewMode: mode }),
      setGridColumns: (columns) => set({ gridColumns: columns }),
    }),
    {
      name: "SiteMark-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist view preferences
        viewMode: state.viewMode,
        gridColumns: state.gridColumns,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
