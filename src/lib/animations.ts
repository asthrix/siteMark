// ============================================================================
// SHARED ANIMATION VARIANTS - DRY principle
// ============================================================================
// Reusable Framer Motion animation configurations

import type { Variants, Transition } from "motion/react";

// ============================================================================
// SPRING CONFIGURATIONS
// ============================================================================
export const springs = {
  // Snappy, responsive feel
  snappy: { type: "spring", damping: 25, stiffness: 400 } as const,
  // Smooth, gentle feel
  smooth: { type: "spring", damping: 30, stiffness: 200 } as const,
  // Bouncy, playful feel
  bouncy: { type: "spring", damping: 15, stiffness: 300 } as const,
  // Quick, subtle feel
  quick: { type: "spring", damping: 20, stiffness: 500 } as const,
} satisfies Record<string, Transition>;

// ============================================================================
// FADE VARIANTS
// ============================================================================
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: { opacity: 0, y: 10, transition: { duration: 0.15 } },
};

// ============================================================================
// SCALE VARIANTS
// ============================================================================
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.snappy,
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.bouncy,
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.1 } },
};

// ============================================================================
// SLIDE VARIANTS
// ============================================================================
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.smooth,
  },
  exit: { opacity: 0, x: 20, transition: { duration: 0.15 } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.smooth,
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

// ============================================================================
// STAGGER CONTAINER
// ============================================================================
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

// ============================================================================
// STAGGER ITEMS
// ============================================================================
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.snappy,
  },
};

export const staggerItemFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

// ============================================================================
// CARD HOVER EFFECTS
// ============================================================================
export const cardHover = {
  rest: {
    y: 0,
    scale: 1,
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  hover: {
    y: -4,
    scale: 1.01,
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    transition: springs.snappy,
  },
  tap: {
    scale: 0.98,
    transition: springs.quick,
  },
} satisfies Variants;

// ============================================================================
// DIALOG/MODAL VARIANTS
// ============================================================================
export const dialogOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const dialogContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

// ============================================================================
// DRAWER VARIANTS
// ============================================================================
export const drawerSlideUp: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: springs.smooth,
  },
  exit: { y: "100%", transition: { duration: 0.2 } },
};

// ============================================================================
// LIST ITEM VARIANTS
// ============================================================================
export const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.snappy,
  },
  exit: { opacity: 0, x: 10, transition: { duration: 0.1 } },
};

// ============================================================================
// SKELETON PULSE
// ============================================================================
export const skeletonPulse: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
