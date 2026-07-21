import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/public/"],
        disallow: [
          "/admin/",
          "/api/",
          "/agent/",
          "/auth/",
          "/dashboard/",
          "/swipe",
          "/saved",
          "/explore?*",
        ],
      },
      {
        userAgent: ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended", "Applebot-Extended"],
        allow: ["/", "/llms.txt", "/llms-full.txt", "/api/public/"],
        disallow: [
          "/admin/",
          "/api/",
          "/agent/",
          "/auth/",
          "/dashboard/",
          "/swipe",
          "/saved",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
