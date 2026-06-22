import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { SavedProvider } from "@/contexts/SavedContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://newhomesproperty.com"),
  title: "New Homes Property — Live. Belong. Bangkok.",
  description:
    "Bangkok's premium property platform for expats, digital nomads and international residents. Buy, long rent, or short stay.",
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
  url: "https://newhomesproperty.com",
  logo: "https://newhomesproperty.com/images/nhp-logo.webp",
  description:
    "Bangkok's premium property platform for expats, digital nomads and international residents. Buy, long rent, or short stay.",
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
  url: "https://newhomesproperty.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://newhomesproperty.com/explore?q={search_term_string}",
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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
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
