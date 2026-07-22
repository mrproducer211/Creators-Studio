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
const HomepageFaqBlock = nextDynamic(
  () => import("@/components/HomepageFaqBlock"),
  { loading: () => <div style={{ height: "240px" }} /> }
);
const TrustBadges = nextDynamic(() => import("@/components/TrustBadges"), {
  loading: () => <TrustSkeleton />,
});

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bangkok Condos, Apartments & Luxury Properties | New Homes Property",
  description: "Discover neighbourhood properties for rent and sale in Bangkok's best neighborhoods, including Thong Lo, Sathorn, Ari, and Asok. Your trusted Bangkok expat real estate platform.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bangkok Condos, Apartments & Luxury Properties | New Homes Property",
    description: "Discover neighbourhood properties for rent and sale in Bangkok's best neighborhoods, including Thong Lo, Sathorn, Ari, and Asok. Your trusted Bangkok expat real estate platform.",
    url: "https://newhomesproperty.com",
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
    description: "Discover neighbourhood properties for rent and sale in Bangkok's best neighborhoods, including Thong Lo, Sathorn, Ari, and Asok. Your trusted Bangkok expat real estate platform.",
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
        <HomepageFaqBlock />
      </main>
      <TrustBadges />
      <Footer />
    </>
  );
}
