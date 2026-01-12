"use client";

import { Bookmark, Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { TopBar } from "@/components/layout/top-bar";
import { MasonryGrid } from "@/components/layout/masonry-grid";
import { BookmarkCard } from "@/components/bookmark/bookmark-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useUIStore } from "@/store/ui-store";
import { useFilterStore } from "@/store/filter-store";

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
// EMPTY STATE
// ============================================================================
function EmptyState() {
  const { setAddBookmarkOpen } = useUIStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="relative mb-8">
        <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Bookmark className="h-12 w-12 text-primary" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="h-6 w-6 text-chart-3" />
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold mb-2">No bookmarks yet</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Start building your visual collection by adding your first bookmark.
        We&apos;ll automatically fetch previews and organize everything beautifully.
      </p>

      <Button size="lg" onClick={() => setAddBookmarkOpen(true)} className="gap-2">
        <Plus className="h-5 w-5" />
        Add Your First Bookmark
      </Button>
    </motion.div>
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
// BOOKMARKS PAGE
// ============================================================================
export default function BookmarksPage() {
  const { viewMode } = useUIStore();
  const { selectedTags } = useFilterStore();
  const { data, isLoading, error } = useBookmarks({
    isArchived: false,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <TopBar title="All Bookmarks" />

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
            <p className="text-destructive mb-4">Failed to load bookmarks</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.bookmarks.length === 0 && <EmptyState />}

        {/* Bookmarks Grid */}
        {!isLoading && !error && data && data.bookmarks.length > 0 && (
          <>
            {viewMode === "grid" ? (
              <MasonryGrid columns={4} gap="md" key={selectedTags.join("-") + data.bookmarks.length}>
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

            {/* Bookmark count */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              {data.total} bookmark{data.total !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
