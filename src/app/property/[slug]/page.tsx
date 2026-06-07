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

/* Smart suggestion logic:
   1. Same building (matching name hint)
   2. Same area
   3. Nearby areas
   Returns up to 4 unique suggestions.
*/
function getSuggestions(current: PropertyCard, all: PropertyCard[]): PropertyCard[] {
  const seen = new Set<number>([current.id]);
  const out: PropertyCard[] = [];

  // 1. Same building
  const hint = buildingHint(current.name);
  for (const p of all) {
    if (out.length === 4) break;
    if (seen.has(p.id)) continue;
    if (buildingHint(p.name) === hint) { out.push(p); seen.add(p.id); }
  }

  // 2. Same area
  for (const p of all) {
    if (out.length === 4) break;
    if (seen.has(p.id)) continue;
    if (p.area === current.area) { out.push(p); seen.add(p.id); }
  }

  // 3. Nearby areas
  const nearby = NEARBY_AREAS[current.area] ?? [];
  for (const p of all) {
    if (out.length === 4) break;
    if (seen.has(p.id)) continue;
    if (nearby.includes(p.area)) { out.push(p); seen.add(p.id); }
  }

  return out;
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const all          = await getDbProperties();
  const property = all.find((p) => p.slug === slug);
  if (!property) notFound();

  const similar      = getSuggestions(property, all);
  const sameBuilding = similar.filter((p) => buildingHint(p.name) === buildingHint(property.name));
  const nearby       = similar.filter((p) => buildingHint(p.name) !== buildingHint(property.name));

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
