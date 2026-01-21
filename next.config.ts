import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Increase body size limit for Server Actions to allow larger image uploads
  serverActions: {
    bodySizeLimit: "10mb",
  },
  // Also set under experimental for compatibility
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
