import { NextRequest, NextResponse } from "next/server";
import { getPublishedReviewsForProperty, getAggregateRatingForProperty } from "@/lib/store/reviews";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const propertyIdStr = searchParams.get("propertyId");
  const projectName = searchParams.get("projectName") || undefined;

  if (!propertyIdStr) {
    return NextResponse.json({ error: "Missing propertyId parameter" }, { status: 400 });
  }

  const propertyId = parseInt(propertyIdStr, 10);
  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "Invalid propertyId parameter" }, { status: 400 });
  }

  try {
    const reviews = await getPublishedReviewsForProperty(propertyId, projectName);
    const aggregate = await getAggregateRatingForProperty(propertyId, projectName);

    return NextResponse.json({
      success: true,
      propertyId,
      reviews,
      aggregateRating: aggregate,
    });
  } catch (err) {
    console.error("Public reviews GET error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
