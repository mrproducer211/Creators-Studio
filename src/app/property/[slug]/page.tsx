import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyDetail from "@/components/property/PropertyDetail";
import { getDbProperties } from "@/lib/db/dbLoader";
import { PropertyCard } from "@/types/property";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = await getDbProperties();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const all = await getDbProperties();
  const p = all.find((x) => x.slug === slug);
  if (!p) return { title: "Property Not Found — NHP" };
  return {
    title: `${p.name} — NHP Bangkok`,
    description: p.description.slice(0, 160),
  };
}

/* ─────────────────────────────────────────────
   Adjacency map — for "nearby area" fallback
───────────────────────────────────────────── */
const NEARBY_AREAS: Record<string, string[]> = {
  "Sukhumvit": ["Asok", "Thong Lo", "Ekkamai", "On Nut"],
  "Sathorn":   ["Silom"],
  "Silom":     ["Sathorn"],
  "Thong Lo":  ["Ekkamai", "Sukhumvit", "On Nut"],
  "On Nut":    ["Ekkamai", "Sukhumvit", "Thong Lo"],
  "Ekkamai":   ["Thong Lo", "On Nut", "Sukhumvit"],
  "Asok":      ["Sukhumvit"],
  "Ari":       [],
};

/* Extract a building "hint" — text before any em-dash or comma */
function buildingHint(name: string): string {
  return name.split(/[—–-]/)[0].trim().toLowerCase();
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const all          = await getDbProperties();
  const property = all.find((p) => p.slug === slug);
  if (!property) notFound();

  const bHint = buildingHint(property.name);

  // 1. Same building properties (excluding current)
  const sameBuilding = all
    .filter((p) => p.id !== property.id && buildingHint(p.name) === bHint)
    .slice(0, 4);

  // 2. Nearby properties (excluding current and same building, matching area or adjacent areas)
  const nearbyAreas = NEARBY_AREAS[property.area] ?? [];
  const nearby = all
    .filter((p) => 
      p.id !== property.id && 
      buildingHint(p.name) !== bHint && 
      (p.area === property.area || nearbyAreas.includes(p.area))
    )
    .slice(0, 4);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "56px", background: "#F7F3EC", minHeight: "100vh" }}>
        <PropertyDetail
          property={property}
          sameBuilding={sameBuilding}
          nearby={nearby}
        />
      </main>
      <Footer />
    </>
  );
}
