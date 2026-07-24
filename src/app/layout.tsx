import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";
import { SavedProvider } from "@/contexts/SavedContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
  preload: true,
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

// ── Business contact + service area ──────────────────────────────────────────
// Single source of truth for contact details used in schema + footer.
// NHP operates as a service-area business: agents meet clients at properties
// across Bangkok rather than from a walk-in office. So we publish only
// truthful city-level address data plus areaServed, not a fake street/geo.
const BUSINESS_ADDRESS = {
  addressLocality: "Bangkok",
  addressRegion: "Bangkok",
  addressCountry: "TH",
};
const BUSINESS_PHONE = "+66818794182";
const BUSINESS_EMAIL = "admin@nhpbangkok.com";

// Bing Webmaster Tools verification code (claim at bing.com/webmasters).
// TODO(owner): paste your msvalidate.01 value here; leave empty to omit the tag.
const BING_VERIFICATION = ""; // e.g. "ABC123..."

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "New Homes Property — Live. Belong. Bangkok.",
  description:
    "Bangkok's neighbourhood property platform for expats, digital nomads and international residents. Buy, long rent, or short stay.",
  verification: {
    // Google is verified via the HTML file in /public; this is a backup tag.
    google: "",
    other: BING_VERIFICATION ? { "msvalidate.01": BING_VERIFICATION } : {},
  },
  openGraph: {
    siteName: "New Homes Property",
    images: [
      {
        url: "/images/homepage_hero_v2.webp",
        width: 1200,
        height: 630,
        alt: "New Homes Property Bangkok",
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/homepage_hero_v2.webp"],
  }
};

// Site-wide structured data — injected once in the root layout.
// RealEstateAgent (niche) + LocalBusiness (Google local-pack eligibility).
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": ["RealEstateAgent", "LocalBusiness"],
  name: "New Homes Property",
  alternateName: ["NHP Bangkok", "NHP"],
  url: baseUrl,
  logo: `${baseUrl}/images/nhp-logo.webp`,
  image: `${baseUrl}/images/nhp-logo.webp`,
  description:
    "Bangkok's neighbourhood property platform for expats, digital nomads and international residents. Buy, long rent, or short stay.",
  telephone: BUSINESS_PHONE,
  email: BUSINESS_EMAIL,
  priceRange: "฿฿฿",
  currenciesAccepted: "THB, USD, EUR, CNY",
  address: {
    "@type": "PostalAddress",
    ...BUSINESS_ADDRESS,
  },
  // No geo/hasMap: service-area business with no public office (avoids
  // publishing a misleading point location to local search).
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "20:00",
    },
  ],
  areaServed: {
    "@type": "City",
    name: "Bangkok",
    address: {
      "@type": "PostalAddress",
      addressCountry: "TH",
    },
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    areaServed: "TH",
    availableLanguage: ["English", "Thai"],
  },
  sameAs: [
    "https://www.facebook.com/newhomesproperty.com",
    "https://www.instagram.com/newhomesproperty.com",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "New Homes Property",
  alternateName: ["NHP Bangkok", "NHP"],
  url: baseUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}/explore?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Suppress unhandled errors from browser extensions like MetaMask */}
        <Script
          id="suppress-extension-errors"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.addEventListener('unhandledrejection', function(e) {
                  var msg = (e && e.reason && e.reason.message) || '';
                  var stack = (e && e.reason && e.reason.stack) || '';
                  if (msg.includes('MetaMask') || msg.includes('ethereum') || stack.includes('chrome-extension://')) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                });
                window.addEventListener('error', function(e) {
                  var filename = (e && e.filename) || '';
                  var msg = (e && e.message) || '';
                  if (filename.includes('chrome-extension://') || msg.includes('MetaMask')) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              })();
            `,
          }}
        />
        {/* Preconnect to key CDNs for faster asset delivery */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Google Analytics tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3MBFTGN0YR"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-3MBFTGN0YR');
          `}
        </Script>

        {/* Site-wide structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <SessionProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <SavedProvider>
                <RecentlyViewedProvider>
                  {children}
                </RecentlyViewedProvider>
              </SavedProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
