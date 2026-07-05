import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartSearchClient from "@/components/explore/SmartSearchClient";
import { getDbProperties } from "@/lib/db/dbLoader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Smart Search — NHP Bangkok",
  description: "Search properties in Bangkok using natural language.",
  alternates: {
    canonical: "/explore/smart",
  },
};

export default async function SmartSearchPage() {
  const properties = await getDbProperties();

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: "#F7F3EC", paddingTop: "56px" }}>
        <Suspense fallback={null}>
          <SmartSearchClient properties={properties} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
