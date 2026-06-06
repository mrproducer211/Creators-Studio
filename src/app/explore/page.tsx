import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExploreClient from "@/components/explore/ExploreClient";
import { getDbProperties } from "@/lib/db/dbLoader";

export const metadata = {
  title: "Explore Properties — NHP Bangkok",
  description: "Browse all Bangkok properties. Filter by sale, rent, short stay, area, type and more.",
};

export default async function ExplorePage() {
  const properties = await getDbProperties();

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: "#F7F3EC", paddingTop: "56px" }}>
        {/* Full-width client section */}
        <Suspense fallback={null}>
          <ExploreClient properties={properties} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
