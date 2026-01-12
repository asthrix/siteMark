import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      // Common OG image sources
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Cache images for better performance
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  // Standalone output for Docker deployment
  output: "standalone",

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
