import ReelsClient from "@/components/reels/ReelsClient";
import { getDbProperties } from "@/lib/db/dbLoader";

export const metadata = {
  title: "Property Reels — NHP Bangkok",
  description: "Watch short property tour videos. Scroll through Bangkok condos, houses and villas.",
};

export default async function ReelsPage() {
  const properties = await getDbProperties();
  return (
    <div className="fixed inset-0 overflow-hidden">
      <ReelsClient properties={properties} />
    </div>
  );
}
