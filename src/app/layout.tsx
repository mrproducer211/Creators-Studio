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

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "New Homes Property — Live. Belong. Bangkok.",
  description:
    "Bangkok's neighbourhood property platform for expats, digital nomads and international residents. Buy, long rent, or short stay.",
  openGraph: {
    siteName: "New Homes Property",
  },
};

// Site-wide structured data — injected once in the root layout
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "New Homes Property",
  alternateName: ["NHP Bangkok", "NHP"],
  url: baseUrl,
  logo: `${baseUrl}/images/nhp-logo.webp`,
  description:
    "Bangkok's neighbourhood property platform for expats, digital nomads and international residents. Buy, long rent, or short stay.",
  areaServed: {
    "@type": "City",
    name: "Bangkok",
    addressCountry: "TH",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
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
        {/* Preconnect to Google Fonts CDN for faster font delivery */}
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
