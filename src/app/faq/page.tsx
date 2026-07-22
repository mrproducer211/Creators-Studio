import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "Bangkok Rental FAQ — How NHP Works | New Homes Property",
  description:
    "Find answers to the most common questions about renting a condo in Bangkok. Learn how NHP verifies listings, arranges viewings, and helps expats find their perfect home.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Bangkok Rental FAQ | New Homes Property",
    description:
      "Everything you need to know about renting a condo in Bangkok — verified listings, viewings, fees, deposits, and neighbourhood guides.",
    url: "https://newhomesproperty.com/faq",
    siteName: "New Homes Property",
    type: "website",
  },
};

export default function FaqPage() {
  return <FaqClient />;
}
