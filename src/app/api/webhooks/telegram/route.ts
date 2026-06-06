import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db, isDbConfigured } from "@/lib/db";
import { properties as propertiesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createProperty, getAllProperties, updateProperty } from "@/lib/store/properties";
import { PropertyCard } from "@/types/property";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  let description = text;

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

  // Area (known list)
  const areas = ["Sukhumvit", "Sathorn", "Thong Lo", "Asok", "Ekkamai", "Silom", "On Nut", "Ari"];
  for (const a of areas) {
    const regex = new RegExp(a, "i");
    if (regex.test(text)) {
      area = a;
      break;
    }
  }
  const areaMatch = text.match(/(?:#area|area)[:\s=]+([^\n]+)/i);
  if (areaMatch) {
    const parsedArea = areaMatch[1].trim();
    area = parsedArea.charAt(0).toUpperCase() + parsedArea.slice(1);
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
      const isFeature = item.toLowerCase().includes("balcony") ||
                        item.toLowerCase().includes("bathtub") ||
                        item.toLowerCase().includes("view") ||
                        item.toLowerCase().includes("fitted");
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
    featured: false,
    hasVideo: false,
    likes: 0,
    saves: 0,
    clicks: 0,
  };
}

export async function POST(req: NextRequest) {
  // Webhook Signature verification
  const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret && secretToken !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized request signature." }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Check if it's a channel post or a direct message update (for testing)
  const post = body.channel_post || body.message;
  if (!post) {
    // Return 200 to acknowledge other Telegram update types (like callbacks)
    return NextResponse.json({ ok: true, message: "No post message found to process." });
  }

  const botToken = process.env.TELEGRAM_CHANNEL_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_CHANNEL_BOT_TOKEN or TELEGRAM_BOT_TOKEN env variable is missing." }, { status: 500 });
  }

  const messageId = post.message_id;
  const mediaGroupId = post.media_group_id ? String(post.media_group_id) : null;
  const text = post.text || post.caption || "";
  const photoArray = post.photo || [];
  const videoObj = post.video;

  let newCloudinaryUrl: string | null = null;

  try {
    // 1. Download file from Telegram and upload to Cloudinary if photo/video exists
    let fileId: string | null = null;
    if (photoArray.length > 0) {
      // Pick the largest photo resolution (last in array)
      fileId = photoArray[photoArray.length - 1].file_id;
    } else if (videoObj) {
      fileId = videoObj.file_id;
    }

    if (fileId) {
      const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
      const fileRes = await fetch(getFileUrl);
      if (fileRes.ok) {
        const fileJson = await fileRes.json();
        const filePath = fileJson.result.file_path;
        if (filePath) {
          const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
          const uploadRes = await cloudinary.uploader.upload(downloadUrl, {
            folder: "nhp-telegram",
            resource_type: videoObj ? "video" : "image",
          });
          newCloudinaryUrl = uploadRes.secure_url;
        }
      }
    }

    // 2. Combine multi-photo posts matching on mediaGroupId
    if (mediaGroupId) {
      let existingProperty: any = null;

      if (isDbConfigured) {
        const dbResult = await db
          .select()
          .from(propertiesTable)
          .where(eq(propertiesTable.telegramMediaGroupId, mediaGroupId))
          .limit(1);
        if (dbResult.length > 0) {
          existingProperty = dbResult[0];
        }
      } else {
        const localProperties = await getAllProperties();
        existingProperty = localProperties.find(p => p.telegramMediaGroupId === mediaGroupId) || null;
      }

      if (existingProperty) {
        // We found an existing property listed under this media group. Append the new image URL.
        const updatedImages = [...(existingProperty.images || [])];
        if (newCloudinaryUrl) {
          updatedImages.push(newCloudinaryUrl);
        }

        if (isDbConfigured) {
          await db
            .update(propertiesTable)
            .set({ images: updatedImages })
            .where(eq(propertiesTable.id, existingProperty.id));
        } else {
          await updateProperty(existingProperty.id, { images: updatedImages });
        }

        return NextResponse.json({ ok: true, message: `Appended media to property ID ${existingProperty.id}` });
      }
    }

    // 3. Standalone post or first message in a media group album
    const parsed = parseTelegramMessage(text, messageId);
    
    // Add parsed fields and save
    const propertyData: Omit<PropertyCard, "id" | "createdAt"> & { telegramMediaGroupId?: string } = {
      ...parsed,
      coverImage: newCloudinaryUrl || undefined,
      images: newCloudinaryUrl ? [newCloudinaryUrl] : [],
      hasVideo: !!videoObj,
      videoUrl: (videoObj && newCloudinaryUrl) ? newCloudinaryUrl : undefined,
      telegramMediaGroupId: mediaGroupId || undefined,
    };

    if (isDbConfigured) {
      const [created] = await db
        .insert(propertiesTable)
        .values({
          slug: propertyData.slug,
          name: propertyData.name,
          description: propertyData.description,
          listingType: propertyData.listingType,
          propertyType: propertyData.propertyType,
          priceTHB: String(propertyData.priceTHB),
          priceUSD: propertyData.priceUSD ? String(propertyData.priceUSD) : null,
          priceLabel: propertyData.priceLabel || null,
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
        })
        .returning();

      return NextResponse.json({ ok: true, message: "Listing created in live Neon DB", property: created });
    } else {
      const created = await createProperty(propertyData as any);
      return NextResponse.json({ ok: true, message: "Listing created in local JSON store", property: created });
    }
  } catch (err) {
    console.error("Telegram Webhook processing error:", err);
    return NextResponse.json({ error: "Failed to process Telegram post: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
