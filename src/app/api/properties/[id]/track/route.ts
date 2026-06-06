import { NextResponse } from "next/server";
import { incrementPropertyView, incrementPropertyClick, incrementPropertyLike, trackPageView } from "@/lib/db/dbLoader";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);
    if (isNaN(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const { type, page } = await req.json().catch(() => ({ type: "view", page: "" }));

    if (type === "click") {
      await incrementPropertyClick(propertyId);
    } else if (type === "like") {
      await incrementPropertyLike(propertyId);
    } else {
      // Default to view
      await incrementPropertyView(propertyId);
      // Log to pageViews table
      if (page) {
        await trackPageView(propertyId, page);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Tracking error:", err);
    return NextResponse.json({ error: "Failed to track engagement" }, { status: 500 });
  }
}
