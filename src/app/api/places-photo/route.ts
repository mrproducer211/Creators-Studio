import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

/* ─────────────────────────────────────────────
   FILE-BASED CACHE
   Stores { [cacheKey]: photoUrl | "NONE" }
   "NONE" means we tried & Google returned nothing
───────────────────────────────────────────── */
const CACHE_PATH = path.join(process.cwd(), "data", "places-photo-cache.json");

interface CacheStore {
  [key: string]: string;
}

function readCache(): CacheStore {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) as CacheStore;
    }
  } catch {
    // ignore corrupt cache
  }
  return {};
}

function writeCache(store: CacheStore): void {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // ignore write errors (e.g. read-only FS in some deploy environments)
  }
}

/* ─────────────────────────────────────────────
   Google Places helpers
───────────────────────────────────────────── */
const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function fetchPlacePhoto(placeName: string, area: string): Promise<string | null> {
  if (!PLACES_API_KEY || PLACES_API_KEY.startsWith("your_")) {
    return null;
  }

  // Step 1 – Text Search to get place_id and photo_reference
  const query = `${placeName}, ${area}, Bangkok`;
  const searchUrl =
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${encodeURIComponent(query)}` +
    `&inputtype=textquery` +
    `&fields=place_id,photos` +
    `&key=${PLACES_API_KEY}`;

  const searchRes = await fetch(searchUrl, { next: { revalidate: 0 } });
  if (!searchRes.ok) return null;

  const searchData = await searchRes.json() as {
    candidates?: { place_id?: string; photos?: { photo_reference: string }[] }[];
    status?: string;
  };

  const candidate = searchData.candidates?.[0];
  if (!candidate) return null;

  // If photo_reference came back directly (findplacefromtext with photos field)
  const photoRef = candidate.photos?.[0]?.photo_reference;
  if (!photoRef) return null;

  // Step 2 – Build Photo URL (we return this; frontend requests it via Next.js /api route proxy below)
  const photoUrl =
    `https://maps.googleapis.com/maps/api/place/photo` +
    `?maxwidth=600` +
    `&photo_reference=${encodeURIComponent(photoRef)}` +
    `&key=${PLACES_API_KEY}`;

  return photoUrl;
}

/* ─────────────────────────────────────────────
   GET /api/places-photo?name=...&area=...
   Returns JSON: { photoUrl: string | null }
───────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("name") ?? "").trim();
  const area = (searchParams.get("area") ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  // Normalised cache key
  const cacheKey = `${name}__${area}`.toLowerCase().replace(/[^a-z0-9_]/g, "_");

  // Check cache first
  const store = readCache();
  if (cacheKey in store) {
    const cached = store[cacheKey];
    if (cached === "NONE") {
      return NextResponse.json({ photoUrl: null }, {
        headers: { "Cache-Control": "public, max-age=86400" },
      });
    }
    return NextResponse.json({ photoUrl: cached }, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  // Not in cache – query Google Places
  try {
    const photoUrl = await fetchPlacePhoto(name, area);
    store[cacheKey] = photoUrl ?? "NONE";
    writeCache(store);

    return NextResponse.json({ photoUrl }, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch (err) {
    console.error("[places-photo] Error:", err);
    // Cache failure so we don't keep hammering the API
    store[cacheKey] = "NONE";
    writeCache(store);
    return NextResponse.json({ photoUrl: null }, { status: 200 });
  }
}
