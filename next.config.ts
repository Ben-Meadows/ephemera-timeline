import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    // Increase body size limit for Server Actions to allow larger image uploads
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
