"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

// ============================================================================
// QUERY CLIENT PROVIDER
// ============================================================================
// Wraps the app with TanStack Query's QueryClientProvider

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Short stale time for responsive updates
            staleTime: 10 * 1000, // 10 seconds
            // Refetch on window focus for fresh data
            refetchOnWindowFocus: true,
            // Retry once on failure
            retry: 1,
            // Keep previous data while refetching
            placeholderData: (prev: unknown) => prev,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
