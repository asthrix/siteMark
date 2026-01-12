"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Bookmark,
  Star,
  Archive,
  FolderOpen,
  Tag,
  Settings,
  ChevronLeft,
  Plus,
  LogOut,
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
import { useUIStore } from "@/store/ui-store";
import { useFilterStore } from "@/store/filter-store";
import { useCollections } from "@/hooks/use-collections";
import { useTags } from "@/hooks/use-tags";
import { cn } from "@/lib/utils";

// ============================================================================
// SIDEBAR
// ============================================================================
// Navigation sidebar with collections and tags

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const {
    showFavorites,
    showArchived,
    setShowFavorites,
    setShowArchived,
    selectedCollection,
    setSelectedCollection,
    selectedTags,
    toggleTag,
    resetFilters,
  } = useFilterStore();
  const { data: collections } = useCollections();
  const { data: tags } = useTags();

  const navItems = [
    {
      icon: Bookmark,
      label: "All Bookmarks",
      href: "/",
      isActive: pathname === "/" && !showFavorites && !showArchived,
      onClick: () => resetFilters(),
    },
    {
      icon: Star,
      label: "Favorites",
      href: "/",
      isActive: showFavorites,
      onClick: () => {
        resetFilters();
        setShowFavorites(true);
      },
    },
    {
      icon: Archive,
      label: "Archived",
      href: "/",
      isActive: showArchived,
      onClick: () => {
        resetFilters();
        setShowArchived(true);
      },
    },
  ];

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
                      onClick={item.onClick}
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
                  onClick={item.onClick}
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
          {!isSidebarCollapsed && collections && collections.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Collections
                  </h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <nav className="space-y-1">
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      href="/"
                      onClick={() => {
                        resetFilters();
                        setSelectedCollection(collection.id);
                      }}
                      className={cn(
                        "flex h-9 items-center gap-3 rounded-lg px-3",
                        "transition-colors duration-200",
                        selectedCollection === collection.id
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
                  ))}
                </nav>
              </div>
            </>
          )}

          {/* Tags Section */}
          {!isSidebarCollapsed && tags && tags.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Tags
                  </h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 px-3">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer text-xs transition-colors"
                      style={{
                        borderColor: tag.color || undefined,
                        ...(selectedTags.includes(tag.id)
                          ? { backgroundColor: tag.color || undefined }
                          : { color: tag.color || undefined }),
                      }}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
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
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
