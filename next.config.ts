import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Enable gzip/brotli compression — reduces JS/CSS chunk sizes on the wire
  compress: true,

  // Remove the X-Powered-By header to reduce response overhead
  poweredByHeader: false,

  experimental: {
    // Ensure proper tree-shaking for icon libraries — reduces bundle size
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    unoptimized: true,
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
  // Add caching headers for public static image assets
  async headers() {
    return [
      {
        // Cache public images (logos, neighborhood photos) for 7 days
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  // 301 Redirects for legacy/malformed URLs flagged in Search Console
  async redirects() {
    return [
      {
        source: "/month",
        destination: "/explore",
        permanent: true,
      },
      {
        source: "/blog/phaya-thai-complete-review",
        destination: "/blog",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
