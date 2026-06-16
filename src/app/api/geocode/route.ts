import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // Fallback mock geocoder for local dev if key is missing
  if (!apiKey || apiKey.startsWith("your_")) {
    const query = q.toLowerCase();
    let lat = 13.7367;
    let lng = 100.5612;
    let name = q;

    if (query.includes("sathorn")) {
      lat = 13.7226;
      lng = 100.5293;
      name = "Sathorn Square";
    } else if (query.includes("sukhumvit") || query.includes("phrom phong") || query.includes("emquartier")) {
      lat = 13.7314;
      lng = 100.5694;
      name = "EM Quartier";
    } else if (query.includes("asok") || query.includes("asoke") || query.includes("nist")) {
      lat = 13.7431;
      lng = 100.5592;
      name = "NIST School";
    } else if (query.includes("ari")) {
      lat = 13.7797;
      lng = 100.5447;
      name = "Ari BTS";
    } else if (query.includes("silom")) {
      lat = 13.7258;
      lng = 100.5273;
      name = "Silom Complex";
    } else if (query.includes("on nut") || query.includes("onnut")) {
      lat = 13.7056;
      lng = 100.6012;
      name = "On Nut BTS";
    } else if (query.includes("rama 9") || query.includes("rama9")) {
      lat = 13.7583;
      lng = 100.5658;
      name = "Central Rama 9";
    } else if (query.includes("paragon") || query.includes("siam")) {
      lat = 13.7468;
      lng = 100.5348;
      name = "Siam Paragon";
    }

    return NextResponse.json({
      success: true,
      name,
      address: `${name}, Bangkok`,
      lat,
      lng,
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      q + ", Bangkok"
    )}&inputtype=textquery&fields=name,formatted_address,geometry&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to query Google Places API" }, { status: 500 });
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];

    if (!candidate || !candidate.geometry?.location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      name: candidate.name,
      address: candidate.formatted_address,
      lat: candidate.geometry.location.lat,
      lng: candidate.geometry.location.lng,
    });
  } catch (err) {
    console.error("Geocoding API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
