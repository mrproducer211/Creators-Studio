import { NextRequest, NextResponse } from "next/server";
import { addReview, getAllReviews } from "@/lib/store/reviews";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, projectName, authorName, authorEmail, rating, title, body: reviewBody, userId } = body;

    if (!propertyId || !authorName || !rating) {
      return NextResponse.json({ error: "Missing required fields: propertyId, authorName, rating" }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: "Rating must be a number between 1 and 5" }, { status: 400 });
    }

    // Deduplicate: check if same email/user already left a review for this property
    const existing = await getAllReviews();
    const hasAlreadyReviewed = existing.some(
      (r) => r.propertyId === Number(propertyId) && 
             ((authorEmail && r.authorEmail?.toLowerCase() === authorEmail.toLowerCase()) || 
              (userId && r.userId === userId))
    );

    if (hasAlreadyReviewed) {
      return NextResponse.json({ error: "You have already submitted a review for this property." }, { status: 400 });
    }

    const sanitize = (str?: string, maxLen = 1000) => {
      if (!str) return undefined;
      return String(str)
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .trim()
        .substring(0, maxLen);
    };

    const review = await addReview({
      propertyId: Number(propertyId),
      projectName: sanitize(projectName, 100),
      authorName: sanitize(authorName, 80) || "Anonymous",
      authorEmail: authorEmail ? String(authorEmail).trim().toLowerCase().substring(0, 100) : undefined,
      rating: Math.round(numericRating),
      title: sanitize(title, 150),
      body: sanitize(reviewBody, 1500),
      userId: userId ? String(userId).substring(0, 80) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Your review has been submitted and is pending admin approval.",
      review,
    });
  } catch (err) {
    console.error("Submit review POST error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
