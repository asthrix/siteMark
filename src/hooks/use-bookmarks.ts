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

// ============================================================================
// TYPES
// ============================================================================
interface BookmarkData {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  faviconUrl: string | null;
  domain: string | null;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: Date;
  tags: { tag: { id: string; name: string; color: string | null } }[];
  collection?: { id: string; name: string; color: string | null } | null;
}

interface BookmarksResponse {
  bookmarks: BookmarkData[];
  total: number;
  hasMore: boolean;
}

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
  filters?: Partial<BookmarkFilters>,
  options?: Omit<UseQueryOptions<BookmarksResponse>, "queryKey" | "queryFn">
) {
  const queryFilters: BookmarkFilters = {
    isArchived: false,
    sortBy: "createdAt",
    sortDirection: "desc",
    ...filters,
  };

  return useQuery({
    queryKey: bookmarkKeys.list(queryFilters),
    queryFn: () => getBookmarks(queryFilters),
    staleTime: 10000, // 10 seconds
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
      // Invalidate all bookmark lists to show new bookmark
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
    onSuccess: () => {
      // Invalidate to refresh all lists
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
    },
  });
}

// ============================================================================
// DELETE BOOKMARK HOOK - With Optimistic Update
// ============================================================================
export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBookmark(id),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.lists() });

      // Snapshot previous values for rollback
      const previousData = queryClient.getQueriesData<BookmarksResponse>({
        queryKey: bookmarkKeys.lists(),
      });

      // Optimistically remove from all cached lists
      queryClient.setQueriesData<BookmarksResponse>(
        { queryKey: bookmarkKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            bookmarks: old.bookmarks.filter((b) => b.id !== deletedId),
            total: old.total - 1,
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
    },
  });
}

// ============================================================================
// TOGGLE FAVORITE HOOK - With Optimistic Update
// ============================================================================
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleFavorite(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.lists() });

      const previousData = queryClient.getQueriesData<BookmarksResponse>({
        queryKey: bookmarkKeys.lists(),
      });

      // Optimistically toggle favorite
      queryClient.setQueriesData<BookmarksResponse>(
        { queryKey: bookmarkKeys.lists() },
        (old) => {
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
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
    },
  });
}

// ============================================================================
// TOGGLE ARCHIVE HOOK - With Optimistic Update
// ============================================================================
export function useToggleArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleArchive(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.lists() });

      const previousData = queryClient.getQueriesData<BookmarksResponse>({
        queryKey: bookmarkKeys.lists(),
      });

      // Optimistically toggle archive (and remove from current list)
      queryClient.setQueriesData<BookmarksResponse>(
        { queryKey: bookmarkKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            bookmarks: old.bookmarks.filter((b) => b.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
    },
  });
}
