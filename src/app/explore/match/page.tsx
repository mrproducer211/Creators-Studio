import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import MatchExplorer from "@/components/explore/MatchExplorer";
import { getDbProperties } from "@/lib/db/dbLoader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Neighborhood Match — Bangkok Neighborhood Lifestyle Finder",
  description: "Find your ideal Bangkok neighborhood and condos with AI and commute mapping.",
  alternates: {
    canonical: "/explore/match",
  },
  openGraph: {
    title: "Neighborhood Match — Bangkok Neighborhood Lifestyle Finder",
    description: "Find your ideal Bangkok neighborhood and condos with AI and commute mapping.",
    url: "/explore/match",
    images: [
      {
        url: "/images/neighborhood-match-og.webp",
        width: 1200,
        height: 630,
        alt: "Neighborhood Match — Bangkok Neighborhood Lifestyle Finder",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Neighborhood Match — Bangkok Neighborhood Lifestyle Finder",
    description: "Find your ideal Bangkok neighborhood and condos with AI and commute mapping.",
    images: ["/images/neighborhood-match-og.webp"],
  },
};

export default async function MatchPage() {
  const properties = await getDbProperties();

  return (
    <>
      <Navbar />
      <main className="min-h-0 lg:min-h-screen" style={{ background: "#F7F3EC" }}>
        <Suspense fallback={
          <div className="w-full max-w-5xl mx-auto px-4 py-8">
            <div className="h-6 w-48 bg-[#1C3A2F]/10 rounded animate-pulse mx-auto mb-4" />
            <div className="h-10 w-80 bg-[#1C3A2F]/10 rounded animate-pulse mx-auto mb-8" />
            <div className="h-64 w-full bg-[#1C3A2F]/5 rounded-3xl animate-pulse" />
          </div>
        }>
          <MatchExplorer properties={properties} />
        </Suspense>
      </main>
    </>
  );
}
