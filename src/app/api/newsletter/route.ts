import { NextRequest, NextResponse } from "next/server";
import { addSubscriber, getSubscribers, removeSubscriber } from "@/lib/store/newsletter";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as { role?: string })?.role;

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const subscribers = await getSubscribers();
    return NextResponse.json({
      success: true,
      subscribers,
      total: subscribers.length,
    });
  } catch (err) {
    console.error("GET newsletter error: ", err);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const isNew = await addSubscriber(email, source || "Blog Newsletter");

    // If it's a new subscriber and Resend is configured, send the welcome email
    const apiKey = process.env.RESEND_API_KEY;
    if (isNew && apiKey) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "NHP Bangkok <onboarding@resend.dev>";

      const welcomeHtml = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FAF9F6; border: 1px solid #E7E5DF; border-radius: 16px;">
          <h2 style="color: #0F2A20; margin-top: 0;">Welcome to NHP Bangkok Newsletter!</h2>
          <p style="color: #444; line-height: 1.6;">Thank you for subscribing to our Bangkok lifestyle and real estate guide newsletter.</p>
          <p style="color: #444; line-height: 1.6;">You'll receive honest neighbourhood comparisons, cost of living breakdowns, expat visa alerts, and handpicked local property insights.</p>
          <div style="margin: 24px 0;">
            <a href="https://newhomesproperty.com/blog" style="background-color: #0F2A20; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Browse Our Latest Guides</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #E7E5DF; margin: 24px 0;" />
          <p style="color: #999; font-size: 11px; margin-bottom: 0;">NHP Bangkok Team &middot; Bangkok, Thailand</p>
        </div>
      `;

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email.trim().toLowerCase()],
            subject: "Welcome to NHP Bangkok — Expat Tips & Guides",
            html: welcomeHtml,
          }),
        });
      } catch (err) {
        console.error("Resend welcome email failed: ", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: isNew ? "Successfully subscribed! You're all set." : "You're already subscribed!",
    });
  } catch (err) {
    console.error("Newsletter API error: ", err);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as { role?: string })?.role;

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const removed = await removeSubscriber(email);
    return NextResponse.json({ success: true, removed });
  } catch (err) {
    console.error("DELETE newsletter error: ", err);
    return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 });
  }
}
