import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      // Allow any HTTPS images
      {
        protocol: "https",
        hostname: "**",
      },
      // Allow any HTTP images (some old sites still use http)
      {
        protocol: "http",
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
