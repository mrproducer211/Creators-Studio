import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchExplorer from "@/components/explore/MatchExplorer";
import { getDbProperties } from "@/lib/db/dbLoader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "NHP Match — Bangkok Neighborhood Lifestyle Finder",
  description: "Find your ideal Bangkok neighborhood and condos with AI and commute mapping.",
};

export default async function MatchPage() {
  const properties = await getDbProperties();

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: "#F7F3EC" }}>
        <Suspense fallback={null}>
          <MatchExplorer properties={properties} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
