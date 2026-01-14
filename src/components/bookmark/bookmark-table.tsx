"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  ExternalLink,
  MoreHorizontal,
  Archive,
  Trash2,
  Pencil,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  createdAt?: Date | string;
  tags: { tag: { id: string; name: string; color: string | null } }[];
  collection?: { id: string; name: string; color: string | null } | null;
}

interface BookmarkTableProps {
  bookmarks: Bookmark[];
  className?: string;
}

// ============================================================================
// BOOKMARK TABLE ROW
// ============================================================================
function BookmarkTableRow({ bookmark }: { bookmark: Bookmark }) {
  const [isHovered, setIsHovered] = useState(false);

  const toggleFavorite = useToggleFavorite();
  const toggleArchive = useToggleArchive();
  const deleteBookmark = useDeleteBookmark();
  const { openEditBookmark } = useUIStore();

  const handleFavorite = (e: React.MouseEvent) => {
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

  const createdAt = bookmark.createdAt
    ? formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })
    : "—";

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpen}
    >
      {/* Title & Domain */}
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          {/* Favicon */}
          <div className="relative h-8 w-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {bookmark.faviconUrl ? (
              <Image
                src={bookmark.faviconUrl}
                alt=""
                width={20}
                height={20}
                className="rounded-sm"
              />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate max-w-[280px]">
              {bookmark.title || bookmark.url}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {bookmark.domain || "Unknown"}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Collection */}
      <TableCell>
        {bookmark.collection ? (
          <Badge
            variant="secondary"
            className="text-xs font-normal"
            style={{
              backgroundColor: `${bookmark.collection.color}20` || undefined,
              color: bookmark.collection.color || undefined,
              borderColor: `${bookmark.collection.color}40` || undefined,
            }}
          >
            {bookmark.collection.name}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Tags */}
      <TableCell>
        {bookmark.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {bookmark.tags.slice(0, 2).map(({ tag }) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-[10px] h-5 px-1.5 font-normal"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mr-1"
                  style={{ backgroundColor: tag.color || "#6366f1" }}
                />
                {tag.name}
              </Badge>
            ))}
            {bookmark.tags.length > 2 && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                +{bookmark.tags.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Created */}
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {createdAt}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          {/* Favorite button */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    bookmark.isFavorite
                      ? "text-rose-500"
                      : "text-muted-foreground hover:text-foreground",
                    !isHovered && !bookmark.isFavorite && "opacity-0"
                  )}
                  onClick={handleFavorite}
                >
                  <Heart
                    className={cn("h-4 w-4", bookmark.isFavorite && "fill-current")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Open link */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 text-muted-foreground hover:text-foreground",
                    !isHovered && "opacity-0"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpen();
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in new tab</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 text-muted-foreground hover:text-foreground",
                  !isHovered && "opacity-0"
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40"
              onClick={(e) => e.stopPropagation()}
            >
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
      </TableCell>
    </TableRow>
  );
}

// ============================================================================
// BOOKMARK TABLE
// ============================================================================
export function BookmarkTable({ bookmarks, className }: BookmarkTableProps) {
  return (
    <div className={cn("rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40%]">Title</TableHead>
            <TableHead className="w-[15%]">Collection</TableHead>
            <TableHead className="w-[20%]">Tags</TableHead>
            <TableHead className="w-[12%]">Created</TableHead>
            <TableHead className="w-[13%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookmarks.map((bookmark) => (
            <BookmarkTableRow key={bookmark.id} bookmark={bookmark} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
