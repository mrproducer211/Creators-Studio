/**
 * Standalone IndexNow + URL lister script.
 * Fetches all URLs from the live sitemap and submits them to IndexNow (Bing/Yandex).
 * No Next.js / DB dependency required.
 */

const SITE_URL = "https://newhomesproperty.com";
const INDEXNOW_KEY = "nhp-indexnow-key"; // must match /public/nhp-indexnow-key.txt

async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
  console.log(`📡 Fetching sitemap: ${sitemapUrl}`);
  const res = await fetch(sitemapUrl);
  if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status}`);
  const xml = await res.text();

  // Extract <loc> tags
  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());

  // If this is a sitemap index (contains <sitemap> tags), recurse into child sitemaps
  const childSitemaps = [...xml.matchAll(/<sitemap>/g)];
  if (childSitemaps.length > 0) {
    const childUrls: string[] = [];
    for (const loc of locs) {
      if (loc.endsWith(".xml")) {
        const sub = await fetchSitemapUrls(loc);
        childUrls.push(...sub);
      }
    }
    return childUrls;
  }

  return locs.filter((l) => !l.endsWith(".xml"));
}

async function submitToIndexNow(urls: string[]): Promise<void> {
  const endpoint = "https://api.indexnow.org/indexnow";
  const payload = {
    host: "newhomesproperty.com",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls.slice(0, 10000), // IndexNow max per request
  };

  console.log(`\n⚡ Submitting ${urls.length} URLs to IndexNow (Bing/Yandex)...`);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (res.ok || res.status === 202) {
    console.log(`✅ IndexNow accepted: HTTP ${res.status}`);
  } else {
    const body = await res.text();
    console.warn(`⚠️  IndexNow responded: HTTP ${res.status} — ${body}`);
  }
}

async function main() {
  console.log("🚀 NHP IndexNow Submission Script\n");

  // 1. Fetch all URLs from live sitemap
  const urls = await fetchSitemapUrls(`${SITE_URL}/sitemap.xml`);
  console.log(`\n📋 Discovered ${urls.length} live URLs:\n`);
  urls.forEach((u, i) => console.log(`   ${i + 1}. ${u}`));

  // 2. Submit to IndexNow
  await submitToIndexNow(urls);

  console.log(`\n📋 Copy the list above into Google Search Console:`);
  console.log(`   👉 https://search.google.com/search-console → URL Inspection → Request Indexing`);
  console.log(`\n✅ Done!`);
}

main().catch(console.error);
