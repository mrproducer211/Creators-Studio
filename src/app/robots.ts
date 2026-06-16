import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/agent/dashboard/"],
    },
    sitemap: "https://nhpbangkok.com/sitemap.xml",
  };
}
