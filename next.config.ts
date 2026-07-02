import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    // Ensure proper tree-shaking for icon libraries — reduces bundle size
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    // Serve AVIF first, then WebP — browsers pick the best they support
    formats: ["image/avif", "image/webp"],
    // Cover all common screen breakpoints + retina
    deviceSizes: [360, 414, 768, 1024, 1280, 1440, 1920],
    imageSizes: [64, 128, 256, 384],
    // Cache optimised images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Allow any https host for property images uploaded via the admin panel
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
