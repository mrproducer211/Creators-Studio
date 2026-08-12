import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import BrowseModes from "@/components/BrowseModes";
import Footer from "@/components/Footer";
import { getDbProperties } from "@/lib/db/dbLoader";
import { getAllPosts } from "@/lib/store/blog";
import nextDynamic from "next/dynamic";
import {
  CategorySkeleton,
  LatestSkeleton,
  BlogSkeleton,
  TalkSkeleton,
  TrustSkeleton,
} from "@/components/LoadingSkeletons";

/* ── Below-the-fold components loaded lazily ──
   These are deferred from the critical path, saving ~65KB of JS
   from the initial bundle. Skeleton placeholders prevent layout shift. */
const CategorySection = nextDynamic(() => import("@/components/CategorySection"), {
  loading: () => <CategorySkeleton />,
});
const LatestProperties = nextDynamic(
  () => import("@/components/LatestProperties"),
  { loading: () => <LatestSkeleton /> }
);
const BlogSection = nextDynamic(() => import("@/components/BlogSection"), {
  loading: () => <BlogSkeleton />,
});
const TalkToUs = nextDynamic(() => import("@/components/TalkToUs"), {
  loading: () => <TalkSkeleton />,
});
const TrustBadges = nextDynamic(() => import("@/components/TrustBadges"), {
  loading: () => <TrustSkeleton />,
});

// ISR: homepage is cached and regenerated every 30 minutes instead of
// hitting the DB on every request. Big TTFB win for the primary SEO landing page.
export const revalidate = 1800;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

export const metadata = {
  title: "Bangkok Condos, Apartments & Luxury Properties | New Homes Property",
  description: "Discover verified condos, apartments, and villas for rent and sale in top Bangkok neighborhoods like Thong Lo, Sathorn & Ari. Your expat real estate guide.",
  alternates: {
    canonical: `${baseUrl}/`,
  },
  openGraph: {
    title: "Bangkok Condos, Apartments & Luxury Properties | New Homes Property",
    description: "Discover verified condos, apartments, and villas for rent and sale in top Bangkok neighborhoods like Thong Lo, Sathorn & Ari. Your expat real estate guide.",
    url: `${baseUrl}/`,
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
    title: "Bangkok Condos, Apartments & Luxury Properties | New Homes Property",
    description: "Discover verified condos, apartments, and villas for rent and sale in top Bangkok neighborhoods like Thong Lo, Sathorn & Ari. Your expat real estate guide.",
    images: ["/images/homepage_hero_v2.webp"],
  },
};

export default async function Home() {
  const allProperties = await getDbProperties();
  const allPosts = await getAllPosts();
  
  // Sort properties by updatedAt descending (fallback to createdAt)
  const latestFive = [...allProperties]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const featuredProperty = latestFive[0] || allProperties.find((p) => p.featured) || allProperties[0];

  return (
    <>
      <Navbar />
      <main>
        <HeroSection featured={featuredProperty} />
        <TrustStrip />
        <BrowseModes />
        <CategorySection properties={allProperties} />
        <LatestProperties properties={latestFive} allProperties={allProperties} />
        <BlogSection posts={allPosts.slice(0, 4)} />
        <TalkToUs />
      </main>
      <TrustBadges />
      <Footer />
    </>
  );
}
