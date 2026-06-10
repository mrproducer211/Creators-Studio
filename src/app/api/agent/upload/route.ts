import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { requireAgentApi } from "@/lib/auth-helpers";
import { findLeadByEmail } from "@/lib/store/leads";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  // Ensure the request is from an authorized agent
  const authCheck = await requireAgentApi();
  if ("error" in authCheck) {
    return authCheck.error;
  }

  const agentEmail = authCheck.user.email;

  try {
    // Check if agent is approved in the data store
    const agent = await findLeadByEmail(agentEmail);
    if (!agent || agent.agentStatus !== "approved") {
      return NextResponse.json(
        { error: "Your account is not approved to upload listings." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Enforce 3MB maximum size limit (3 * 1024 * 1024 bytes)
    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 3MB limit. Please upload a smaller image." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Fallback to base64 Data URL if Cloudinary is not configured
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || cloudName.startsWith("your_") || !apiKey || apiKey.startsWith("your_") || !apiSecret) {
      // Local dev offline mode: return base64 Data URL
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64Data}`;
      return NextResponse.json({ url: dataUrl, resourceType: "image" });
    }

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string; resource_type: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "nhp-bangkok-agents",
        },
        (error, res) => {
          if (error) return reject(error);
          resolve(res as { secure_url: string; resource_type: string });
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url, resourceType: result.resource_type });
  } catch (err) {
    console.error("Agent upload API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}
