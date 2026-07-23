import { OgImage } from "@/lib/og-template";

export const alt = "About New Homes Property — Bangkok property experts for expats";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return OgImage({
    title: "About NHP Bangkok",
    subtitle: "Bangkok's neighbourhood property platform for expats, digital nomads and international residents.",
  });
}
