import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/store/newsletter";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const isNew = await addSubscriber(email);

    // If it's a new subscriber and Resend is configured, send the welcome email
    const apiKey = process.env.RESEND_API_KEY;
    if (isNew && apiKey) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "NHP Bangkok <onboarding@resend.dev>";
      
      const welcomeHtml = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF8F3; border: 1px solid #EDE8DF; border-radius: 16px;">
          <h2 style="color: #1C3A2F; margin-top: 0;">Welcome to NHP Bangkok!</h2>
          <p style="color: #444; line-height: 1.6;">Thank you for subscribing to our Bangkok lifestyle and property newsletter.</p>
          <p style="color: #444; line-height: 1.6;">You'll receive honest neighbourhood guides, cost of living breakdowns, expat visa alerts, and handpicked local insights from experts who live here.</p>
          <div style="margin: 24px 0;">
            <a href="https://newhomesproperty.com/blog" style="background-color: #1C3A2F; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Browse Our Latest Guides</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #EDE8DF; margin: 24px 0;" />
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
        // Log Resend failure but don't fail the request (local database save succeeded)
        console.error("Resend welcome email failed: ", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: isNew ? "Successfully subscribed!" : "Already subscribed.",
    });
  } catch (err) {
    console.error("Newsletter API error: ", err);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
