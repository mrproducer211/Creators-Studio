import { submitToGoogleIndexing } from "../src/lib/google-indexing";
import { getDbProperties } from "../src/lib/db/dbLoader";
import { getAllPosts } from "../src/lib/store/blog";
import { NEIGHBORHOODS } from "../src/data/neighborhoods";

async function main() {
  console.log("🚀 Day 1: Starting Technical URL Gathering & Google Indexing Push...\n");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://newhomesproperty.com";

  // 1. Core pages
  const coreUrls = [
    `${baseUrl}`,
    `${baseUrl}/explore`,
    `${baseUrl}/about`,
    `${baseUrl}/privacy`,
    `${baseUrl}/llms.txt`,
    `${baseUrl}/llms-full.txt`,
  ];

  // 2. Neighborhoods
  const neighborhoodUrls = NEIGHBORHOODS.map((n) => `${baseUrl}/neighborhood/${n.slug.toLowerCase()}`);

  // 3. Primary Properties
  let properties: any[] = [];
  try {
    properties = await getDbProperties({ includeUnlisted: false });
  } catch (err) {
    console.error("Failed to load properties:", err);
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

  const propertyUrls = primaryProperties.map((p) => `${baseUrl}/property/${p.slug}`);

  // 4. Blog Posts
  let blogPosts: any[] = [];
  try {
    blogPosts = await getAllPosts();
  } catch (err) {
    console.error("Failed to load blog posts:", err);
  }

  const blogUrls = blogPosts.map((post) => `${baseUrl}/blog/${post.slug}`);

  const allUrls = Array.from(new Set([...coreUrls, ...neighborhoodUrls, ...propertyUrls, ...blogUrls]));

  console.log(`📋 Discovered ${allUrls.length} clean, primary URLs for indexing submission:`);
  allUrls.forEach((url, i) => console.log(`   ${i + 1}. ${url}`));

  console.log("\n📡 Checking Google Indexing API credentials...");
  const hasAuth = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!hasAuth) {
    console.log("⚠️ GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY not set in .env.local.");
    console.log("👉 Copy the above list into Google Search Console URL Inspection tool or Bing Webmaster Tools to index manually!");
    return;
  }

  console.log("⚡ Triggering Google Indexing API for all URLs...");
  let successCount = 0;
  for (const url of allUrls) {
    const success = await submitToGoogleIndexing(url);
    if (success) successCount++;
  }

  console.log(`\n✅ Finished! Successfully pushed ${successCount}/${allUrls.length} URLs to Google Indexing API.`);
}

main().catch(console.error);
