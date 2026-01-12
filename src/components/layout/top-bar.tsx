"use client";

import { useEffect, useState, useRef } from "react";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Command,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useUIStore, type ViewMode } from "@/store/ui-store";
import { useFilterStore, type SortOption } from "@/store/filter-store";
import { cn } from "@/lib/utils";

// ============================================================================
// TOP BAR
// ============================================================================
// Dashboard header with search, filters, view modes, and add button

interface TopBarProps {
  title?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showViewMode?: boolean;
}

export function TopBar({
  title = "All Bookmarks",
  showSearch = true,
  showFilters = true,
  showViewMode = true,
}: TopBarProps) {
  const { viewMode, setViewMode, setAddBookmarkOpen, setCommandMenuOpen } = useUIStore();
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortDirection,
    toggleSortDirection,
    showFavorites,
    showArchived,
    resetFilters,
  } = useFilterStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localSearch, setSearchQuery]);

  // Keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasActiveFilters = showFavorites || showArchived || searchQuery.length > 0;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "createdAt", label: "Date Created" },
    { value: "updatedAt", label: "Date Updated" },
    { value: "title", label: "Title" },
    { value: "domain", label: "Domain" },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-4 px-6">
          {/* Title */}
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>

          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              {showFavorites && (
                <Badge variant="secondary" className="text-xs">
                  Favorites
                </Badge>
              )}
              {showArchived && (
                <Badge variant="secondary" className="text-xs">
                  Archived
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground"
                onClick={resetFilters}
              >
                Clear
              </Button>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          {showSearch && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                data-search-input
                placeholder="Search bookmarks..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9 pr-12 bg-secondary/50 border-border/50"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground sm:flex">
                /
              </kbd>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <>
              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={cn(sortBy === option.value && "bg-accent")}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleSortDirection}>
                    {sortDirection === "desc" ? "↓ Descending" : "↑ Ascending"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More filters */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Filters</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* View mode toggle */}
          {showViewMode && (
            <div className="flex items-center rounded-lg border border-border/50 p-1">
              {(["grid", "list"] as ViewMode[]).map((mode) => (
                <Tooltip key={mode}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7 shrink-0",
                        viewMode === mode && "bg-secondary"
                      )}
                      onClick={() => setViewMode(mode)}
                    >
                      {mode === "grid" ? (
                        <LayoutGrid className="h-4 w-4" />
                      ) : (
                        <List className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="capitalize">{mode} view</TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}

          {/* Command menu trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setCommandMenuOpen(true)}
              >
                {/* <Command className="h-4 w-4" /> */}
                <kbd className=" rounded  px-1 text-base">⌘K</kbd>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Command menu{" "}
              <kbd className="ml-1 rounded border bg-muted px-1 text-base text-muted-foreground">⌘K</kbd>
            </TooltipContent>
          </Tooltip>

          {/* Add bookmark button */}
          <Button onClick={() => setAddBookmarkOpen(true)} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Bookmark</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
