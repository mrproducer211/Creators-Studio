import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  // Ensure the request is from an authorized admin
  const authCheck = await requireAdminApi();
  if ("error" in authCheck) {
    return authCheck.error;
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check config validity
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName || cloudName.startsWith("your_")) {
      return NextResponse.json({
        error: "Cloudinary is not configured. Please add valid keys to .env.local"
      }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Promise wrapper for Cloudinary upload stream
    const result = await new Promise<{ secure_url: string; resource_type: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto", // Automatically detect image or video
          folder: "nhp-bangkok",
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
    console.error("Upload API error:", err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Cloudinary upload failed."
    }, { status: 500 });
  }
}
