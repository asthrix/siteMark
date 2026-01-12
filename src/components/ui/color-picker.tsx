"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// ============================================================================
// COLOR PALETTE - Curated colors for collections and tags
// ============================================================================
export const COLOR_PALETTE = [
  // Primary & Accent
  { name: "Violet", value: "#8B5CF6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Emerald", value: "#10B981" },
  { name: "Green", value: "#22C55E" },
  { name: "Lime", value: "#84CC16" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Orange", value: "#F97316" },
  { name: "Red", value: "#EF4444" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Pink", value: "#EC4899" },
  { name: "Fuchsia", value: "#D946EF" },
  { name: "Purple", value: "#A855F7" },
  // Neutrals
  { name: "Slate", value: "#64748B" },
  { name: "Gray", value: "#6B7280" },
  { name: "Stone", value: "#78716C" },
  { name: "Zinc", value: "#71717A" },
] as const;

export type ColorValue = (typeof COLOR_PALETTE)[number]["value"];

// ============================================================================
// COLOR PICKER COMPONENT
// ============================================================================
interface ColorPickerProps {
  value?: string | null;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const selectedColor = COLOR_PALETTE.find((c) => c.value === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 h-10",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div
            className="h-5 w-5 rounded-md border border-border/50 shrink-0"
            style={{ backgroundColor: value || "#71717A" }}
          />
          <span className="truncate">
            {selectedColor?.name || "Select color"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PALETTE.map((color) => (
            <motion.button
              key={color.value}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(color.value)}
              className={cn(
                "relative h-8 w-8 rounded-md cursor-pointer",
                "ring-offset-background transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                value === color.value && "ring-2 ring-primary ring-offset-2"
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {value === color.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check className="h-4 w-4 text-white drop-shadow-md" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// INLINE COLOR PICKER (for compact forms)
// ============================================================================
interface InlineColorPickerProps {
  value?: string | null;
  onChange: (color: string) => void;
  size?: "sm" | "md";
}

export function InlineColorPicker({
  value,
  onChange,
  size = "md",
}: InlineColorPickerProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {COLOR_PALETTE.slice(0, 12).map((color) => (
        <motion.button
          key={color.value}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(color.value)}
          className={cn(
            "relative rounded-md cursor-pointer transition-all",
            sizeClasses[size],
            value === color.value && "ring-2 ring-primary ring-offset-1 ring-offset-background"
          )}
          style={{ backgroundColor: color.value }}
          title={color.name}
        >
          {value === color.value && (
            <Check className="absolute inset-0 m-auto h-3 w-3 text-white" />
          )}
        </motion.button>
      ))}
    </div>
  );
}
