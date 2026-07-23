import { OgImage } from "@/lib/og-template";

// Next.js metadata file convention: exporting a default ImageResponse from
// `opengraph-image.tsx` auto-generates the OG image for this route segment.
export const alt = "Explore Bangkok properties & condos with NHP";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return OgImage({
    title: "Explore Bangkok Properties",
    subtitle: "Condos & apartments for rent and sale across Bangkok's best neighbourhoods.",
  });
}
