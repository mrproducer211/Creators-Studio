export const STANDARD_AREAS = [
  "Sukhumvit",
  "Sathorn",
  "Thong Lo",
  "Asok",
  "Ekkamai",
  "Silom",
  "On Nut",
  "Ari",
  "Rama 9",
  "Bang Na",
  "Huai Khwang",
  "Phaya Thai",
  "Chatuchak",
  "Rama 4",
  "Chit Lom / Ploenchit",
  "Nana",
  "Phra Khanong",
  "Ladprao",
  "Thonburi",
  "Charoenkrung",
  "Sam Yan",
  "Khlong San"
];

const AREA_MAPPING: Record<string, string> = {
  // Bang Na mappings
  "bangna": "Bang Na",
  "bang na": "Bang Na",
  "udom suk": "Bang Na",
  "udomsuk": "Bang Na",
  
  // Sukhumvit mappings
  "sukhumvit": "Sukhumvit",
  "phrom phong": "Sukhumvit",
  "phromphong": "Sukhumvit",
  
  // Thong Lo mappings
  "thong lo": "Thong Lo",
  "thonglo": "Thong Lo",
  
  // Asok mappings
  "asok": "Asok",
  "asoke": "Asok",
  
  // Ekkamai mappings
  "ekkamai": "Ekkamai",
  "ekamai": "Ekkamai",
  
  // On Nut mappings
  "on nut": "On Nut",
  "onnut": "On Nut",
  
  // Ari mappings
  "ari": "Ari",
  
  // Sathorn mappings
  "sathorn": "Sathorn",
  "sathon": "Sathorn",
  
  // Silom mappings
  "silom": "Silom",
  
  // Rama 9 mappings
  "rama 9": "Rama 9",
  "rama9": "Rama 9",
  "ratchada": "Rama 9",
  
  // Huai Khwang mappings
  "huai khwang": "Huai Khwang",
  "huaikhwang": "Huai Khwang",
  
  // Phaya Thai mappings
  "phaya thai": "Phaya Thai",
  "phayathai": "Phaya Thai",

  // Chatuchak mappings
  "chatuchak": "Chatuchak",
  "jatujak": "Chatuchak",

  // Rama 4 mappings
  "rama 4": "Rama 4",
  "rama4": "Rama 4",

  // Sam Yan mappings
  "samyan": "Sam Yan",
  "sam yan": "Sam Yan",
  "chula": "Sam Yan",

  // Chit Lom / Ploenchit mappings
  "chidlom": "Chit Lom / Ploenchit",
  "chit lom": "Chit Lom / Ploenchit",
  "ploenchit": "Chit Lom / Ploenchit",
  "plonchit": "Chit Lom / Ploenchit",
  "wireless road": "Chit Lom / Ploenchit",
  "wireless rd": "Chit Lom / Ploenchit",

  // Nana mappings
  "nana": "Nana",

  // Phra Khanong mappings
  "phra khanong": "Phra Khanong",
  "phrakhanong": "Phra Khanong",

  // Ladprao mappings
  "ladprao": "Ladprao",
  "lat phrao": "Ladprao",
  "latphrao": "Ladprao",

  // Thonburi mappings
  "thonburi": "Thonburi",
  "thon buri": "Thonburi",

  // Charoenkrung mappings
  "charoenkrung": "Charoenkrung",
  "charoen krung": "Charoenkrung",
  "bangrak": "Charoenkrung",
  "bang rak": "Charoenkrung",

  // Khlong San mappings
  "khlong san": "Khlong San",
  "khlongsan": "Khlong San",
  "iconsiam": "Khlong San",
};

/**
 * Normalizes a raw area string to its standard canonical neighborhood name, if matched.
 */
export function getCanonicalArea(rawArea: string): string {
  if (!rawArea) return "Sukhumvit";
  
  const clean = rawArea.trim().toLowerCase();
  
  // Direct match
  if (AREA_MAPPING[clean]) {
    return AREA_MAPPING[clean];
  }
  
  // Substring match (check longer mapping keys first)
  const sortedKeys = Object.keys(AREA_MAPPING).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (clean.includes(key)) {
      return AREA_MAPPING[key];
    }
  }
  
  // Default: Title-case format the unrecognized area name
  return rawArea
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
