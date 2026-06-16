import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db, isDbConfigured } from "@/lib/db";
import { properties as propertiesTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createProperty, getAllProperties, updateProperty, deleteProperty } from "@/lib/store/properties";
import { PropertyCard } from "@/types/property";
import { getCanonicalArea } from "@/lib/area";
import sharp from "sharp";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface TelegramPhoto {
  file_id: string;
  width: number;
  height: number;
  file_size?: number;
}

interface TelegramVideo {
  file_id: string;
  width: number;
  height: number;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

interface TelegramMessage {
  message_id: number;
  media_group_id?: number | string;
  text?: string;
  caption?: string;
  photo?: TelegramPhoto[];
  video?: TelegramVideo;
  chat?: {
    id: number | string;
    type?: string;
    title?: string;
    username?: string;
  };
  from?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
}

interface TelegramWebhookBody {
  channel_post?: TelegramMessage;
  message?: TelegramMessage;
}

/**
 * Sends a response message back to the Telegram chat.
 */
async function sendTelegramResponse(
  botToken: string,
  chatId: number | string,
  text: string,
  replyToMessageId?: number
) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_to_message_id: replyToMessageId,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
    if (!res.ok) {
      console.error("Failed to send response back to Telegram:", await res.text());
    }
  } catch (err) {
    console.error("Error sending response back to Telegram:", err);
  }
}


/**
 * Searches DuckDuckGo HTML snippets to find the building construction year.
 */
async function findYearBuiltFromWeb(propertyName: string): Promise<number | null> {
  try {
    const query = encodeURIComponent(`${propertyName} condo year built Bangkok OR completed`);
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const yearRegex = /\b(19[89]\d|20[012]\d)\b/g;
    const cleanText = html.replace(/<[^>]*>/g, " ");

    const builtKeywords = ["built", "completed", "completion", "opened", "year", "construction", "launched"];
    const matches: { year: number; score: number }[] = [];

    let match;
    while ((match = yearRegex.exec(cleanText)) !== null) {
      const yearVal = Number(match[0]);
      const index = match.index;
      const start = Math.max(0, index - 80);
      const end = Math.min(cleanText.length, index + 80);
      const snippet = cleanText.substring(start, end).toLowerCase();

      let score = 0;
      for (const kw of builtKeywords) {
        if (snippet.includes(kw)) {
          score += 1;
        }
      }
      if (new RegExp(`(?:built|completed|completion|opened|year)\\s*(?:in|:)?\\s*${yearVal}`, "i").test(snippet)) {
        score += 3;
      }
      if (score > 0) {
        matches.push({ year: yearVal, score });
      }
    }

    if (matches.length > 0) {
      matches.sort((a, b) => b.score - a.score);
      return matches[0].year;
    }
  } catch (err) {
    console.error("Error fetching year built from web:", err);
  }
  return null;
}

/**
 * Clean up the raw Telegram post description by stripping out parsing key-values and tags.
 */
