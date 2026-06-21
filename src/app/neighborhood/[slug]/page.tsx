import { notFound } from "next/navigation";
import { getDbProperties } from "@/lib/db/dbLoader";
import { NEIGHBORHOODS } from "@/data/neighborhoods";
import { NEIGHBORHOOD_GUIDES } from "@/data/neighborhoodGuides";
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
    title: `${n.name} Condos & Rentals | Properties for Rent in ${n.name} Bangkok — NHP`,
    description: `Find the best properties for rent and sale in ${n.name}, Bangkok. Read our detailed expat neighborhood guide covering schools, BTS stations, cafes, and cost of living.`,
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
  const guide = NEIGHBORHOOD_GUIDES[slug.toLowerCase()];
  
  const faqSchema = guide && guide.faqs && guide.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": guide.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Navbar />
      <main className="min-h-screen" style={{ background: "#FAF8F3", paddingTop: "56px" }}>
        <NeighborhoodClient neighborhood={neighborhood} initialProperties={allProperties} />
      </main>
      <Footer />
    </>
  );
}
