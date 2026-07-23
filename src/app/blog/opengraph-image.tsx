import { OgImage } from "@/lib/og-template";

export const alt = "Bangkok Property Guides & Expat Tips — NHP Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return OgImage({
    title: "NHP Blog",
    subtitle: "Honest neighbourhood guides, rental price breakdowns and expat tips for Bangkok.",
  });
}
