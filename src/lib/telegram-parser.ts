export interface ParsedRequirement {
  budget: number | null;
  bedrooms: number | null;
  sqm: number | null;
  brand: string | null;
  area: string | null;
  petFriendly: boolean;
}

const BRANDS = [
  "supalai", "noble", "ashton", "rhythm", "life", "ideo", "one x", "the line", 
  "xt", "marque", "beatniq", "saladaeng", "park origin", "siri", "ceil", "edge", 
  "chapter", "quintara", "whizdom", "celes", "elio"
];

const AREA_MAPPINGS: Record<string, string[]> = {
  "Sukhumvit": ["sukhumvit", "สุขุมวิท"],
  "Sathorn": ["sathorn", "satorn", "สาทร"],
  "Thong Lo": ["thong lo", "thonglo", "ทองหล่อ"],
  "Asok": ["asok", "asoke", "อโศก"],
  "Ekkamai": ["ekkamai", "ekamai", "เอกมัย"],
  "Silom": ["silom", "สีลม"],
  "On Nut": ["on nut", "onnut", "อ่อนนุช"],
  "Ari": ["ari", "อารีย์"],
  "Rama 9": ["rama 9", "rama9", "พระราม 9", "พระราม9"],
  "Bang Na": ["bang na", "bangna", "บางนา"],
  "Huai Khwang": ["huai khwang", "huaikhwang", "ห้วยขวาง"],
  "Phaya Thai": ["phaya thai", "phayathai", "พญาไท"],
  "Chatuchak": ["chatuchak", "จตุจักร"],
  "Rama 4": ["rama 4", "rama4", "พระราม 4", "พระราม4"],
  "Charoenkrung": ["charoenkrung", "charoen krung", "เจริญกรุง"],
  "Sam Yan": ["sam yan", "samyan", "สามย่าน"],
  "Khlong San": ["khlong san", "khlongsan", "คลองสาน"],
  "Phra Khanong": ["phra khanong", "phrakhanong", "พระโขนง"]
};

export function parseAgentMessage(text: string): ParsedRequirement {
  const normalized = text.toLowerCase();

  // 1. Budget extraction
  let budget: number | null = null;
  // Match patterns like 90k, 90,000, 90000, 90 k, 45,500 thb, etc.
  const budgetMatches: Array<{ val: number; index: number }> = [];
  
  // Custom manual regex parsing
  const matches = [...normalized.matchAll(/(?:price|budget|rent|sale|฿|baht)?\s*[:\-]?\s*(\d+[\d,.]*)\s*(k|thousand|thb|baht|฿)?/gi)];
  for (const m of matches) {
    const rawNum = m[1].replace(/,/g, "");
    let val = parseFloat(rawNum);
    if (isNaN(val)) continue;

    const suffix = m[2] ? m[2].trim() : "";
    if (suffix === "k") {
      val *= 1000;
    } else if (val < 1000 && normalized.includes(rawNum + "k")) {
      val *= 1000;
    }
    
    if (val >= 5000) {
      budgetMatches.push({ val, index: m.index || 0 });
    }
  }

  if (budgetMatches.length > 0) {
    budget = budgetMatches[0].val;
  }

  // 2. Bedroom extraction
  let bedrooms: number | null = null;
  if (normalized.includes("studio") || normalized.includes("ห้องสตูดิโอ")) {
    bedrooms = 0;
  } else {
    const bedRegex = /(\d+)\s*(?:bed|br|bedroom|ห้องนอน|ห้อง)/i;
    const bedMatch = bedRegex.exec(normalized);
    if (bedMatch) {
      bedrooms = parseInt(bedMatch[1]);
    }
  }

  // 3. SQM size extraction
  let sqm: number | null = null;
  const sqmRegex = /(\d+)\s*(?:sqm|sq\.?m|square\s*meter|ตรม|ตารางเมตร)/i;
  const sqmMatch = sqmRegex.exec(normalized);
  if (sqmMatch) {
    sqm = parseInt(sqmMatch[1]);
  }

  // 4. Developer / Property Brand extraction
  let brand: string | null = null;
  for (const b of BRANDS) {
    if (normalized.includes(b)) {
      brand = b;
      break;
    }
  }

  // 5. Area / Neighborhood mapping
  let area: string | null = null;
  for (const [key, aliases] of Object.entries(AREA_MAPPINGS)) {
    if (aliases.some(alias => normalized.includes(alias))) {
      area = key;
      break;
    }
  }

  // 6. Pet Friendliness flag
  let petFriendly = false;
  if (
    normalized.includes("pet") || 
    normalized.includes("เลี้ยงสัตว์") || 
    normalized.includes("สุนัข") || 
    normalized.includes("แมว")
  ) {
    petFriendly = true;
    // Check for negative prefixes e.g. "no pets", "no pet", "no dogs", "no cats", "ห้ามเลี้ยงสัตว์"
    const negationRegex = /(?:no|not|non|don't|never|ห้าม|ไม่)\s*(?:pet|dog|cat|animal|เลี้ยงสัตว์|สุนัข|แมว)/gi;
    if (negationRegex.test(normalized)) {
      petFriendly = false;
    }
  }

  return {
    budget,
    bedrooms,
    sqm,
    brand,
    area,
    petFriendly
  };
}
