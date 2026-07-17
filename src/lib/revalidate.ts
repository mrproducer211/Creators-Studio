import { revalidatePath } from "next/cache";

/**
 * Revalidates Next.js static pages for a property whenever it is created, updated, or deleted.
 */
export function revalidateProperty(slug?: string, area?: string) {
  try {
    // 1. Purge the individual property detail page
    if (slug) {
      revalidatePath(`/property/${slug}`);
    }

    // 2. Purge the explore page where property lists are shown
    revalidatePath("/explore");

    // 3. Purge the homepage (category counts, latest properties, etc.)
    revalidatePath("/");

    // 4. Purge the specific neighborhood guide page
    if (area) {
      const cleanArea = area.toLowerCase().trim();
      let areaSlug = cleanArea.replace(/\s+/g, "-");
      
      // Handle edge cases/aliases if needed (e.g. Chit Lom / Ploenchit -> chidlom-ploenchit)
      if (cleanArea === "chit lom / ploenchit" || cleanArea.includes("chidlom") || cleanArea.includes("ploenchit")) {
        areaSlug = "chidlom-ploenchit";
      }
      
      revalidatePath(`/neighborhood/${areaSlug}`);
    }
  } catch (err) {
    console.error("On-demand revalidation failed:", err);
  }
}
