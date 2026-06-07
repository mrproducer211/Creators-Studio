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
  title: "NHP — New Homes Property Bangkok",
  description:
    "Bangkok's premium property platform for expats, digital nomads and international residents. Buy, long rent, or short stay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
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
