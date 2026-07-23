import { NextRequest, NextResponse } from "next/server";
import { getAllReviews, updateReviewStatus, deleteReview } from "@/lib/store/reviews";

export async function GET(req: NextRequest) {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    console.error("Admin reviews GET error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status || !["published", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const updated = await updateReviewStatus(Number(id), status);
    if (!updated) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, review: updated });
  } catch (err) {
    console.error("Admin review PATCH error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");
    if (!idStr) {
      return NextResponse.json({ error: "Missing review id" }, { status: 400 });
    }

    const deleted = await deleteReview(Number(idStr));
    return NextResponse.json({ success: deleted });
  } catch (err) {
    console.error("Admin review DELETE error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
