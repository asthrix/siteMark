"use client";

import React from "react";
import { motion } from "motion/react";

// ============================================================================
// MASONRY GRID
// ============================================================================
// CSS columns-based masonry layout with Framer Motion stagger animations

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

interface MasonryGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function MasonryGrid({
  children,
  columns = 4,
  gap = "md",
  className = "",
}: MasonryGridProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const columnClasses = {
    1: "columns-1",
    2: "columns-1 sm:columns-2",
    3: "columns-1 sm:columns-2 lg:columns-3",
    4: "columns-1 sm:columns-2 lg:columns-3 xl:columns-4",
    5: "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`${columnClasses[columns]} ${gapClasses[gap]} ${className}`}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="break-inside-avoid mb-4"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// MASONRY ITEM (for custom animations)
// ============================================================================
interface MasonryItemProps {
  children: React.ReactNode;
  className?: string;
}

export function MasonryItem({ children, className = "" }: MasonryItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={`break-inside-avoid mb-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}
