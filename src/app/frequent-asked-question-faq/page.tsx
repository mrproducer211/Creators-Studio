import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "Bangkok Rental FAQ — How NHP Works | New Homes Property",
  description:
    "Find answers to the most common questions about renting a condo in Bangkok. Learn how NHP verifies listings, arranges viewings, and helps expats find their perfect home.",
  alternates: {
    canonical: "/frequent-asked-question-faq",
  },
  openGraph: {
    title: "Bangkok Rental FAQ | New Homes Property",
    description:
      "Everything you need to know about renting a condo in Bangkok — verified listings, viewings, fees, deposits, and neighbourhood guides.",
    url: "https://newhomesproperty.com/frequent-asked-question-faq",
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
        "item": `${baseUrl}/frequent-asked-question-faq`
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
