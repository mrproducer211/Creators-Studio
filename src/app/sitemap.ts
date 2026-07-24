import { MetadataRoute } from "next";
import { getDbProperties } from "@/lib/db/dbLoader";
import { getAllPosts } from "@/lib/store/blog";
import { NEIGHBORHOODS } from "@/data/neighborhoods";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

  // 1. Static Pages
  const routes = ["", "/about-us", "/privacy", "/explore", "/buildings", "/for-sale", "/for-rent", "/short-stay", "/blog", "/faq"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Dynamic Properties (exclude unlisted & duplicate variation slugs)
  let properties: any[] = [];
  try {
    properties = await getDbProperties({ includeUnlisted: false });
  } catch (err) {
    console.error("Sitemap generator failed to load DB properties:", err);
  }

  const primaryProperties = properties.filter((p) => {
    if (p.slug.endsWith("-short_stay")) {
      const rentSlug = p.slug.replace(/-short_stay$/, "-rent");
      const saleSlug = p.slug.replace(/-short_stay$/, "-sale");
      if (properties.some((other) => other.slug === rentSlug || other.slug === saleSlug)) {
        return false;
      }
    }
    return true;
  });

  const propertyUrls = primaryProperties.map((p) => ({
    url: `${baseUrl}/property/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 3. Dynamic Neighbourhood Guides
  const areaUrls = NEIGHBORHOODS.map((n) => ({
    url: `${baseUrl}/neighborhood/${n.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // 4. Dynamic Building Pillar Pages
  const buildingSlugs = Array.from(
    new Set(
      properties
        .map((p) => {
          const name = p.projectName || p.name;
          return name ? name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-") : null;
        })
        .filter(Boolean)
    )
  );

  const buildingUrls = buildingSlugs.map((slug) => ({
    url: `${baseUrl}/building/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 5. Dynamic Blog Guides
  let blogPosts: any[] = [];
  try {
    blogPosts = await getAllPosts();
  } catch (err) {
    console.error("Sitemap failed to fetch blog posts:", err);
  }

  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...routes, ...propertyUrls, ...areaUrls, ...buildingUrls, ...blogUrls];
}
