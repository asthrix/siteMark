"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// ============================================================================
// BOOKMARK GRID
// ============================================================================
// Uniform CSS Grid layout with Framer Motion stagger animations

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 300,
    },
  },
};

interface BookmarkGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function BookmarkGrid({
  children,
  columns = 4,
  gap = "md",
  className = "",
}: BookmarkGridProps) {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn("grid", gridClasses[columns], gapClasses[gap], className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Keep MasonryGrid for backward compatibility but just use the grid
export function MasonryGrid(props: BookmarkGridProps) {
  return <BookmarkGrid {...props} />;
}

export function MasonryItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
