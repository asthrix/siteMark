"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  type CreateCollectionInput,
  type UpdateCollectionInput,
} from "@/app/actions/collections";

// ============================================================================
// QUERY KEYS
// ============================================================================
export const collectionKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionKeys.all, "list"] as const,
  detail: (id: string) => [...collectionKeys.all, "detail", id] as const,
};

// ============================================================================
// GET COLLECTIONS HOOK
// ============================================================================
export function useCollections() {
  return useQuery({
    queryKey: collectionKeys.lists(),
    queryFn: () => getCollections(),
    staleTime: 60000, // 1 minute
  });
}

// ============================================================================
// CREATE COLLECTION HOOK
// ============================================================================
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCollectionInput) => createCollection(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

// ============================================================================
// UPDATE COLLECTION HOOK
// ============================================================================
export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCollectionInput) => updateCollection(input),
    onSuccess: (data) => {
      queryClient.setQueryData(collectionKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

// ============================================================================
// DELETE COLLECTION HOOK
// ============================================================================
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: collectionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}
