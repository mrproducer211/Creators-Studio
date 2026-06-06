import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import BrowseModes from "@/components/BrowseModes";
import CategorySection from "@/components/CategorySection";
import LatestProperties from "@/components/LatestProperties";
import BlogSection from "@/components/BlogSection";
import TalkToUs from "@/components/TalkToUs";
import Footer from "@/components/Footer";
import { getDbProperties } from "@/lib/db/dbLoader";
import { getAllPosts } from "@/lib/store/blog";

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

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustStrip />
        <BrowseModes />
        <CategorySection />
        <LatestProperties properties={latestFive} />
        <BlogSection posts={allPosts.slice(0, 4)} />
        <TalkToUs />
      </main>
      <Footer />
    </>
  );
}
