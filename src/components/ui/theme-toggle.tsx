"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// THEME TOGGLE BUTTON (animate-ui style)
// ============================================================================
// A cycling theme toggle that switches between light → dark → system

const modes = ["light", "dark", "system"] as const;
type Mode = (typeof modes)[number];

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn("h-9 w-9", className)}>
        <div className="h-5 w-5" />
      </Button>
    );
  }

  const currentMode = (theme as Mode) || "system";
  const nextMode = modes[(modes.indexOf(currentMode) + 1) % modes.length];

  const handleToggle = () => {
    setTheme(nextMode);
  };

  const getIcon = () => {
    if (currentMode === "system") {
      return <Monitor className="h-5 w-5" />;
    }
    if (resolvedTheme === "dark" || currentMode === "dark") {
      return <Moon className="h-5 w-5" />;
    }
    return <Sun className="h-5 w-5" />;
  };

  const getIconColor = () => {
    if (currentMode === "system") return "text-muted-foreground";
    if (resolvedTheme === "dark" || currentMode === "dark") return "text-yellow-400";
    return "text-orange-500";
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn("h-9 w-9 relative overflow-hidden", className)}
      title={`Current: ${currentMode}. Click for ${nextMode}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentMode}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className={cn("absolute", getIconColor())}
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Toggle theme (current: {currentMode})</span>
    </Button>
  );
}
