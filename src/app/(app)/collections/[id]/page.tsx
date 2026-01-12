"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MasonryGrid } from "@/components/layout/masonry-grid";
import { BookmarkCard } from "@/components/bookmark/bookmark-card";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useCollections } from "@/hooks/use-collections";
import { getIconComponent } from "@/components/ui/icon-picker";

// ============================================================================
// TYPES
// ============================================================================
interface CollectionType {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  isPublic: boolean;
  _count: { bookmarks: number };
}

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
// COLLECTION DETAIL PAGE
// ============================================================================
export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: collections, isLoading: isLoadingCollections } = useCollections();
  const { data: bookmarksData, isLoading: isLoadingBookmarks } = useBookmarks({
    collectionId: id,
    isArchived: false,
  });

  const collection = collections?.find((c: CollectionType) => c.id === id);
  const IconComponent = collection?.icon
    ? getIconComponent(collection.icon)
    : null;

  if (!isLoadingCollections && !collection) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-4 px-6">
          {/* Back button */}
          <Link href="/collections">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          {/* Collection info */}
          {isLoadingCollections ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ) : collection && (
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center h-10 w-10 rounded-lg"
                style={{ backgroundColor: collection.color || "#6366F1" }}
              >
                {IconComponent && <IconComponent className="h-5 w-5 text-white" />}
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  {collection.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {collection._count.bookmarks} bookmark
                    {collection._count.bookmarks !== 1 ? "s" : ""}
                  </span>
                  {collection.isPublic && (
                    <Badge variant="outline" className="text-xs">
                      Public
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1" />

          {/* Settings */}
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Description */}
        {collection?.description && (
          <div className="px-6 pb-4">
            <p className="text-sm text-muted-foreground max-w-2xl">
              {collection.description}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Loading */}
        {isLoadingBookmarks && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4">
                <Skeleton className="aspect-video w-full rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoadingBookmarks && bookmarksData?.bookmarks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center"
          >
            <p className="text-muted-foreground">
              No bookmarks in this collection yet.
            </p>
          </motion.div>
        )}

        {/* Bookmarks Grid */}
        {!isLoadingBookmarks && bookmarksData && bookmarksData.bookmarks.length > 0 && (
          <MasonryGrid columns={4} gap="md">
            {bookmarksData.bookmarks.map((bookmark: BookmarkType) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </MasonryGrid>
        )}
      </div>
    </div>
  );
}