function cleanTelegramDescription(text: string): string {
  // Match key-value hashtags e.g. #floor: 15
  const kvHashtagRegex = /#(?:floor|total_floors|floors|bts_walk|mrt_walk|built|renovated|bts|mrt|available|furnishing|furnish|lease|deposit|maintenance)\s*:\s*.*?(?=\s*(?:#(?:rent|condo|sale|shortstay|short_stay|apartment|house|villa|townhouse|pool|gym|sauna|bathtub|nearbts|nearmrt|petfriendly|visafriendly|foreignquota|floor|total_floors|floors|bts_walk|mrt_walk|built|renovated|bts|mrt|available|furnishing|furnish|lease|deposit|maintenance)\b|(?:Name|Price|Beds|Bedrooms|Baths|Bathrooms|Sqm|Area|District)\s*:|$))/gi;
  
  // Match simple hashtags e.g. #rent #condo
  const simpleHashtagRegex = /#(?:rent|condo|sale|shortstay|short_stay|apartment|house|villa|townhouse|pool|gym|sauna|bathtub|nearbts|nearmrt|petfriendly|visafriendly|foreignquota)\b/gi;

  // Match standard key-value fields e.g. Name: Ideo Mobi
  const kvFieldRegex = /(?:Name|Price|Beds|Bedrooms|Baths|Bathrooms|Sqm|Area|District)\s*:\s*.*?(?=\s*(?:#(?:rent|condo|sale|shortstay|short_stay|apartment|house|villa|townhouse|pool|gym|sauna|bathtub|nearbts|nearmrt|petfriendly|visafriendly|foreignquota|floor|total_floors|floors|bts_walk|mrt_walk|built|renovated|bts|mrt|available|furnishing|furnish|lease|deposit|maintenance)\b|(?:Name|Price|Beds|Bedrooms|Baths|Bathrooms|Sqm|Area|District)\s*:|$))/gi;

  let cleaned = text;
  cleaned = cleaned.replace(kvHashtagRegex, "");
  cleaned = cleaned.replace(simpleHashtagRegex, "");
  cleaned = cleaned.replace(kvFieldRegex, "");

  // Clean up extra whitespace and newlines
  cleaned = cleaned.replace(/[ \t]+/g, " "); // collapse horizontal spaces
  cleaned = cleaned.split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .join("\n");

  return cleaned.trim();
}

/**
 * Robust parser to extract property listing details from Telegram post text/caption.
 */
function parseTelegramMessage(text: string, messageId: number) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  
  // Default values
  let name = lines[0] || `Telegram Listing ${messageId}`;
  let listingType: "sale" | "rent" | "short_stay" = "sale";
  let propertyType: "condo" | "house" | "villa" | "townhouse" | "apartment" = "condo";
  let priceTHB = 0;
  let bedrooms = 1;
  let bathrooms = 1;
  let sqm: number | undefined = undefined;
  let area = "Sukhumvit"; // default fallback
  let district: string | undefined = undefined;
  let petFriendly = false;
  let nearBts = false;
  const description = cleanTelegramDescription(text);

  let buildingBuilt: number | undefined = undefined;
  let lastRenovated: number | undefined = undefined;
  let furnishing: "furnished" | "partially_furnished" | "unfurnished" | undefined = undefined;
  let availableFrom: string | undefined = undefined;
  let btsStation: string | undefined = undefined;
  let btsWalkMin: number | undefined = undefined;
  let mrtStation: string | undefined = undefined;
  let mrtWalkMin: number | undefined = undefined;
  let floor: number | undefined = undefined;
  let totalFloors: number | undefined = undefined;
  let maintenance: string | undefined = undefined;
  let leaseTerms: string | undefined = undefined;
  let depositTerms: string | undefined = undefined;
  let foreignQuota: boolean | undefined = undefined;
  let visaFriendly: boolean | undefined = undefined;

  // Extract explicit name if defined
  const nameMatch = text.match(/(?:#name|Name)[:\s=]+([^\n]+)/i);
  if (nameMatch) name = nameMatch[1].trim();

  // Listing Type
  if (/#sale|sale/i.test(text)) listingType = "sale";
  else if (/#rent|rent/i.test(text)) listingType = "rent";
  else if (/#shortstay|#short_stay|short stay|short_stay/i.test(text)) listingType = "short_stay";

  // Property Type
  if (/#condo|condo/i.test(text)) propertyType = "condo";
  else if (/#house|house/i.test(text)) propertyType = "house";
  else if (/#villa|villa/i.test(text)) propertyType = "villa";
  else if (/#townhouse|townhouse/i.test(text)) propertyType = "townhouse";
  else if (/#apartment|apartment/i.test(text)) propertyType = "apartment";

  // Price (THB)
  const priceMatch = text.match(/(?:#price|price)[:\s=]+([\d,]+)/i);
  if (priceMatch) {
    priceTHB = Number(priceMatch[1].replace(/,/g, ""));
  } else {
    // Try to find a general number like "฿18,500,000" or "18,500,000 THB"
    const generalPriceMatch = text.match(/(?:฿|THB)\s*([\d,]+)|([\d,]+)\s*(?:THB|฿|baht)/i);
    if (generalPriceMatch) {
      const pStr = generalPriceMatch[1] || generalPriceMatch[2];
      priceTHB = Number(pStr.replace(/,/g, ""));
    }
  }

  // Bedrooms
  const bedsMatch = text.match(/(?:#beds|beds|bedrooms)[:\s=]+(\d+)/i) || text.match(/(\d+)\s*(?:bed|br|bedroom)/i);
  if (bedsMatch) bedrooms = Number(bedsMatch[1]);

  // Bathrooms
  const bathsMatch = text.match(/(?:#baths|baths|bathrooms)[:\s=]+(\d+)/i) || text.match(/(\d+)\s*(?:bath|ba|bathroom)/i);
  if (bathsMatch) bathrooms = Number(bathsMatch[1]);

  // SQM
  const sqmMatch = text.match(/(?:#sqm|sqm)[:\s=]+(\d+)/i) || text.match(/(\d+)\s*(?:sqm|sq\.m\.|sq\s*meter|m2)/i);
  if (sqmMatch) sqm = Number(sqmMatch[1]);

  // Area (known list matching with aliases)
  const areaRegexes = [
    { canonical: "Bang Na", regex: /bang\s*na|udom\s*suk/i },
    { canonical: "Sukhumvit", regex: /sukhumvit|phrom\s*phong/i },
    { canonical: "Thong Lo", regex: /thong\s*lo/i },
    { canonical: "Asok", regex: /asok/i },
    { canonical: "Ekkamai", regex: /ekkamai/i },
    { canonical: "Silom", regex: /silom/i },
    { canonical: "On Nut", regex: /on\s*nut/i },
    { canonical: "Ari", regex: /ari/i },
    { canonical: "Sathorn", regex: /sathorn|sathon/i },
    { canonical: "Rama 9", regex: /rama\s*9|ratchada/i },
    { canonical: "Huai Khwang", regex: /huai\s*khwang/i },
    { canonical: "Phaya Thai", regex: /phaya\s*thai/i },
  ];

  for (const item of areaRegexes) {
    if (item.regex.test(text)) {
      area = item.canonical;
      break;
    }
  }

  const areaMatch = text.match(/(?:#area|area)[:\s=]+([^\n]+)/i);
  if (areaMatch) {
    const parsedArea = areaMatch[1].trim();
    area = getCanonicalArea(parsedArea);
  } else {
    area = getCanonicalArea(area);
  }

  // District
  const districtMatch = text.match(/(?:#district|district)[:\s=]+([^\n]+)/i);
  if (districtMatch) district = districtMatch[1].trim();

  // Flags
  if (/#petfriendly|pet friendly|pets allowed/i.test(text)) petFriendly = true;
  if (/#nearbts|#nearmrt|near bts|near mrt/i.test(text)) nearBts = true;

  // Clean name for slug
  const slugBase = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const slug = `${slugBase || "listing"}-tg-${messageId}`;

  // Calculated USD (using approx 36 THB/USD)
  const priceUSD = Math.round(priceTHB / 36);

  // Extract amenities & features
  const amenities: string[] = [];
  const features: string[] = [];

  const amenityMap: Record<string, string> = {
    "pool": "Swimming Pool",
    "gym": "Fitness Center",
    "fitness": "Fitness Center",
    "security": "24h Security",
    "cctv": "CCTV Security",
    "parking": "Covered Parking",
    "wifi": "High-Speed WiFi",
    "internet": "High-Speed WiFi",
    "sauna": "Sauna & Steam",
    "garden": "Garden Area",
    "playground": "Children's Playground",
    "coworking": "Co-working Lounge",
    "lounge": "Co-working Lounge",
    "rooftop": "Rooftop Terrace",
    "concierge": "Concierge Service",
    "petfriendly": "Pet Friendly",
  };

  const featureMap: Record<string, string> = {
    "balcony": "Private Balcony",
    "bathtub": "Bathtub",
    "furnish": "Fully Furnished",
    "kitchen": "Fully Fitted Kitchen",
    "view": "City Skyline Views",
    "highfloor": "High Floor Unit",
    "brandnew": "Brand New Condition",
    "renovate": "Newly Renovated",
    "sofa": "Sofa",
    "tv": "Television",
    "television": "Television",
    "air": "Air Conditioning",
    "ac": "Air Conditioning",
    "aircon": "Air Conditioning",
    "washing": "Washing Machine",
    "washer": "Washing Machine",
    "fridge": "Refrigerator",
    "refrigerator": "Refrigerator",
    "microwave": "Microwave",
  };

  // 1. Scan for hashtags
  for (const [key, label] of Object.entries(amenityMap)) {
    const regex = new RegExp(`#${key}`, "i");
    if (regex.test(text)) {
      amenities.push(label);
    }
  }
  for (const [key, label] of Object.entries(featureMap)) {
    const regex = new RegExp(`#${key}`, "i");
    if (regex.test(text)) {
      features.push(label);
    }
  }

  // 2. Scan for lists under Amenities: / Facilities: / Features:
  const facilitiesMatch = text.match(/(?:amenities|facilities|features)[:\s]*\n((?:[•\-\*\s]+[^\n]+\n?)+)/i);
  if (facilitiesMatch) {
    const listText = facilitiesMatch[1];
    const items = listText.split("\n")
      .map(line => line.replace(/^[•\-\*\s]+/, "").trim())
      .filter(Boolean);
    for (const item of items) {
      const cleanItem = item.charAt(0).toUpperCase() + item.slice(1);
      const lItem = item.toLowerCase();
      const isFeature = lItem.includes("balcony") ||
                        lItem.includes("bathtub") ||
                        lItem.includes("view") ||
                        lItem.includes("fitted") ||
                        lItem.includes("sofa") ||
                        /\btv\b/i.test(lItem) ||
                        lItem.includes("television") ||
                        lItem.includes("air condition") ||
                        /\bac\b/i.test(lItem) ||
                        /\ba\/c\b/i.test(lItem) ||
                        lItem.includes("fridge") ||
                        lItem.includes("refrigerator") ||
                        lItem.includes("washing") ||
                        lItem.includes("washer") ||
                        lItem.includes("microwave");
      if (isFeature) {
        if (!features.includes(cleanItem)) features.push(cleanItem);
      } else {
        if (!amenities.includes(cleanItem)) amenities.push(cleanItem);
      }
    }
  }

  if (petFriendly && !amenities.includes("Pet Friendly")) {
    amenities.push("Pet Friendly");
  }
  if (nearBts && !features.includes("Near BTS/MRT")) {
    features.push("Near BTS/MRT");
  }

  // Custom fields parsing
  const builtMatch = text.match(/(?:#built|built|year built|built year)[:\s=]+(\d{4})/i);
  if (builtMatch) buildingBuilt = Number(builtMatch[1]);

  const renovatedMatch = text.match(/(?:#renovated|renovated|last renovated)[:\s=]+(\d{4})/i);
  if (renovatedMatch) lastRenovated = Number(renovatedMatch[1]);

  const furnishingMatch = text.match(/(?:#furnish|#furnishing|furnish|furnishing)[:\s=]+([a-z_]+)/i);
  if (furnishingMatch) {
    const val = furnishingMatch[1].toLowerCase();
    if (val.includes("un")) furnishing = "unfurnished";
    else if (val.includes("part")) furnishing = "partially_furnished";
    else furnishing = "furnished";
  }

  const availableMatch = text.match(/(?:#available|available|available from)[:\s=]+([^\n]+)/i);
  if (availableMatch) availableFrom = availableMatch[1].trim();

  const btsMatch = text.match(/(?:#bts|bts station|bts)[:\s=]+([^\n,#]+)/i);
  if (btsMatch) btsStation = btsMatch[1].trim();
  const btsWalkMatch = text.match(/(?:#bts_walk|bts walk|bts walk min)[:\s=]+(\d+)/i);
  if (btsWalkMatch) btsWalkMin = Number(btsWalkMatch[1]);

  const mrtMatch = text.match(/(?:#mrt|mrt station|mrt)[:\s=]+([^\n,#]+)/i);
  if (mrtMatch) mrtStation = mrtMatch[1].trim();
  const mrtWalkMatch = text.match(/(?:#mrt_walk|mrt walk|mrt walk min)[:\s=]+(\d+)/i);
  if (mrtWalkMatch) mrtWalkMin = Number(mrtWalkMatch[1]);

  const floorMatch = text.match(/(?:#floor|floor)[:\s=]+(\d+)/i);
  if (floorMatch) floor = Number(floorMatch[1]);
  const totalFloorsMatch = text.match(/(?:#total_floors|total floors|floors)[:\s=]+(\d+)/i);
  if (totalFloorsMatch) totalFloors = Number(totalFloorsMatch[1]);

  const maintenanceMatch = text.match(/(?:#maintenance|maintenance)[:\s=]+([^\n]+)/i);
  if (maintenanceMatch) maintenance = maintenanceMatch[1].trim();

  const leaseMatch = text.match(/(?:#lease|lease|lease terms)[:\s=]+([^\n]+)/i);
  if (leaseMatch) leaseTerms = leaseMatch[1].trim();
  const depositMatch = text.match(/(?:#deposit|deposit|deposit terms)[:\s=]+([^\n]+)/i);
  if (depositMatch) depositTerms = depositMatch[1].trim();

  if (/#foreignquota|foreign quota/i.test(text)) foreignQuota = true;
  if (/#visafriendly|visa friendly/i.test(text)) visaFriendly = true;

  return {
    slug,
    name,
    description,
    listingType,
    propertyType,
    priceTHB,
    priceUSD,
    bedrooms,
    bathrooms,
    sqm,
    area,
    district,
    petFriendly,
    nearBts,
    amenities,
    features,
    buildingBuilt,
    lastRenovated,
    furnishing,
    availableFrom,
    btsStation,
    btsWalkMin,
    mrtStation,
    mrtWalkMin,
    floor,
    totalFloors,
    maintenance,
    leaseTerms,
    depositTerms,
    foreignQuota,
    visaFriendly,
    featured: false,
    hasVideo: false,
    likes: 0,
    saves: 0,
    clicks: 0,
  };
}

/**
 * Helper to download file from Telegram, compress with Sharp to WebP, and upload to Cloudinary.
 */
async function processTelegramMedia(
  botToken: string,
  photoArray: TelegramPhoto[],
  videoObj: TelegramVideo | undefined
): Promise<string | null> {
  let fileId: string | null = null;
  if (photoArray.length > 0) {
    // Pick the largest photo resolution (last in array)
    fileId = photoArray[photoArray.length - 1].file_id;
  } else if (videoObj) {
    fileId = videoObj.file_id;
  }

  if (!fileId) return null;

  try {
    const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
    const fileRes = await fetch(getFileUrl);
    if (!fileRes.ok) {
      console.error("Failed to getFile from Telegram:", await fileRes.text());
      return null;
    }
    const fileJson = await fileRes.json();
    const filePath = fileJson.result?.file_path;
    if (!filePath) {
      console.error("No file_path returned from getFile:", fileJson);
      return null;
    }

    const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    let uploadContent: string | Buffer = downloadUrl;

    if (!videoObj) {
      try {
        const fileDataRes = await fetch(downloadUrl);
        if (fileDataRes.ok) {
          const arrayBuffer = await fileDataRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Downscale to max 2000px and compress to WebP at 82% quality
          const compressedBuffer = await sharp(buffer)
            .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer();

          const base64Data = compressedBuffer.toString("base64");
          uploadContent = `data:image/webp;base64,${base64Data}`;
        }
      } catch (err) {
        console.error("Telegram image compression failed, falling back to raw download:", err);
      }
    }

    const uploadRes = await cloudinary.uploader.upload(uploadContent, {
      folder: "nhp-telegram",
      resource_type: videoObj ? "video" : "image",
    });
    return uploadRes.secure_url;
  } catch (err) {
    console.error("processTelegramMedia error:", err);
    return null;
  }
}

// In-memory rate limiting for feedback messages
const feedbackTimestamps = new Map<string, number>();

function shouldSendFeedback(chatId: string | number): boolean {
  const key = String(chatId);
  const now = Date.now();
  const lastSent = feedbackTimestamps.get(key) || 0;
  if (now - lastSent < 3000) {
    return false;
  }
  feedbackTimestamps.set(key, now);
  return true;
}

async function getDraftProperty(chatId: string | number, mediaGroupId: string | null): Promise<any | null> {
  if (!isDbConfigured) return null;

  // 1. Try to find by mediaGroupId first if provided
  if (mediaGroupId) {
    const draft = await db
      .select()
      .from(propertiesTable)
      .where(
        and(
          eq(propertiesTable.telegramMediaGroupId, mediaGroupId),
          eq(propertiesTable.status, "draft")
        )
      )
      .limit(1);
    if (draft.length > 0) return draft[0];
  }

  // 2. Try to find by slug = draft-chat-{chatId}
  const draft = await db
    .select()
    .from(propertiesTable)
    .where(
      and(
        eq(propertiesTable.slug, `draft-chat-${chatId}`),
        eq(propertiesTable.status, "draft")
      )
    )
    .limit(1);
  if (draft.length > 0) return draft[0];

  return null;
}

async function createDraftProperty(
  chatId: string | number,
  mediaGroupId: string | null,
  imageUrl: string,
  videoUrl?: string
): Promise<any> {
  const slug = mediaGroupId ? `draft-media-${mediaGroupId}` : `draft-chat-${chatId}`;

  if (isDbConfigured) {
    // Delete any existing draft with this slug first to avoid unique constraint violations
    await db.delete(propertiesTable).where(eq(propertiesTable.slug, slug));

    const [inserted] = await db
      .insert(propertiesTable)
      .values({
        slug,
        name: "Draft Listing",
        description: "",
        listingType: "sale",
        propertyType: "condo",
        status: "draft",
        priceTHB: "0",
        area: "Sukhumvit",
        coverImage: imageUrl,
        images: [imageUrl],
        videoUrl: videoUrl || null,
        hasVideo: !!videoUrl,
        telegramMediaGroupId: mediaGroupId,
        featured: false,
        likes: 0,
        saves: 0,
        clicks: 0,
      })
      .returning();
    return inserted;
  }
  return null;
}

async function appendMediaToDraft(
  draftId: number,
  imageUrl: string,
  videoUrl?: string
): Promise<void> {
  if (!isDbConfigured) return;

  const [draft] = await db
    .select({ images: propertiesTable.images })
    .from(propertiesTable)
    .where(eq(propertiesTable.id, draftId))
    .limit(1);

  if (!draft) return;

  const currentImages = draft.images || [];
  if (!currentImages.includes(imageUrl)) {
    currentImages.push(imageUrl);
  }

  await db
    .update(propertiesTable)
    .set({
      images: currentImages,
      ...(videoUrl ? { videoUrl, hasVideo: true } : {}),
    })
    .where(eq(propertiesTable.id, draftId));
}

async function publishDraftListing(
  botToken: string,
  chatId: string | number,
  messageId: number,
  draft: any,
  rawText: string
): Promise<NextResponse> {
  const parsed = parseTelegramMessage(rawText, messageId);

  // Automatically search search engine for built year if not provided
  if (!parsed.buildingBuilt) {
    const detectedYear = await findYearBuiltFromWeb(parsed.name);
    if (detectedYear) {
      parsed.buildingBuilt = detectedYear;
    }
  }

  // Cover image is the first image in draft images array
  const coverImage = draft.images?.[0] || draft.coverImage || null;

  // Compile all fields
  const propertyData = {
    ...parsed,
    coverImage,
    images: draft.images || [],
    hasVideo: draft.hasVideo || !!draft.videoUrl,
    videoUrl: draft.videoUrl,
    telegramMediaGroupId: draft.telegramMediaGroupId || null,
    status: "active" as const, // Change status to active
  };

  let updatedProperty: any = null;
  if (isDbConfigured) {
    const [updated] = await db
      .update(propertiesTable)
      .set({
        slug: propertyData.slug,
        name: propertyData.name,
        description: propertyData.description,
        listingType: propertyData.listingType,
        propertyType: propertyData.propertyType,
        status: propertyData.status,
        priceTHB: String(propertyData.priceTHB),
        priceUSD: propertyData.priceUSD ? String(propertyData.priceUSD) : null,
        priceLabel: null,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        sqm: propertyData.sqm || null,
        area: propertyData.area,
        district: propertyData.district || null,
        coverImage: propertyData.coverImage || null,
        images: propertyData.images || [],
        videoUrl: propertyData.videoUrl || null,
        featured: propertyData.featured,
        hasVideo: propertyData.hasVideo,
        petFriendly: propertyData.petFriendly,
        nearBts: propertyData.nearBts,
        telegramMediaGroupId: propertyData.telegramMediaGroupId || null,
        amenities: propertyData.amenities || [],
        features: propertyData.features || [],
        buildingBuilt: propertyData.buildingBuilt || null,
        lastRenovated: propertyData.lastRenovated || null,
        furnishing: propertyData.furnishing || null,
        availableFrom: propertyData.availableFrom || null,
        lastVerifiedAt: null,
        btsStation: propertyData.btsStation || null,
        btsWalkMin: propertyData.btsWalkMin || null,
        mrtStation: propertyData.mrtStation || null,
        mrtWalkMin: propertyData.mrtWalkMin || null,
        foreignQuota: propertyData.foreignQuota || null,
        visaFriendly: propertyData.visaFriendly || null,
        leaseTerms: propertyData.leaseTerms || null,
        depositTerms: propertyData.depositTerms || null,
        maintenance: propertyData.maintenance || null,
        floor: propertyData.floor || null,
        totalFloors: propertyData.totalFloors || null,
      })
      .where(eq(propertiesTable.id, draft.id))
      .returning();
    updatedProperty = updated;
  }

  if (chatId) {
    const propertyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/property/${propertyData.slug}`;
    const propName = propertyData.name;
    const propPrice = Number(propertyData.priceTHB).toLocaleString();
    const propArea = propertyData.area;
    const successText = `<b>✅ Listing Posted Successfully!</b>\n\n🏠 <b>Property:</b> ${propName}\n💰 <b>Price:</b> ฿${propPrice}\n📍 <b>Area:</b> ${propArea}\n\n🔗 <a href="${propertyUrl}">View Listing</a>`;
    await sendTelegramResponse(botToken, chatId, successText, messageId);
  }

  return NextResponse.json({
    ok: true,
    message: "Listing published successfully",
    property: updatedProperty
  });
}

export async function POST(req: NextRequest) {
  // Webhook Signature verification
  const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret && secretToken !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized request signature." }, { status: 401 });
  }

  let body: TelegramWebhookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 200 });
  }

  // Check if it's a channel post or a direct message update (for testing)
  const post = body.channel_post || body.message;
  if (!post) {
    return NextResponse.json({ ok: true, message: "No post message found to process." });
  }

  const botToken = process.env.TELEGRAM_CHANNEL_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_CHANNEL_BOT_TOKEN or TELEGRAM_BOT_TOKEN env variable is missing." }, { status: 500 });
  }

  const messageId = post.message_id;
  const chatId = post.chat?.id;
  if (!chatId) {
    return NextResponse.json({ ok: true, message: "No chat ID found." });
  }

  const mediaGroupId = post.media_group_id ? String(post.media_group_id) : null;
  const text = post.text || post.caption || "";
  const photoArray = post.photo || [];
  const videoObj = post.video;

  const hasMedia = photoArray.length > 0 || !!videoObj;

  try {
    // 1. Handle incoming media (photo or video)
    if (hasMedia) {
      // Download and upload to Cloudinary
      const newCloudinaryUrl = await processTelegramMedia(botToken, photoArray, videoObj);
      
      if (newCloudinaryUrl) {
        // Check if there is an existing draft
        const draft = await getDraftProperty(chatId, mediaGroupId);
        if (draft) {
          await appendMediaToDraft(draft.id, newCloudinaryUrl, videoObj ? newCloudinaryUrl : undefined);
        } else {
          await createDraftProperty(chatId, mediaGroupId, newCloudinaryUrl, videoObj ? newCloudinaryUrl : undefined);
        }
      }
    }

    // 2. Handle Text Caption (either alongside media, or as a standalone text message)
    if (text && text.trim() !== "") {
      // Find the draft
      let draft = await getDraftProperty(chatId, mediaGroupId);
      
      // If no draft exists, and this is a text message, we can't publish yet because there are no images.
      if (!draft) {
        if (chatId) {
          const warningText = `<b>ℹ️ Upload Photos First</b>\n\nPlease send one or more photos of the property first, then send the description details to publish the listing.`;
          await sendTelegramResponse(botToken, chatId, warningText, messageId);
        }
        return NextResponse.json({ ok: true, message: "Prompted user to upload photos first." });
      }

      // Save the text to the draft description so concurrent requests can see it
      if (isDbConfigured) {
        await db
          .update(propertiesTable)
          .set({ description: text })
          .where(eq(propertiesTable.id, draft.id));
      }

      // A. If this is a media message (i.e. we sent an album with caption, or a photo with caption)
      if (hasMedia) {
        // Wait 3 seconds to allow concurrent child images in the album to upload and append
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        // Reload draft to get all images
        let finalDraft = null;
        if (isDbConfigured) {
          const res = await db
            .select()
            .from(propertiesTable)
            .where(eq(propertiesTable.id, draft.id))
            .limit(1);
          if (res.length > 0) finalDraft = res[0];
        }
        
        // Double check if this session was already published (to prevent multiple publishes for the same message)
        if (!finalDraft || finalDraft.status !== "draft") {
          return NextResponse.json({ ok: true, message: "Already published by concurrent task or empty." });
        }

        // Publish the listing
        const result = await publishDraftListing(botToken, chatId, messageId, finalDraft, text);
        return result;
      }
      // B. If this is a text-only message (i.e. step-by-step description sent AFTER uploading photos)
      else {
        // Publish the listing
        const result = await publishDraftListing(botToken, chatId, messageId, draft, text);
        return result;
      }
    }
    // 3. Handle Media without caption (photos/videos sent step-by-step or in a caption-less album)
    else if (hasMedia) {
      // If it is part of an album, sleep for 500ms to allow the master request (with caption) to register first
      if (mediaGroupId) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const draft = await getDraftProperty(chatId, mediaGroupId);
      const imageCount = draft ? (draft.images?.length || 0) : 0;
      
      // If draft already has status !== 'draft', it was already published by the master request, so do nothing.
      if (draft && draft.status === "draft") {
        if (!draft.description) {
          const sendFeedback = shouldSendFeedback(chatId);
          if (sendFeedback && chatId) {
            const feedbackText = `<b>📷 Photo Received! (Total: ${imageCount})</b>\n\nUpload more photos, or send the property description details to publish the listing.`;
            await sendTelegramResponse(botToken, chatId, feedbackText, messageId);
          }
        }
      }
      
      return NextResponse.json({ ok: true, message: `Saved image to session (Total: ${imageCount})` });
    }

    return NextResponse.json({ ok: true, message: "No action taken (empty message)." });
  } catch (err) {
    console.error("Telegram Webhook processing error:", err);
    if (chatId) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const failText = `<b>❌ Listing Post Failed</b>\n\n<b>Reason:</b> ${errMsg}`;
      await sendTelegramResponse(botToken, chatId, failText, messageId);
    }
    return NextResponse.json({ error: "Failed to process Telegram post: " + (err instanceof Error ? err.message : String(err)) }, { status: 200 });
  }
}
