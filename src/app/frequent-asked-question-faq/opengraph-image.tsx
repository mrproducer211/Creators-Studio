import { OgImage } from "@/lib/og-template";

export const alt = "FAQ & Help Center — New Homes Property Bangkok";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return OgImage({
    title: "FAQ & Help Center",
    subtitle: "Answers on renting, buying and living in Bangkok with New Homes Property.",
  });
}
