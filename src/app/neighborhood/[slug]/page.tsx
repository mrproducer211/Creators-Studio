import { notFound } from "next/navigation";
import { getDbProperties } from "@/lib/db/dbLoader";
import { NEIGHBORHOODS } from "@/data/neighborhoods";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NeighborhoodClient from "@/components/explore/NeighborhoodClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const n = NEIGHBORHOODS.find((item) => item.slug.toLowerCase() === slug.toLowerCase());
  if (!n) return {};
  return {
    title: `${n.name} Neighborhood Guide — NHP Bangkok`,
    description: `${n.name} is ${n.description.substring(0, 150)}...`,
  };
}

export default async function NeighborhoodPage({ params }: Props) {
  const { slug } = await params;
  const neighborhood = NEIGHBORHOODS.find(
    (item) => item.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!neighborhood) {
    notFound();
  }

  const allProperties = await getDbProperties();

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: "#FAF8F3", paddingTop: "56px" }}>
        <NeighborhoodClient neighborhood={neighborhood} initialProperties={allProperties} />
      </main>
      <Footer />
    </>
  );
}
