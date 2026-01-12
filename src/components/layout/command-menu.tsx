"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Star,
  Archive,
  FolderOpen,
  Search,
  Plus,
  Settings,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useUIStore } from "@/store/ui-store";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useFilterStore } from "@/store/filter-store";

// ============================================================================
// COMMAND MENU
// ============================================================================
// Global Cmd+K search and navigation

export function CommandMenu() {
  const router = useRouter();
  const { isCommandMenuOpen, setCommandMenuOpen, setAddBookmarkOpen } = useUIStore();
  const { setShowFavorites, setShowArchived, setSearchQuery } = useFilterStore();
  const { data } = useBookmarks({ limit: 10 });

  // Keyboard shortcut handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandMenuOpen(!isCommandMenuOpen);
      }
    },
    [isCommandMenuOpen, setCommandMenuOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const runCommand = useCallback(
    (command: () => void) => {
      setCommandMenuOpen(false);
      command();
    },
    [setCommandMenuOpen]
  );

  return (
    <CommandDialog open={isCommandMenuOpen} onOpenChange={setCommandMenuOpen}>
      <CommandInput placeholder="Search bookmarks or type a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => setAddBookmarkOpen(true))}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Add new bookmark</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/"))}
          >
            <Bookmark className="mr-2 h-4 w-4" />
            <span>All bookmarks</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                setShowFavorites(true);
                router.push("/");
              })
            }
          >
            <Star className="mr-2 h-4 w-4" />
            <span>Favorites</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                setShowArchived(true);
                router.push("/");
              })
            }
          >
            <Archive className="mr-2 h-4 w-4" />
            <span>Archived</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/collections"))}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>Collections</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Recent Bookmarks */}
        {data?.bookmarks && data.bookmarks.length > 0 && (
          <CommandGroup heading="Recent Bookmarks">
            {data.bookmarks.slice(0, 5).map((bookmark) => (
              <CommandItem
                key={bookmark.id}
                onSelect={() =>
                  runCommand(() =>
                    window.open(bookmark.url, "_blank", "noopener,noreferrer")
                  )
                }
                className="gap-2"
              >
                {bookmark.faviconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bookmark.faviconUrl}
                    alt=""
                    className="h-4 w-4 rounded-sm"
                  />
                ) : (
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="truncate flex-1">
                  {bookmark.title || bookmark.domain}
                </span>
                <span className="text-xs text-muted-foreground">
                  {bookmark.domain}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                const searchInput = document.querySelector<HTMLInputElement>(
                  '[data-search-input]'
                );
                searchInput?.focus();
              })
            }
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Focus search</span>
            <CommandShortcut>/</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
