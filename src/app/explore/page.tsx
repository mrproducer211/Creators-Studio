import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExploreClient from "@/components/explore/ExploreClient";
import { getDbProperties } from "@/lib/db/dbLoader";

export const metadata = {
  title: "Bangkok Properties & Condos for Rent & Sale | Search NHP Bangkok",
  description: "Explore premium properties for rent and sale in Bangkok. Filter by area, rental price, bedroom count, and property type to find your perfect home.",
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
