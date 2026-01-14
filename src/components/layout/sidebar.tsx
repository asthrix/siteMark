"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { useFilterStore } from "@/store/filter-store";
import { useCollections } from "@/hooks/use-collections";
import { useTags, useDeleteTag } from "@/hooks/use-tags";
import { cn } from "@/lib/utils";
import { CollectionDialog } from "@/components/collection/collection-dialog";
import { TagDialog } from "@/components/tag/tag-dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { UserProfile } from "@/components/ui/user-profile";
import Image from "next/image";

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
  const router = useRouter();
  const { isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const { selectedTags, toggleTag } = useFilterStore();
  const { data: collections } = useCollections();
  const { data: tags } = useTags();
  const deleteTag = useDeleteTag();

  // Handle tag click for filtering
  const handleTagClick = (tagId: string) => {
    toggleTag(tagId);
    if (pathname !== "/bookmarks") {
      router.push("/bookmarks");
    }
  };

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
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "relative flex h-screen flex-col border-r border-border/50 overflow-visible",
          "bg-sidebar/50 backdrop-blur-xl"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b border-border/50 px-3">
          {isSidebarCollapsed ? (
            // Collapsed: Logo with expand button on right
            <div className="flex w-full items-center justify-between">
              {/* Logo - clickable */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center justify-center cursor-pointer group"
                    onClick={toggleSidebarCollapse}
                  >
                    <Image
                      src="/images/logo.png"
                      alt="Logo"
                      width={36}
                      height={36}
                      className="size-9 rounded-full shrink-0 transition-transform group-hover:scale-105"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
              {/* Expand button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={toggleSidebarCollapse}
                  >
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            // Expanded: Show logo, title, and collapse button
            <>
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="size-9 rounded-full shrink-0"
              />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg tracking-tight ml-3"
              >
                SiteMark
              </motion.span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-8 w-8 shrink-0"
                onClick={toggleSidebarCollapse}
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          )}
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
                    tags.slice(0, 10).map((tag: TagData) => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                      <ContextMenu key={tag.id}>
                        <ContextMenuTrigger>
                          <Badge
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                              "cursor-pointer text-xs transition-colors hover:bg-accent",
                              isSelected && "ring-2 ring-primary ring-offset-1"
                            )}
                            style={{
                              borderColor: tag.color || undefined,
                              color: isSelected ? undefined : tag.color || undefined,
                              backgroundColor: isSelected ? tag.color || undefined : undefined,
                            }}
                            onClick={() => handleTagClick(tag.id)}
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
                    );
                  })
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

        {/* Footer - User Profile */}
        <div className="border-t border-border/50 p-3">
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/settings">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <UserProfile />
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
