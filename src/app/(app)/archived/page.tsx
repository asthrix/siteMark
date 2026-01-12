"use client";

import { Archive } from "lucide-react";
import { motion } from "motion/react";
import { TopBar } from "@/components/layout/top-bar";
import { MasonryGrid } from "@/components/layout/masonry-grid";
import { BookmarkCard } from "@/components/bookmark/bookmark-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useUIStore } from "@/store/ui-store";

// ============================================================================
// LOADING SKELETON
// ============================================================================
function BookmarkSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-2 p-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// ============================================================================
// BOOKMARK TYPE
// ============================================================================
interface BookmarkType {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  faviconUrl: string | null;
  domain: string | null;
  isFavorite: boolean;
  isArchived: boolean;
  tags: { tag: { id: string; name: string; color: string | null } }[];
  collection?: { id: string; name: string; color: string | null } | null;
}

// ============================================================================
// ARCHIVED PAGE
// ============================================================================
export default function ArchivedPage() {
  const { viewMode } = useUIStore();
  const { data, isLoading, error } = useBookmarks({ isArchived: true });

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <TopBar title="Archived" />

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4">
                <BookmarkSkeleton />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <p className="text-destructive mb-4">Failed to load archived bookmarks</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.bookmarks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
          >
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Archive className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No archived bookmarks</h2>
            <p className="text-muted-foreground max-w-sm">
              Archived bookmarks will appear here. Use archive to hide bookmarks without deleting them.
            </p>
          </motion.div>
        )}

        {/* Bookmarks Grid */}
        {!isLoading && !error && data && data.bookmarks.length > 0 && (
          <>
            {viewMode === "grid" ? (
              <MasonryGrid columns={4} gap="md">
                {data.bookmarks.map((bookmark: BookmarkType) => (
                  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </MasonryGrid>
            ) : (
              <div className="space-y-3 max-w-4xl">
                {data.bookmarks.map((bookmark: BookmarkType) => (
                  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center text-sm text-muted-foreground">
              {data.total} archived bookmark{data.total !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
