import { create } from "zustand";

// ============================================================================
// FILTER STORE - Filter & Sort State
// ============================================================================
// Controls search, tag filtering, collection filtering, and sorting

export type SortOption = "createdAt" | "updatedAt" | "title" | "domain";
export type SortDirection = "asc" | "desc";

interface FilterState {
  // Search
  searchQuery: string;

  // Tag filtering
  selectedTags: string[];

  // Collection filtering
  selectedCollection: string | null;

  // Status filters
  showFavorites: boolean;
  showArchived: boolean;

  // Sorting
  sortBy: SortOption;
  sortDirection: SortDirection;
}

interface FilterActions {
  // Search actions
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Tag actions
  toggleTag: (tagId: string) => void;
  setSelectedTags: (tagIds: string[]) => void;
  clearTags: () => void;

  // Collection actions
  setSelectedCollection: (collectionId: string | null) => void;

  // Status actions
  toggleFavorites: () => void;
  toggleArchived: () => void;
  setShowFavorites: (show: boolean) => void;
  setShowArchived: (show: boolean) => void;

  // Sort actions
  setSortBy: (sort: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  toggleSortDirection: () => void;

  // Reset
  resetFilters: () => void;
}

type FilterStore = FilterState & FilterActions;

const initialState: FilterState = {
  searchQuery: "",
  selectedTags: [],
  selectedCollection: null,
  showFavorites: false,
  showArchived: false,
  sortBy: "createdAt",
  sortDirection: "desc",
};

export const useFilterStore = create<FilterStore>()((set) => ({
  ...initialState,

  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearch: () => set({ searchQuery: "" }),

  // Tag actions
  toggleTag: (tagId) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tagId)
        ? state.selectedTags.filter((id) => id !== tagId)
        : [...state.selectedTags, tagId],
    })),
  setSelectedTags: (tagIds) => set({ selectedTags: tagIds }),
  clearTags: () => set({ selectedTags: [] }),

  // Collection actions
  setSelectedCollection: (collectionId) =>
    set({ selectedCollection: collectionId }),

  // Status actions
  toggleFavorites: () =>
    set((state) => ({
      showFavorites: !state.showFavorites,
      showArchived: false, // Mutually exclusive
    })),
  toggleArchived: () =>
    set((state) => ({
      showArchived: !state.showArchived,
      showFavorites: false, // Mutually exclusive
    })),
  setShowFavorites: (show) =>
    set({
      showFavorites: show,
      showArchived: show ? false : undefined,
    } as Partial<FilterState>),
  setShowArchived: (show) =>
    set({
      showArchived: show,
      showFavorites: show ? false : undefined,
    } as Partial<FilterState>),

  // Sort actions
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortDirection: (direction) => set({ sortDirection: direction }),
  toggleSortDirection: () =>
    set((state) => ({
      sortDirection: state.sortDirection === "asc" ? "desc" : "asc",
    })),

  // Reset
  resetFilters: () => set(initialState),
}));

// ============================================================================
// FILTER SELECTORS (for use with TanStack Query)
// ============================================================================
export const useFilterParams = () => {
  const state = useFilterStore();
  return {
    search: state.searchQuery || undefined,
    tags: state.selectedTags.length > 0 ? state.selectedTags : undefined,
    collectionId: state.selectedCollection || undefined,
    isFavorite: state.showFavorites || undefined,
    isArchived: state.showArchived || undefined,
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
  };
};
