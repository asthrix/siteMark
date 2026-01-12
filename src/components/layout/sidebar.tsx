"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Bookmark,
  Star,
  Archive,
  FolderOpen,
  Settings,
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useUIStore } from "@/store/ui-store";
import { useCollections } from "@/hooks/use-collections";
import { useTags, useDeleteTag } from "@/hooks/use-tags";
import { cn } from "@/lib/utils";
import { CollectionDialog } from "@/components/collection/collection-dialog";
import { TagDialog } from "@/components/tag/tag-dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";

// ============================================================================
// TYPES
// ============================================================================
interface TagData {
  id: string;
  name: string;
  color?: string | null;
}

interface CollectionData {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  _count: { bookmarks: number };
}

// ============================================================================
// SIDEBAR
// ============================================================================
export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const { data: collections } = useCollections();
  const { data: tags } = useTags();
  const deleteTag = useDeleteTag();

  // Dialog states
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);
  const [deleteTagDialogOpen, setDeleteTagDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<TagData | null>(null);

  const navItems = [
    {
      icon: Bookmark,
      label: "All Bookmarks",
      href: "/bookmarks",
      isActive: pathname === "/bookmarks",
    },
    {
      icon: Star,
      label: "Favorites",
      href: "/favorites",
      isActive: pathname === "/favorites",
    },
    {
      icon: Archive,
      label: "Archived",
      href: "/archived",
      isActive: pathname === "/archived",
    },
  ];

  const handleEditTag = (tag: TagData) => {
    setEditingTag(tag);
    setTagDialogOpen(true);
  };

  const handleDeleteTagClick = (tag: TagData) => {
    setTagToDelete(tag);
    setDeleteTagDialogOpen(true);
  };

  const handleConfirmDeleteTag = async () => {
    if (tagToDelete) {
      await deleteTag.mutateAsync(tagToDelete.id);
      setDeleteTagDialogOpen(false);
      setTagToDelete(null);
    }
  };

  const handleTagDialogClose = (open: boolean) => {
    setTagDialogOpen(open);
    if (!open) {
      setEditingTag(null);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "relative flex h-screen flex-col border-r border-border/50",
          "bg-sidebar/50 backdrop-blur-xl"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center gap-3 border-b border-border/50 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bookmark className="h-5 w-5" />
          </div>
          {!isSidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg tracking-tight"
            >
              VisualMark
            </motion.span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={toggleSidebarCollapse}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                isSidebarCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Main Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const NavContent = (
                <>
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </>
              );

              return isSidebarCollapsed ? (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-lg",
                        "transition-colors duration-200",
                        item.isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-lg px-3",
                    "transition-colors duration-200",
                    item.isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {NavContent}
                </Link>
              );
            })}
          </nav>

          {/* Collections Section */}
          {!isSidebarCollapsed && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Collections
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setCollectionDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <nav className="space-y-1">
                  {collections && collections.length > 0 ? (
                    collections.map((collection: CollectionData) => (
                      <Link
                        key={collection.id}
                        href={`/collections/${collection.id}`}
                        className={cn(
                          "flex h-9 items-center gap-3 rounded-lg px-3",
                          "transition-colors duration-200",
                          pathname === `/collections/${collection.id}`
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <div
                          className="h-3 w-3 rounded-sm shrink-0"
                          style={{ backgroundColor: collection.color || "#6366f1" }}
                        />
                        <span className="truncate flex-1">{collection.name}</span>
                        <Badge variant="secondary" className="text-xs h-5 px-1.5">
                          {collection._count.bookmarks}
                        </Badge>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground px-3 py-2">
                      No collections yet
                    </p>
                  )}
                  {(collections?.length ?? 0) > 0 && (
                    <Link
                      href="/collections"
                      className="flex h-9 items-center gap-3 rounded-lg px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span className="text-sm">View all</span>
                    </Link>
                  )}
                </nav>
              </div>
            </>
          )}

          {/* Tags Section */}
          {!isSidebarCollapsed && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Tags
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setEditingTag(null);
                      setTagDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 px-3">
                  {tags && tags.length > 0 ? (
                    tags.slice(0, 10).map((tag: TagData) => (
                      <ContextMenu key={tag.id}>
                        <ContextMenuTrigger>
                          <Badge
                            variant="outline"
                            className="cursor-pointer text-xs transition-colors hover:bg-accent"
                            style={{
                              borderColor: tag.color || undefined,
                              color: tag.color || undefined,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-32">
                          <ContextMenuItem onClick={() => handleEditTag(tag)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => handleDeleteTagClick(tag)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">
                      No tags yet
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border/50 p-3">
          {isSidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/settings">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/settings">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  pathname === "/settings" && "bg-sidebar-accent"
                )}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Button>
            </Link>
          )}
        </div>
      </motion.aside>

      {/* Dialogs */}
      <CollectionDialog
        open={collectionDialogOpen}
        onOpenChange={setCollectionDialogOpen}
      />
      <TagDialog
        open={tagDialogOpen}
        onOpenChange={handleTagDialogClose}
        tag={editingTag}
      />
      <DeleteDialog
        open={deleteTagDialogOpen}
        onOpenChange={setDeleteTagDialogOpen}
        onConfirm={handleConfirmDeleteTag}
        title="Delete Tag"
        description={`Are you sure you want to delete "${tagToDelete?.name}"? This will remove the tag from all bookmarks.`}
        isLoading={deleteTag.isPending}
      />
    </TooltipProvider>
  );
}
