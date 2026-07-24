import { readJson, writeJson } from "./fileStore";
import { slugifyBuildingName } from "../buildingSlug";

export { slugifyBuildingName };

export interface ReviewRecord {
  id: number;
  propertyId: number;
  projectSlug?: string;
  projectName?: string;
  userId?: string;
  authorName: string;
  authorEmail?: string;
  rating: number; // 1-5 overall
  ratingLocation?: number;    // 1-5
  ratingFacilities?: number;  // 1-5
  ratingManagement?: number;  // 1-5
  ratingValue?: number;       // 1-5
  title?: string;
  body?: string;
  status: "pending" | "published" | "rejected";
  createdAt: string;
  updatedAt: string;
}

const FILE = "reviews.json";

export async function getAllReviews(): Promise<ReviewRecord[]> {
  return await readJson<ReviewRecord[]>(FILE, []);
}

export async function getPublishedReviewsForProperty(propertyId: number, projectName?: string): Promise<ReviewRecord[]> {
  const all = await getAllReviews();
  const targetSlug = slugifyBuildingName(projectName);

  return all.filter((r) => {
    if (r.status !== "published") return false;

    // 1. Direct property match
    if (r.propertyId === propertyId) return true;

    // 2. Building project match (if building name exists)
    if (targetSlug) {
      const reviewProjectSlug = r.projectSlug || slugifyBuildingName(r.projectName);
      if (reviewProjectSlug && reviewProjectSlug === targetSlug) return true;
    }

    return false;
  });
}

export async function getAggregateRatingForProperty(propertyId: number, projectName?: string) {
  const published = await getPublishedReviewsForProperty(propertyId, projectName);
  const count = published.length;
  if (count === 0) {
    return {
      ratingValue: 0,
      reviewCount: 0,
      ratingLocation: 0,
      ratingFacilities: 0,
      ratingManagement: 0,
      ratingValueForMoney: 0,
    };
  }
  const sumOverall = published.reduce((acc, r) => acc + r.rating, 0);

  const locs = published.filter((r) => r.ratingLocation);
  const facs = published.filter((r) => r.ratingFacilities);
  const mngs = published.filter((r) => r.ratingManagement);
  const vals = published.filter((r) => r.ratingValue);

  const avgLoc = locs.length > 0 ? Number((locs.reduce((a, b) => a + (b.ratingLocation || 0), 0) / locs.length).toFixed(1)) : Number((sumOverall / count).toFixed(1));
  const avgFac = facs.length > 0 ? Number((facs.reduce((a, b) => a + (b.ratingFacilities || 0), 0) / facs.length).toFixed(1)) : Number((sumOverall / count).toFixed(1));
  const avgMng = mngs.length > 0 ? Number((mngs.reduce((a, b) => a + (b.ratingManagement || 0), 0) / mngs.length).toFixed(1)) : Number((sumOverall / count).toFixed(1));
  const avgVal = vals.length > 0 ? Number((vals.reduce((a, b) => a + (b.ratingValue || 0), 0) / vals.length).toFixed(1)) : Number((sumOverall / count).toFixed(1));

  return {
    ratingValue: Number((sumOverall / count).toFixed(1)),
    reviewCount: count,
    ratingLocation: avgLoc,
    ratingFacilities: avgFac,
    ratingManagement: avgMng,
    ratingValueForMoney: avgVal,
  };
}

export async function addReview(input: Omit<ReviewRecord, "id" | "status" | "createdAt" | "updatedAt">): Promise<ReviewRecord> {
  const all = await getAllReviews();
  const nextId = all.length > 0 ? Math.max(...all.map((r) => r.id)) + 1 : 1;
  const now = new Date().toISOString();

  const projectSlug = input.projectSlug || slugifyBuildingName(input.projectName);

  const newReview: ReviewRecord = {
    ...input,
    projectSlug,
    id: nextId,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await writeJson(FILE, [newReview, ...all]);
  return newReview;
}

export async function updateReviewStatus(id: number, status: "pending" | "published" | "rejected"): Promise<ReviewRecord | null> {
  const all = await getAllReviews();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const updated: ReviewRecord = {
    ...all[idx],
    status,
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...all];
  nextList[idx] = updated;
  await writeJson(FILE, nextList);
  return updated;
}

export async function deleteReview(id: number): Promise<boolean> {
  const all = await getAllReviews();
  const nextList = all.filter((r) => r.id !== id);
  if (nextList.length === all.length) return false;
  await writeJson(FILE, nextList);
  return true;
}
