"use client";

import { motion } from "motion/react";
import Image from "next/image";
import {
  Star,
  ExternalLink,
  Archive,
  Trash2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToggleFavorite, useToggleArchive, useDeleteBookmark } from "@/hooks/use-bookmarks";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================
interface BookmarkTag {
  tag: {
    id: string;
    name: string;
    color: string | null;
  };
}

interface BookmarkCollection {
  id: string;
  name: string;
  color: string | null;
}

interface Bookmark {
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
  tags: BookmarkTag[];
  collection: BookmarkCollection | null;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
}

// ============================================================================
// BOOKMARK CARD COMPONENT
// ============================================================================
export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const { openEditBookmark } = useUIStore();
  const toggleFavorite = useToggleFavorite();
  const toggleArchive = useToggleArchive();
  const deleteBookmark = useDeleteBookmark();

  const handleOpenUrl = () => {
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite.mutate(bookmark.id);
  };

  const handleArchive = () => {
    toggleArchive.mutate(bookmark.id);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this bookmark?")) {
      deleteBookmark.mutate(bookmark.id);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 400,
        }}
      >
        <Card
          className={cn(
            "group relative overflow-hidden cursor-pointer",
            "border-2 border-border/50 hover:border-primary/50",
            "bg-card/80 backdrop-blur-sm",
            "transition-all duration-300 ease-out",
            "shadow-lg shadow-background/50 hover:shadow-primary/20"
          )}
          onClick={handleOpenUrl}
        >
          {/* Thumbnail */}
          {bookmark.imageUrl && (
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={bookmark.imageUrl}
                alt={bookmark.title || "Bookmark thumbnail"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />

              {/* Favorite button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "absolute top-2 right-2 z-10",
                      "bg-background/80 backdrop-blur-sm",
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      "hover:bg-background/90"
                    )}
                    onClick={handleFavorite}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4 transition-colors",
                        bookmark.isFavorite
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"}
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          <CardContent className="p-4 space-y-3">
            {/* Domain with favicon */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {bookmark.faviconUrl && (
                  <Image
                    src={bookmark.faviconUrl}
                    alt=""
                    width={14}
                    height={14}
                    className="rounded-sm flex-shrink-0"
                  />
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {bookmark.domain}
                </span>
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-6 w-6 opacity-0 group-hover:opacity-100",
                      "transition-opacity"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditBookmark(bookmark.id); }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenUrl(); }}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in new tab
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleArchive(); }}>
                    <Archive className="h-4 w-4 mr-2" />
                    {bookmark.isArchived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
              {bookmark.title || bookmark.url}
            </h3>

            {/* Description */}
            {bookmark.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {bookmark.description}
              </p>
            )}
          </CardContent>

          {/* Tags & Collection */}
          {(bookmark.tags.length > 0 || bookmark.collection) && (
            <CardFooter className="p-4 pt-0 flex flex-wrap gap-1.5">
              {bookmark.collection && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${bookmark.collection.color}20`,
                    borderColor: bookmark.collection.color || undefined,
                    color: bookmark.collection.color || undefined,
                  }}
                >
                  {bookmark.collection.name}
                </Badge>
              )}
              {bookmark.tags.slice(0, 3).map(({ tag }) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: tag.color || undefined,
                    color: tag.color || undefined,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {bookmark.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{bookmark.tags.length - 3}
                </Badge>
              )}
            </CardFooter>
          )}

          {/* No image placeholder */}
          {!bookmark.imageUrl && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-chart-2 to-chart-4" />
          )}
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
