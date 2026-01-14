"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Heart,
  ExternalLink,
  MoreHorizontal,
  Archive,
  Trash2,
  Pencil,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  useToggleFavorite,
  useToggleArchive,
  useDeleteBookmark,
} from "@/hooks/use-bookmarks";
import { useUIStore } from "@/store/ui-store";

// ============================================================================
// TYPES
// ============================================================================
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
  tags: { tag: { id: string; name: string; color: string | null } }[];
  collection?: { id: string; name: string; color: string | null } | null;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  className?: string;
}

// ============================================================================
// BOOKMARK CARD - 21st.dev Style
// ============================================================================
export function BookmarkCard({ bookmark, className }: BookmarkCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const toggleFavorite = useToggleFavorite();
  const toggleArchive = useToggleArchive();
  const deleteBookmark = useDeleteBookmark();
  const { openEditBookmark } = useUIStore();

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate(bookmark.id);
  };

  const handleArchive = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleArchive.mutate(bookmark.id);
  };

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    deleteBookmark.mutate(bookmark.id);
  };

  const handleEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    openEditBookmark(bookmark.id);
  };

  const handleOpen = () => {
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      className={cn(
        "group relative rounded-xl overflow-hidden cursor-pointer",
        "bg-card border border-border",
        "shadow-md",
        "transition-all duration-300",
        "hover:shadow-xl hover:border-primary/30",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpen}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header - Domain info + Actions */}
      <div className="flex items-center justify-between p-3 pb-0">
        <div className="flex items-center gap-2">
          {/* Favicon */}
          <div className="relative h-6 w-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {bookmark.faviconUrl ? (
              <Image
                src={bookmark.faviconUrl}
                alt=""
                width={16}
                height={16}
                className="rounded-sm"
              />
            ) : (
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
          {/* Domain */}
          <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
            {bookmark.domain || "Unknown"}
          </span>
          {/* Verified badge */}
          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
        </div>

        {/* Collection badge */}
        {bookmark.collection ? (
          <Badge
            variant="secondary"
            className="text-xs font-normal h-6 px-2"
            style={{
              backgroundColor: `${bookmark.collection.color}20` || undefined,
              color: bookmark.collection.color || undefined,
              borderColor: `${bookmark.collection.color}40` || undefined,
            }}
          >
            {bookmark.collection.name}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs font-normal h-6 px-2">
            Bookmark
          </Badge>
        )}
      </div>

      {/* Thumbnail - Large centered */}
      <div className="relative mx-2 mt-3 rounded-lg overflow-hidden bg-muted aspect-video">
        {bookmark.imageUrl ? (
          <Image
            src={bookmark.imageUrl}
            alt={bookmark.title || "Bookmark thumbnail"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-500 border border-border rounded-lg",
              isHovered && "scale-[1.02] "
            )}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Favorite button - Overlay */}
        <motion.button
          onClick={handleFavorite}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered || bookmark.isFavorite ? 1 : 0 }}
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-full",
            "bg-rose-100 backdrop-blur-sm",
            "border border-border/50",
            "transition-colors",
            bookmark.isFavorite ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart className={cn("h-4 w-4", bookmark.isFavorite && "fill-current")} />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h3 className="font-medium text-sm leading-snug line-clamp-1 text-foreground">
          {bookmark.title || bookmark.url}
        </h3>

        {/* Description */}
        {bookmark.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {bookmark.description}
          </p>
        )}

        {/* Tags */}
        
      </div>

      {/* Footer - Actions */}
      <div className="flex items-center justify-between gap-1 px-3 pb-3">
        <div className="">
          {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {bookmark.tags.slice(0, 3).map(({ tag }) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-[10px] h-5 px-1.5 font-normal border-border/60"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mr-1"
                  style={{ backgroundColor: tag.color || "#6366f1" }}
                />
                {tag.name}
              </Badge>
            ))}
            {bookmark.tags.length > 3 && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                +{bookmark.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        </div>

        <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            handleOpen();
          }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={(e) => handleEdit(e)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleArchive(e)}>
              <Archive className="h-4 w-4 mr-2" />
              {bookmark.isArchived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => handleDelete(e)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
