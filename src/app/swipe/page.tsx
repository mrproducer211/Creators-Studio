import SwipeClient from "@/components/swipe/SwipeClient";
import { getDbProperties } from "@/lib/db/dbLoader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Swipe Mode — NHP Bangkok",
  description: "Discover Bangkok condos and apartments with interactive swipe matching. Swipe right to save your favorite properties and connect directly with local agents.",
  alternates: {
    canonical: "/swipe",
  },
};

export default async function SwipePage() {
  const properties = await getDbProperties();
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#1C3A2F" }}>
      <SwipeClient properties={properties} />
    </div>
  );
}
