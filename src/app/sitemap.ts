import { MetadataRoute } from "next";
import { getDbProperties } from "@/lib/db/dbLoader";
import POSTS from "@/data/blogPosts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nhpbangkok.com";

  // 1. Static Pages
  const routes = ["", "/about", "/privacy", "/explore"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Dynamic Properties
  let properties: any[] = [];
  try {
    properties = await getDbProperties({ includeUnlisted: false });
  } catch (err) {
    console.error("Sitemap generator failed to load DB properties:", err);
  }

  const propertyUrls = properties.map((p) => ({
    url: `${baseUrl}/property/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 3. Dynamic Neighbourhood Guides
  const areas = [
    "sukhumvit",
    "thong-lo",
    "on-nut",
    "ekkamai",
    "asok",
    "ari",
    "sathorn",
    "silom",
    "rama-9",
    "huai-khwang",
    "bang-na",
    "phaya-thai",
  ];
  const areaUrls = areas.map((area) => ({
    url: `${baseUrl}/neighborhood/${area}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // 4. Dynamic Blog Guides
  const blogUrls = POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...routes, ...propertyUrls, ...areaUrls, ...blogUrls];
}
