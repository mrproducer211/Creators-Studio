import { NextRequest, NextResponse } from "next/server";
import { requireAgentApi } from "@/lib/auth-helpers";
import { findLeadByEmail } from "@/lib/store/leads";
import { getAllProperties, createProperty } from "@/lib/store/properties";

// Helper to slugify title
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export async function GET(req: NextRequest) {
  const guard = await requireAgentApi();
  if ("error" in guard) return guard.error;

  const agentEmail = guard.user.email;

  try {
    // Check if agent is approved
    const agent = await findLeadByEmail(agentEmail);
    if (!agent || agent.agentStatus !== "approved") {
      return NextResponse.json({ error: "Your account is not approved to access listings." }, { status: 403 });
    }

    const all = await getAllProperties();
    // Filter properties uploaded by this agent
    const agentProperties = all.filter((p) => (p as any).agentEmail === agentEmail);

    return NextResponse.json({ success: true, properties: agentProperties });
  } catch (err) {
    console.error("Failed to fetch agent listings:", err);
    return NextResponse.json({ error: "Failed to fetch listings." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAgentApi();
  if ("error" in guard) return guard.error;

  const agentEmail = guard.user.email;

  try {
    // Check if agent is approved
    const agent = await findLeadByEmail(agentEmail);
    if (!agent || agent.agentStatus !== "approved") {
      return NextResponse.json({ error: "Your account is not approved to upload listings." }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      listingType,
      propertyType,
      priceTHB,
      bedrooms,
      bathrooms,
      sqm,
      area,
      coverImage,
      petFriendly,
      nearBts,
      btsStation,
      floor,
      totalFloors,
      availableFrom,
      leaseTerms,
      amenities,
      images,
      furnishing,
      status,
    } = body;

    if (!name || !listingType || !propertyType || !priceTHB || !area) {
      return NextResponse.json({ error: "Required fields are missing: name, listingType, propertyType, priceTHB, and area are mandatory." }, { status: 400 });
    }

    const slug = `${slugify(name)}-${Date.now()}`;

    const newProp = await createProperty({
      slug,
      name,
      description: description || "",
      listingType,
      propertyType,
      priceTHB: Number(priceTHB),
      bedrooms: Number(bedrooms || 0),
      bathrooms: Number(bathrooms || 1),
      sqm: sqm ? Number(sqm) : undefined,
      area,
      coverImage: coverImage || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&q=80",
      featured: false,
      hasVideo: false,
      petFriendly: !!petFriendly,
      nearBts: !!nearBts,
      btsStation: btsStation || undefined,
      verificationBadge: false, // Must be verified by admin
      likes: 0,
      saves: 0,
      clicks: 0,
      viewCount: 0,
      images: images || [],
      amenities: amenities || [],
      features: [],
      schools: [],
      transit: [],
      agentEmail, // Associate listing with the agent
      floor: floor ? Number(floor) : undefined,
      totalFloors: totalFloors ? Number(totalFloors) : undefined,
      availableFrom: availableFrom || undefined,
      leaseTerms: leaseTerms || undefined,
      furnishing: furnishing || undefined,
      status: status === "unlisted" ? "unlisted" : "active", // custom status support
    } as any);

    return NextResponse.json({ success: true, property: newProp });
  } catch (err) {
    console.error("Failed to upload property:", err);
    return NextResponse.json({ error: "Failed to upload property." }, { status: 500 });
  }
}
