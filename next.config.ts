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
    unoptimized: false,
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
  // Add security headers and caching headers
  async headers() {
    return [
      {
        // Global security headers for all routes
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
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
      // Migrate robots-disallowed /explore?type= filter URLs to crawlable hubs.
      // Matches /explore?type=sale (and any extra query params, which are dropped).
      {
        source: "/explore",
        has: [{ type: "query", key: "type", value: "sale" }],
        destination: "/for-sale",
        permanent: true,
      },
      {
        source: "/explore",
        has: [{ type: "query", key: "type", value: "rent" }],
        destination: "/for-rent",
        permanent: true,
      },
      {
        source: "/explore",
        has: [{ type: "query", key: "type", value: "short_stay" }],
        destination: "/short-stay",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
