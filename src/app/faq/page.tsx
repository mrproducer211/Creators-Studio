import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "Bangkok Rental FAQ — How NHP Works | New Homes Property",
  description:
    "Find answers to common questions about renting a condo in Bangkok. Learn how NHP verifies listings, schedules viewings, and guides expats through renting.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Bangkok Rental FAQ | New Homes Property",
    description:
      "Find answers to common questions about renting a condo in Bangkok. Learn how NHP verifies listings, schedules viewings, and guides expats through renting.",
    url: "https://newhomesproperty.com/faq",
    siteName: "New Homes Property",
    type: "website",
  },
};

export const revalidate = 86400;

export default function FaqPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "FAQ & Help Center",
        "item": `${baseUrl}/faq`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <FaqClient />
    </>
  );
}
