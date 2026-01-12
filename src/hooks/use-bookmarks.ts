"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  toggleFavorite,
  toggleArchive,
  type BookmarkFilters,
  type CreateBookmarkInput,
  type UpdateBookmarkInput,
} from "@/app/actions/bookmarks";
import { useFilterStore } from "@/store/filter-store";

// ============================================================================
// QUERY KEYS
// ============================================================================
export const bookmarkKeys = {
  all: ["bookmarks"] as const,
  lists: () => [...bookmarkKeys.all, "list"] as const,
  list: (filters: BookmarkFilters) => [...bookmarkKeys.lists(), filters] as const,
  details: () => [...bookmarkKeys.all, "detail"] as const,
  detail: (id: string) => [...bookmarkKeys.details(), id] as const,
};

// ============================================================================
// GET BOOKMARKS HOOK
// ============================================================================
export function useBookmarks(
  overrideFilters?: Partial<BookmarkFilters>,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof getBookmarks>>>, "queryKey" | "queryFn">
) {
  const filterStore = useFilterStore();

  const filters: BookmarkFilters = {
    search: filterStore.searchQuery || undefined,
    tags: filterStore.selectedTags.length > 0 ? filterStore.selectedTags : undefined,
    collectionId: filterStore.selectedCollection || undefined,
    isFavorite: filterStore.showFavorites || undefined,
    isArchived: filterStore.showArchived || undefined,
    sortBy: filterStore.sortBy,
    sortDirection: filterStore.sortDirection,
    ...overrideFilters,
  };

  return useQuery({
    queryKey: bookmarkKeys.list(filters),
    queryFn: () => getBookmarks(filters),
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

// ============================================================================
// CREATE BOOKMARK HOOK
// ============================================================================
export function useCreateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookmarkInput) => createBookmark(input),
    onSuccess: () => {
      // Invalidate all bookmark lists
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
    },
  });
}

// ============================================================================
// UPDATE BOOKMARK HOOK
// ============================================================================
export function useUpdateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBookmarkInput) => updateBookmark(input),
    onSuccess: (data) => {
      // Update the specific bookmark in cache
      queryClient.setQueryData(bookmarkKeys.detail(data.id), data);
      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
    },
  });
}

// ============================================================================
// DELETE BOOKMARK HOOK
// ============================================================================
export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBookmark(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: bookmarkKeys.detail(id) });
      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
    },
  });
}

// ============================================================================
// TOGGLE FAVORITE HOOK
// ============================================================================
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleFavorite(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.lists() });

      // Snapshot previous data for rollback
      const previousData = queryClient.getQueriesData({ queryKey: bookmarkKeys.lists() });

      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: bookmarkKeys.lists() },
        (old: Awaited<ReturnType<typeof getBookmarks>> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            bookmarks: old.bookmarks.map((bookmark) =>
              bookmark.id === id
                ? { ...bookmark, isFavorite: !bookmark.isFavorite }
                : bookmark
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
    },
  });
}

// ============================================================================
// TOGGLE ARCHIVE HOOK
// ============================================================================
export function useToggleArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
    },
  });
}
