"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import * as LucideIcons from "lucide-react";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// ============================================================================
// CURATED ICON LIST - Common icons for collections
// ============================================================================
export const ICON_LIST = [
  "Folder", "FolderOpen", "Bookmark", "Star", "Heart", "Archive",
  "Tag", "Hash", "Flag", "Pin", "Paperclip", "Link",
  "Globe", "Home", "Building", "Briefcase", "GraduationCap", "Book",
  "FileText", "Image", "Video", "Music", "Code", "Terminal",
  "Github", "Twitter", "Linkedin", "Youtube", "Instagram", "Facebook",
  "ShoppingCart", "CreditCard", "Wallet", "Gift", "Package", "Truck",
  "Plane", "Car", "Train", "Bike", "Map", "MapPin",
  "Camera", "Mic", "Headphones", "Gamepad", "Trophy", "Medal",
  "Lightbulb", "Zap", "Flame", "Sun", "Moon", "Cloud",
  "Coffee", "Pizza", "Utensils", "Cake", "Wine", "Beer",
  "Dumbbell", "Heart", "Activity", "Pill", "Stethoscope", "Thermometer",
  "Palette", "Brush", "Pen", "Pencil", "Scissors", "Ruler",
] as const;

export type IconName = (typeof ICON_LIST)[number];

// ============================================================================
// GET ICON COMPONENT HELPER
// ============================================================================
export function getIconComponent(name: string): React.ComponentType<{ className?: string }> | null {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return icons[name] || null;
}

// ============================================================================
// ICON PICKER COMPONENT
// ============================================================================
interface IconPickerProps {
  value?: string | null;
  onChange: (icon: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredIcons = useMemo(() => {
    if (!search) return ICON_LIST;
    return ICON_LIST.filter((icon) =>
      icon.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const SelectedIcon = value ? getIconComponent(value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 h-10",
            !value && "text-muted-foreground",
            className
          )}
        >
          {SelectedIcon ? (
            <SelectedIcon className="h-5 w-5 shrink-0" />
          ) : (
            <div className="h-5 w-5 rounded border border-dashed border-muted-foreground/50 shrink-0" />
          )}
          <span className="truncate">{value || "Select icon"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Icon Grid */}
        <ScrollArea className="h-64">
          <div className="grid grid-cols-6 gap-1 p-3">
            {filteredIcons.map((iconName) => {
              const IconComponent = getIconComponent(iconName);
              if (!IconComponent) return null;

              return (
                <motion.button
                  key={iconName}
                  whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--accent))" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative flex items-center justify-center h-9 w-9 rounded-md",
                    "transition-colors cursor-pointer",
                    value === iconName
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                  title={iconName}
                >
                  <IconComponent className="h-4 w-4" />
                  {value === iconName && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="h-2 w-2 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No icons found
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
