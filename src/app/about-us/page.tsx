import AboutClient from "@/components/about/AboutClient";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

export const metadata: Metadata = {
  title: "About NHP Bangkok | Bangkok Property Experts for Expats & Nomads",
  description:
    "NHP Bangkok is a specialist property platform built for expats, digital nomads, and international residents seeking condos, long-term rentals, and short-stay apartments in Bangkok's best neighbourhoods.",
  alternates: {
    canonical: `${baseUrl}/about-us`,
  },
  openGraph: {
    title: "About NHP Bangkok | Bangkok Property Experts for Expats & Nomads",
    description:
      "NHP Bangkok is a specialist property platform built for expats, digital nomads, and international residents seeking condos, long-term rentals, and short-stay apartments in Bangkok's best neighbourhoods.",
    url: `${baseUrl}/about-us`,
    siteName: "New Homes Property",
    images: [
      {
        url: "/images/homepage_hero_v2.webp",
        width: 1200,
        height: 630,
        alt: "About New Homes Property Bangkok",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About NHP Bangkok | Bangkok Property Experts for Expats & Nomads",
    description:
      "NHP Bangkok is a specialist property platform built for expats, digital nomads, and international residents seeking condos, long-term rentals, and short-stay apartments in Bangkok's best neighbourhoods.",
    images: ["/images/homepage_hero_v2.webp"],
  },
};

export const revalidate = 86400;

export default function AboutUsPage() {
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
        "name": "About Us",
        "item": `${baseUrl}/about-us`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AboutClient />
    </>
  );
}
