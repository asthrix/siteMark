"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  type CreateTagInput,
  type UpdateTagInput,
} from "@/app/actions/tags";

// ============================================================================
// QUERY KEYS
// ============================================================================
export const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  detail: (id: string) => [...tagKeys.all, "detail", id] as const,
};

// ============================================================================
// GET TAGS HOOK
// ============================================================================
export function useTags() {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: () => getTags(),
    staleTime: 60000, // 1 minute
  });
}

// ============================================================================
// CREATE TAG HOOK
// ============================================================================
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) => createTag(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}

// ============================================================================
// UPDATE TAG HOOK
// ============================================================================
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTagInput) => updateTag(input),
    onSuccess: (data) => {
      queryClient.setQueryData(tagKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}

// ============================================================================
// DELETE TAG HOOK
// ============================================================================
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: tagKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}
