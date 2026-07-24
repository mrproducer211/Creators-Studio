import { PropertyCard } from "@/types/property";

/**
 * Generates clean, keyword-rich SEO URL slugs for properties.
 * Example: "1-bed-condo-rent-via-61-by-sansiri"
 */
export function generateCleanSeoSlug(
  p: {
    bedrooms: number;
    propertyType?: string;
    listingType?: string;
    name: string;
    id?: number | string;
  },
  existingSlugs?: Set<string> | string[]
): string {
  const roomStr = p.bedrooms === 0 ? "studio" : `${p.bedrooms}-bed`;
  const typeStr = (p.propertyType || "condo").toLowerCase().replace(/[^a-z0-9]/g, "");
  const actionStr = p.listingType === "sale" ? "sale" : p.listingType === "short_stay" ? "short-stay" : "rent";

  // Clean building name
  const nameSlug = (p.name || "")
    .toLowerCase()
    .replace(/#[a-zA-Z0-9_-]+/g, "") // remove hashtags
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim hyphens

  const baseSlug = `${roomStr}-${typeStr}-${actionStr}-${nameSlug}`;
  let finalSlug = baseSlug;

  if (existingSlugs) {
    const slugSet = existingSlugs instanceof Set ? existingSlugs : new Set(existingSlugs);
    let counter = 2;
    while (slugSet.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return finalSlug;
}

/**
 * Generates rich, SEO-optimized image alt text for property images across the site.
 */
export function generatePropertyAltTag(
  p: Partial<PropertyCard> & { name: string; area: string },
  index?: number,
  context?: string
): string {
  const bedsStr = p.bedrooms === 0 ? "Studio" : `${p.bedrooms || 1} Bed`;
  const typeStr = p.propertyType ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1) : "Condo";
  const actionStr = p.listingType === "sale" ? "Sale" : "Rent";
  const areaStr = p.area || "Bangkok";
  const nameStr = p.name || "Bangkok Property";

  let alt = `${bedsStr} ${typeStr} for ${actionStr} in ${areaStr} Bangkok - ${nameStr}`;

  if (context) {
    alt += ` (${context})`;
  } else if (typeof index === "number" && index > 0) {
    alt += ` - Photo ${index + 1}`;
  }

  return alt;
}

/**
 * Generates descriptive SEO alt text for neighborhood hero banners and cards.
 */
export function generateNeighborhoodAltTag(name: string, context?: string): string {
  const ctxStr = context ? ` ${context}` : "";
  return `${name} Bangkok Expat Neighborhood Guide${ctxStr} - Condos for Rent & Sale near BTS Transit`;
}

/**
 * Clean Telegram hashtags, raw emojis, and unwanted formatting artifacts.
 */
function cleanRawText(text: string): string {
  if (!text) return "";
  return text
    .replace(/#[a-zA-Z0-9_-]+/g, "") // remove hashtags like #corner, #rent
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // strip emojis
    .trim();
}

/**
 * Filters out section headers (e.g. "Features:"), long text, and marketing paragraphs
 * from amenities/features arrays.
 */
export function sanitizePropertyItems(items?: string[], maxLen = 80): string[] {
  if (!items || !Array.isArray(items)) return [];
  return items.filter((item) => {
    if (!item || typeof item !== "string") return false;
    const trimmed = item.trim();
    if (!trimmed) return false;
    if (/^(features|amenities|facilities|highlights|details|overview):?$/i.test(trimmed)) return false;
    if (trimmed.length > maxLen) return false;
    if (/^(looking for|discover|spacious|featured|welcome|offered at)/i.test(trimmed)) return false;
    return true;
  });
}

export interface EnrichedSections {
  overview: string;
  interior: string;
  location: string;
  facilities: string;
  lease: string;
  additional?: string;
}

/**
 * Returns clean structured sections for rendering in PropertyDetail component.
 */
export function getStructuredSeoDescription(p: {
  name: string;
  description?: string;
  bedrooms: number;
  bathrooms: number;
  sqm?: number;
  floor?: number;
  area: string;
  district?: string;
  listingType: string;
  propertyType: string;
  priceTHB: number | string;
  priceLabel?: string;
  btsStation?: string;
  btsWalkMin?: number;
  mrtStation?: string;
  mrtWalkMin?: number;
  petFriendly?: boolean;
  foreignQuota?: boolean;
  amenities?: string[];
}, lang: "en" | "th" | "zh" = "en"): EnrichedSections {
  const cleanedName = cleanRawText(p.name || "Bangkok Residence");
  const cleanedArea = cleanRawText(p.area || "Sukhumvit");
  const cleanedDistrict = p.district ? cleanRawText(p.district) : "";
  const rawDesc = p.description ? cleanRawText(p.description) : "";

  // English fallback
  if (lang === "en") {
    const roomTypeStr = p.bedrooms === 0 ? "Studio" : `${p.bedrooms} Bedroom`;
    const propTypeCap = p.propertyType ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1) : "Condo";
    const actionText = p.listingType === "sale" ? "Sale" : p.listingType === "short_stay" ? "Short-Term Rent" : "Rent";
    const priceVal = Number(p.priceTHB || 0);
    const priceFormatted = priceVal > 0 ? `฿${priceVal.toLocaleString()}` : "Contact for Price";
    const labelText = p.priceLabel || (p.listingType === "sale" ? "" : "/month");

    let transitStr = "";
    if (p.btsStation) {
      transitStr = `just a ${p.btsWalkMin || 5}-minute walk from BTS ${cleanRawText(p.btsStation)} Station`;
    } else if (p.mrtStation) {
      transitStr = `${p.mrtWalkMin || 5} minutes from MRT ${cleanRawText(p.mrtStation)} Station`;
    } else {
      transitStr = `in prime ${cleanedArea}, with fast access to BTS Skytrain lines`;
    }

    const overview = `Discover high-rise luxury living with this spacious ${roomTypeStr} ${propTypeCap} for ${actionText} at ${cleanedName} in ${cleanedArea}, Bangkok. Featuring ${p.sqm || 35} sqm of premium living space, this unit offers contemporary finishes and skyline views. Offered at ${priceFormatted}${labelText}, this property is ${transitStr}.`;

    const interior = `The residence features ${p.bedrooms === 0 ? "an open-plan studio layout" : `${p.bedrooms} spacious bedroom(s)`} and ${p.bathrooms || 1} bathroom(s). Outfitted with luxury furnishings, climate-control air conditioning, smart TV, European kitchen, and an in-unit washing machine. High-speed fiber internet infrastructure is pre-installed for digital nomads and remote workers.`;

    const petText = p.petFriendly
      ? "This development is pet-friendly, welcoming dogs and cats under building regulations."
      : "Building rules maintain a peaceful, high-privacy residential environment.";
    const location = `Situated in ${cleanedArea}${cleanedDistrict ? `, ${cleanedDistrict}` : ""}, residents enjoy walking-distance access to specialty cafes, international restaurants, lifestyle shopping malls, and leading international schools. ${petText}`;

    const defaultAmenities = ["Infinity Pool", "Fitness Gym", "24/7 Security", "Smart Keycard Access", "Covered Parking"];
    const cleanAmenities = sanitizePropertyItems(p.amenities);
    const amenityListStr = (cleanAmenities.length > 0 ? cleanAmenities : defaultAmenities).join(", ");
    const ownershipText = p.foreignQuota
      ? "Available under Foreign Freehold Quota for 100% foreign ownership."
      : "Ideal for expats, executives, and digital nomads residing in Bangkok.";
    const facilities = `Residents enjoy full access to world-class facilities, including: ${amenityListStr}. Round-the-clock safety is guaranteed with 24-hour security guards, CCTV surveillance, and secure keycard entry. ${ownershipText}`;

    const lease = p.listingType === "short_stay"
      ? `Flexible lease options available for 3-month to 6-month short stays. Move-in requires valid passport identification and a 1-month refundable deposit.`
      : p.listingType === "sale"
      ? `Available for direct purchase with clean chanote title deed. Full assistance provided for ownership transfer at the Department of Lands.`
      : `Offered under standard 12-month lease agreements with a 2-month security deposit. Contact our team to schedule an in-person or video tour.`;

    let cleanAdditional = rawDesc;
    if (cleanAdditional) {
      cleanAdditional = cleanAdditional
        .split("\n")
        .filter(line => {
          const l = line.trim();
          if (!l) return false;
          if (/^(features|amenities|facilities|highlights):?$/i.test(l)) return false;
          if (l.startsWith("•") || l.startsWith("-")) return false;
          return true;
        })
        .join("\n")
        .trim();
    }

    return {
      overview,
      interior,
      location,
      facilities,
      lease,
      additional: cleanAdditional && cleanAdditional.length > 30 && !cleanAdditional.toLowerCase().includes("discover high-rise") ? cleanAdditional : undefined,
    };
  }

  // Thai Translation
  if (lang === "th") {
    const roomTypeStr = p.bedrooms === 0 ? "ห้องสตูดิโอ" : `${p.bedrooms} ห้องนอน`;
    const propTypeCap = p.propertyType ? (p.propertyType.toLowerCase() === "condo" ? "คอนโด" : p.propertyType) : "คอนโด";
    const actionText = p.listingType === "sale" ? "ขาย" : p.listingType === "short_stay" ? "เช่าระยะสั้น" : "เช่า";
    const priceVal = Number(p.priceTHB || 0);
    const priceFormatted = priceVal > 0 ? `฿${priceVal.toLocaleString()}` : "สอบถามราคา";
    const labelText = p.priceLabel || (p.listingType === "sale" ? "" : "/เดือน");

    let transitStr = "";
    if (p.btsStation) {
      transitStr = `เดินเพียง ${p.btsWalkMin || 5} นาที จากสถานี BTS ${cleanRawText(p.btsStation)}`;
    } else if (p.mrtStation) {
      transitStr = `เพียง ${p.mrtWalkMin || 5} นาที จากสถานี MRT ${cleanRawText(p.mrtStation)}`;
    } else {
      transitStr = `ตั้งอยู่ในย่านทำเลทอง ${cleanedArea} เดินทางสะดวกเชื่อมต่อรถไฟฟ้า`;
    }

    const overview = `สัมผัสการอยู่อาศัยระดับพรีเมียมกับ${propTypeCap} ${roomTypeStr} สำหรับ${actionText} โครงการ ${cleanedName} ในย่าน ${cleanedArea} กรุงเทพฯ พื้นที่ใช้สอยกว้างขวาง ${p.sqm || 35} ตร.ม. ตกแต่งสวยงามพร้อมวิวเมืองที่งดงาม เสนอราคาที่ ${priceFormatted}${labelText} ทำเลดี${transitStr}`;

    const interior = `ยูนิตนี้ประกอบด้วย ${p.bedrooms === 0 ? "พื้นที่สตูดิโอผังเปิดกว้างขวาง" : `${p.bedrooms} ห้องนอนกว้างขวาง`} และ ${p.bathrooms || 1} ห้องน้ำ พร้อมเฟอร์นิเจอร์ เครื่องปรับอากาศ สมาร์ททีวี ครัวทันสมัย และเครื่องซักผ้า พร้อมอินเทอร์เน็ตไฟเบอร์ความเร็วสูง`;

    const petText = p.petFriendly
      ? "โครงการนี้อนุญาตให้เลี้ยงสัตว์ตามกฎระเบียบของอาคาร"
      : "อาคารมีกฎระเบียบรักษาความสงบและความเป็นส่วนตัวสูง";
    const location = `ตั้งอยู่ในย่าน ${cleanedArea}${cleanedDistrict ? ` (${cleanedDistrict})` : ""} ใกล้คาเฟ่ ร้านอาหารนานาชาติ ห้างสรรพสินค้าชั้นนำ และโรงเรียนนานาชาติ ${petText}`;

    const defaultAmenities = ["สระว่ายน้ำอินฟินิตี้", "ห้องฟิตเนส", "ระบบรักษาความปลอดภัย 24 ชม.", "คีย์การ์ดเข้า-ออก", "ที่จอดรถ"];
    const amenityListStr = (p.amenities && p.amenities.length > 0 ? p.amenities : defaultAmenities).join(", ");
    const ownershipText = p.foreignQuota
      ? "ยูนิตนี้มีโควต้าต่างชาติ (Foreign Quota) ถือครองกรรมสิทธิ์ได้ 100%"
      : "เหมาะสำหรับชาวต่างชาติ ผู้บริหาร และผู้ทำงานรีโมทในกรุงเทพฯ";
    const facilities = `ผู้พักอาศัยสามารถใช้สิ่งอำนวยความสะดวกครบครัน อาทิ: ${amenityListStr} พร้อมระบบรักษาความปลอดภัย 24 ชั่วโมง กล้อง CCTV และระบบคีย์การ์ด ${ownershipText}`;

    const lease = p.listingType === "short_stay"
      ? `สัญญายืดหยุ่นสำหรับเช่าระยะสั้น 3 ถึง 6 เดือน เข้าอยู่ด้วยหนังสือเดินทางและมัดจำ 1 เดือน`
      : p.listingType === "sale"
      ? `พร้อมโอนกรรมสิทธิ์ เอกสารโฉนดพร้อม บริการดูแลการโอน ณ กรมที่ดิน`
      : `สัญญาเช่ามาตรฐาน 12 เดือน มัดจำ 2 เดือนและประกันล่วงหน้า ติดต่อเพื่อนัดชมยูนิตจริงหรือวิดีโอคอล`;

    return {
      overview,
      interior,
      location,
      facilities,
      lease,
      additional: rawDesc && rawDesc.length > 30 && !rawDesc.toLowerCase().includes("discover high-rise")
        ? translateRawDescription(rawDesc, "th")
        : undefined,
    };
  }

  // Chinese Translation
  const roomTypeStr = p.bedrooms === 0 ? "开放式单间 (Studio)" : `${p.bedrooms} 居室`;
  const propTypeCap = p.propertyType ? (p.propertyType.toLowerCase() === "condo" ? "公寓" : p.propertyType) : "公寓";
  const actionText = p.listingType === "sale" ? "出售" : p.listingType === "short_stay" ? "短租" : "出租";
  const priceVal = Number(p.priceTHB || 0);
  const priceFormatted = priceVal > 0 ? `฿${priceVal.toLocaleString()}` : "价格面议";
  const labelText = p.priceLabel || (p.listingType === "sale" ? "" : "/月");

  let transitStr = "";
  if (p.btsStation) {
    transitStr = `距离 BTS ${cleanRawText(p.btsStation)} 站步行仅需 ${p.btsWalkMin || 5} 分钟`;
  } else if (p.mrtStation) {
    transitStr = `距离 MRT ${cleanRawText(p.mrtStation)} 站仅 ${p.mrtWalkMin || 5} 分钟`;
  } else {
    transitStr = `位于 ${cleanedArea} 核心区域，快速连接曼谷轨道交通`;
  }

  const overview = `探索尊享曼谷高空奢华公寓，该 ${roomTypeStr} ${propTypeCap} 位于曼谷 ${cleanedArea} 的 ${cleanedName}，面向${actionText}。拥有 ${p.sqm || 35} 平方米精装空间，采光极佳并尊享城市天际线景观。挂牌价格为 ${priceFormatted}${labelText}，${transitStr}。`;

  const interior = `户型结构为 ${p.bedrooms === 0 ? "开放式单间 (Studio)" : `${p.bedrooms} 间舒适卧室`} 及 ${p.bathrooms || 1} 间独立卫浴。配置豪华家具、全室空调、智能电视、欧式 kitchen 及全自动洗衣机。预装高速光纤网络，非常适合远程办公人士。`;

  const petText = p.petFriendly
    ? "该项目允许携带宠物，欢迎符合大楼规定的猫狗入住。"
    : "大楼管理严格，保持安静舒适的高私密住区环境。";
  const location = `坐落于曼谷 ${cleanedArea}${cleanedDistrict ? ` (${cleanedDistrict})` : ""} 核心地段，步行即可到达精致咖啡馆、国际餐厅、大型购物中心及知名国际学校。${petText}`;

  const defaultAmenities = ["无边际泳池", "全功能健身房", "24小时安保监控", "智能门禁系统", "专属停车场"];
  const amenityListStr = (p.amenities && p.amenities.length > 0 ? p.amenities : defaultAmenities).join("、");
  const ownershipText = p.foreignQuota
    ? "拥有外籍配额 (Foreign Quota)，外国买家可合法实名永久过户。"
    : "非常适合外籍高管、商务人士及在曼谷常住居住者。";
  const facilities = `住户享有全套奢华配套设施，包括：${amenityListStr}。配备 24 小时专业安保、CCTV 监控系统及智能门禁。${ownershipText}`;

  const lease = p.listingType === "short_stay"
    ? `支持 3 个月至 6 个月的灵活短租，凭有效护照及 1 个月押金即可轻松入住。`
    : p.listingType === "sale"
    ? `产权清晰，拥有独立地契。我们提供土地局全程实名过户协助。`
    : `标准 12 个月租约，押二付一。欢迎联系我们的团队预约实地或视频看房。`;

  return {
    overview,
    interior,
    location,
    facilities,
    lease,
    additional: rawDesc && rawDesc.length > 30 && !rawDesc.toLowerCase().includes("discover high-rise")
      ? translateRawDescription(rawDesc, "zh")
      : undefined,
  };
}

function translateRawDescription(text: string, lang: "th" | "zh"): string {
  if (!text) return "";
  let result = text;
  
  if (lang === "th") {
    result = result
      .replace(/fully furnished/gi, "ตกแต่งครบครันพร้อมเข้าอยู่")
      .replace(/high floor/gi, "ชั้นสูง วิวสวย")
      .replace(/low floor/gi, "ชั้นไม่สูง สงบเงียบ")
      .replace(/corner unit/gi, "ห้องมุม ความเป็นส่วนตัวสูง")
      .replace(/unblocked view/gi, "วิวโปร่งไม่บล็อก")
      .replace(/city view/gi, "วิวเมืองสวยงาม")
      .replace(/river view/gi, "วิวแม่น้ำเจ้าพระยา")
      .replace(/garden view/gi, "วิวสวนส่วนกลาง")
      .replace(/pool view/gi, "วิวสระว่ายน้ำ")
      .replace(/close to bts/gi, "ใกล้รถไฟฟ้า BTS")
      .replace(/close to mrt/gi, "ใกล้รถไฟฟ้า MRT")
      .replace(/pet friendly/gi, "อนุญาตให้เลี้ยงสัตว์")
      .replace(/ready to move in/gi, "พร้อมเข้าอยู่ได้ทันที")
      .replace(/brand new/gi, "ห้องใหม่มือหนึ่ง")
      .replace(/renovated/gi, "รีโนเวทใหม่สวยงาม");
  } else if (lang === "zh") {
    result = result
      .replace(/fully furnished/gi, "全套精装修拎包入住")
      .replace(/high floor/gi, "高楼层采光视野极佳")
      .replace(/low floor/gi, "低楼层环境宁静")
      .replace(/corner unit/gi, "边套户型私密性高")
      .replace(/unblocked view/gi, "视野开阔无遮挡")
      .replace(/city view/gi, "壮丽城市天际线景观")
      .replace(/river view/gi, "湄南河一线河景")
      .replace(/garden view/gi, "园林景观")
      .replace(/pool view/gi, "泳池景观")
      .replace(/close to bts/gi, "紧邻 BTS 轻轨站")
      .replace(/close to mrt/gi, "紧邻 MRT 地铁站")
      .replace(/pet friendly/gi, "宠物友好住区")
      .replace(/ready to move in/gi, "即刻入住")
      .replace(/brand new/gi, "全新未入住")
      .replace(/renovated/gi, "全新精致翻新");
  }

  return result;
}

/**
 * Returns plain text representation for crawlers and API endpoints.
 */
export function enrichPropertyDescription(p: any): string {
  const s = getStructuredSeoDescription(p);
  return [
    `Unit Overview & Highlights:\n${s.overview}`,
    `Interior Specs & Furnishings:\n${s.interior}`,
    `Location & Transit:\n${s.location}`,
    `Building Facilities:\n${s.facilities}`,
    `Lease Terms:\n${s.lease}`,
    ...(s.additional ? [`Additional Details:\n${s.additional}`] : []),
  ].join("\n\n");
}

/**
 * Returns a localized plain text overview string for property cards and summaries based on active language.
 */
export function getLocalizedPropertySummary(p: any, lang: "en" | "th" | "zh" = "en"): string {
  if (!p) return "";
  const s = getStructuredSeoDescription(p, lang);

  if (lang === "th") {
    return `ภาพรวมและจุดเด่น: ${s.overview}`;
  }
  if (lang === "zh") {
    return `概览与亮点：${s.overview}`;
  }
  return `Unit Overview & Highlights: ${s.overview}`;
}
