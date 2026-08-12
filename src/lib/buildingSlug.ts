export function cleanBuildingName(name?: string): string {
  if (!name) return "";
  let clean = name.trim();
  clean = clean
    .replace(/(?:\s|-)*TG-\d+.*$/i, "")
    .replace(/(?:\s|-)*#[A-Za-z0-9_-]+$/i, "");

  const descriptorRegex = /\s+(?:\d+(?:\.\d+)?\s*-?\s*(?:Bed|Bdr|Bedroom|Br|BA|Bath|Bathroom)|Studio|Penthouse|Duplex|Spacious|High-Rise|Low-Rise|High\s+Rise|Low\s+Rise|Luxury|Modern|Premium|Pet-Friendly|Pet\s+Friendly|Condo(?:\s+for|\s+near|\s+with)?|Apartment(?:\s+for)?|For\s+Rent|For\s+Sale|Short\s+Stay).*$/i;

  const stripped = clean.replace(descriptorRegex, "").trim();
  return stripped.length >= 3 ? stripped : clean;
}

export function slugifyBuildingName(name?: string): string {
  if (!name) return "";
  const clean = cleanBuildingName(name);
  return clean
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-");
}

export function getBuildingSlug(name?: string): string {
  if (!name) return "";
  return slugifyBuildingName(name);
}
