"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useMemo } from "react";
import { PropertyCard } from "@/types/property";
import { useEnquiry } from "@/hooks/useEnquiry";
import ListingFaqBlock from "@/components/ListingFaqBlock";
import Reviews from "@/components/property/Reviews";
import { slugifyBuildingName } from "@/lib/buildingSlug";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useSaved } from "@/contexts/SavedContext";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { NEIGHBORHOODS } from "@/data/neighborhoods";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/contexts/CurrencyContext";
import dynamic from "next/dynamic";
import { StoredCommuteHub } from "@/lib/store/commuteHubs";
import { stripEmojis } from "@/lib/emoji";
import { enrichPropertyDescription, getStructuredSeoDescription } from "@/lib/seoEnricher";
import { useSession } from "next-auth/react";
import { useLanguage, Lang } from "@/contexts/LanguageContext";
import { T_PROPERTY } from "@/data/propertyTranslations";
import { getNearbyPlaces, NearbyPlace } from "@/data/nearbyPlaces";
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Bed,
  ShowerHead,
  Maximize2,
  Calendar,
  Footprints,
  Car,
  TrainFront,
  Building2,
  ChevronRight,
} from "lucide-react";

const CommuteMap = dynamic(() => import("./CommuteMap"), { ssr: false });

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function listingBadge(t: string, lang: Lang = "en") {
  const trans = T_PROPERTY[lang]?.badges || T_PROPERTY.en.badges;
  if (t === "sale") return trans.sale;
  if (t === "rent") return trans.rent;
  return trans.shortStay;
}
function translateArea(area: string, lang: Lang = "en"): string {
  const areaLower = area.toLowerCase().trim();
  if (lang === "th") {
    if (areaLower === "sukhumvit") return "สุขุมวิท";
    if (areaLower === "sathorn") return "สาทร";
    if (areaLower === "thong lo" || areaLower === "thonglor") return "ทองหล่อ";
    if (areaLower === "asok") return "อโศก";
    if (areaLower === "ekkamai") return "เอกมัย";
    if (areaLower === "silom") return "สีลม";
    if (areaLower === "on nut" || areaLower === "onnut") return "อ่อนนุช";
    if (areaLower === "ari") return "อารีย์";
    if (areaLower === "rama 9" || areaLower === "rama9") return "พระราม 9";
    if (areaLower === "bang na" || areaLower === "bangna") return "บางนา";
    if (areaLower === "huai khwang" || areaLower === "huaikhwang") return "ห้วยขวาง";
    if (areaLower === "phaya thai" || areaLower === "phayathai") return "พญาไท";
    return area;
  }
  if (lang === "zh") {
    if (areaLower === "sukhumvit") return "素坤逸";
    if (areaLower === "sathorn") return "沙吞";
    if (areaLower === "thong lo" || areaLower === "thonglor") return "通罗";
    if (areaLower === "asok") return "阿索克";
    if (areaLower === "ekkamai") return "伊卡迈";
    if (areaLower === "silom") return "席隆";
    if (areaLower === "on nut" || areaLower === "onnut") return "安努";
    if (areaLower === "ari") return "阿黎";
    if (areaLower === "rama 9" || areaLower === "rama9") return "拉玛九";
    if (areaLower === "bang na" || areaLower === "bangna") return "邦纳";
    if (areaLower === "huai khwang" || areaLower === "huaikhwang") return "辉煌";
    if (areaLower === "phaya thai" || areaLower === "phayathai") return "披耶泰";
    return area;
  }
  return area;
}
function translatePropertyType(type: string, lang: Lang = "en"): string {
  const tLower = type.toLowerCase().trim();
  if (lang === "th") {
    if (tLower === "condo") return "คอนโด";
    if (tLower === "house") return "บ้านเดี่ยว";
    if (tLower === "villa") return "วิลล่า";
    if (tLower === "townhouse") return "ทาวน์เฮ้าส์";
    if (tLower === "apartment") return "อพาร์ทเมนท์";
    return type;
  }
  if (lang === "zh") {
    if (tLower === "condo") return "公寓";
    if (tLower === "house") return "别墅/住宅";
    if (tLower === "villa") return "别墅";
    if (tLower === "townhouse") return "联排别墅";
    if (tLower === "apartment") return "公寓/套房";
    return type;
  }
  return type;
}
function formatPrice(p: PropertyCard, formatPriceFn: (n: number) => string, lang: Lang = "en") {
  const label = p.listingType === "sale" ? "" : (lang === "en" ? "/month" : lang === "th" ? "/เดือน" : "/月");
  if (p.listingType === "sale") return formatPriceFn(Number(p.priceTHB));
  let priceLbl = p.priceLabel || label;
  if (priceLbl.toLowerCase().includes("month") || priceLbl.toLowerCase().includes("/mo")) {
    priceLbl = label;
  }
  return `${formatPriceFn(Number(p.priceTHB))}${priceLbl}`;
}

function translateAmenity(amenity: string, lang: Lang = "en"): string {
  if (lang === "en") return amenity;
  const aLower = amenity.toLowerCase().trim();

  if (lang === "th") {
    if (aLower.includes("pet")) return "อนุญาตให้เลี้ยงสัตว์";
    if (aLower.includes("pool") || aLower.includes("swimming")) return "สระว่ายน้ำ";
    if (aLower.includes("gym") || aLower.includes("fitness")) return "ห้องฟิตเนส / ออกกำลังกาย";
    if (aLower.includes("security") || aLower.includes("guard") || aLower.includes("cctv") || aLower.includes("24h")) return "ระบบรักษาความปลอดภัย 24 ชม.";
    if (aLower.includes("garden") || aLower.includes("park")) return "สวนส่วนกลาง";
    if (aLower.includes("parking") || aLower.includes("garage")) return "ที่จอดรถ";
    if (aLower.includes("coworking") || aLower.includes("co-working") || aLower.includes("workspace") || aLower.includes("lounge")) return "โคเวิร์กกิ้งสเปซ";
    if (aLower.includes("sauna") || aLower.includes("steam")) return "ซาวน่า / สตรีม";
    if (aLower.includes("playground") || aLower.includes("kid")) return "สนามเด็กเล่น";
    if (aLower.includes("bbq")) return "พื้นที่บาร์บีคิว";
    if (aLower.includes("ev") || aLower.includes("charging")) return "จุดชาร์จ EV";
    if (aLower.includes("keycard") || aLower.includes("access")) return "คีย์การ์ดเข้า-ออก";
    return amenity;
  }

  if (lang === "zh") {
    if (aLower.includes("pet")) return "允许携带宠物";
    if (aLower.includes("pool") || aLower.includes("swimming")) return "游泳池";
    if (aLower.includes("gym") || aLower.includes("fitness")) return "健身房";
    if (aLower.includes("security") || aLower.includes("guard") || aLower.includes("cctv") || aLower.includes("24h")) return "24小时安保";
    if (aLower.includes("garden") || aLower.includes("park")) return "花园景观区";
    if (aLower.includes("parking") || aLower.includes("garage")) return "停车场";
    if (aLower.includes("coworking") || aLower.includes("co-working") || aLower.includes("workspace") || aLower.includes("lounge")) return "共享办公休息室";
    if (aLower.includes("sauna") || aLower.includes("steam")) return "桑拿蒸气室";
    if (aLower.includes("playground") || aLower.includes("kid")) return "儿童游乐场";
    if (aLower.includes("bbq")) return "烧烤区";
    if (aLower.includes("ev") || aLower.includes("charging")) return "电动车充电桩";
    if (aLower.includes("keycard") || aLower.includes("access")) return "门禁卡系统";
    return amenity;
  }

  return amenity;
}

function translateFeature(feature: string, lang: Lang = "en"): string {
  if (lang === "en") return feature;
  const fLower = feature.toLowerCase().trim();

  if (lang === "th") {
    if (fLower.includes("pet")) return "อนุญาตให้เลี้ยงสัตว์";
    if (fLower.includes("fully furnished") || fLower === "furnished") return "ตกแต่งครบครันพร้อมเข้าอยู่";
    if (fLower.includes("fitted kitchen") || fLower.includes("kitchen")) return "ห้องครัวบิวต์อินพร้อมใช้งาน";
    if (fLower.includes("skyline") || fLower.includes("city view")) return "วิวเมืองและทิวทัศน์ขอบฟ้า";
    if (fLower.includes("television") || fLower.includes("tv")) return "โทรทัศน์ / ทีวี";
    if (fLower.includes("air conditioning") || fLower.includes("aircon") || fLower.includes("ac")) return "เครื่องปรับอากาศ";
    if (fLower.includes("washing machine") || fLower.includes("washer")) return "เครื่องซักผ้า";
    if (fLower.includes("refrigerator") || fLower.includes("fridge")) return "ตู้เย็น";
    if (fLower.includes("microwave")) return "ไมโครเวฟ";
    if (fLower.includes("bts") || fLower.includes("mrt") || fLower.includes("transit")) return "ใกล้รถไฟฟ้า BTS/MRT";
    if (fLower.includes("sofa")) return "โซฟา";
    if (fLower.includes("balcony")) return "ระเบียงรับลมส่วนตัว";
    if (fLower.includes("bathtub")) return "อ่างอาบน้ำ";
    if (fLower.includes("water heater")) return "เครื่องทำน้ำอุ่น";
    if (fLower.includes("wifi") || fLower.includes("internet")) return "อินเทอร์เน็ตความเร็วสูง";
    return feature;
  }

  if (lang === "zh") {
    if (fLower.includes("pet")) return "允许携带宠物";
    if (fLower.includes("fully furnished") || fLower === "furnished") return "全套精装修拎包入住";
    if (fLower.includes("fitted kitchen") || fLower.includes("kitchen")) return "欧式全配套定制厨房";
    if (fLower.includes("skyline") || fLower.includes("city view")) return "城市天际线精美景观";
    if (fLower.includes("television") || fLower.includes("tv")) return "智能液晶电视";
    if (fLower.includes("air conditioning") || fLower.includes("aircon") || fLower.includes("ac")) return "全室冷暖空调";
    if (fLower.includes("washing machine") || fLower.includes("washer")) return "全自动洗衣机";
    if (fLower.includes("refrigerator") || fLower.includes("fridge")) return "双门电冰箱";
    if (fLower.includes("microwave")) return "微波炉";
    if (fLower.includes("bts") || fLower.includes("mrt") || fLower.includes("transit")) return "紧邻 BTS/MRT 轨道交通";
    if (fLower.includes("sofa")) return "舒适沙发";
    if (fLower.includes("balcony")) return "观景阳台";
    if (fLower.includes("bathtub")) return "独立浴缸";
    if (fLower.includes("water heater")) return "热水器";
    if (fLower.includes("wifi") || fLower.includes("internet")) return "预装高速光纤网络";
    return feature;
  }

  return feature;
}

function formatSubtitleBadge(p: PropertyCard, lang: Lang = "en"): string {
  const bedText = p.bedrooms === 0 
    ? (lang === "th" ? "ห้องสตูดิโอ" : lang === "zh" ? "单间 Studio" : "Studio")
    : (lang === "th" ? `${p.bedrooms} ห้องนอน` : lang === "zh" ? `${p.bedrooms} 居室` : `${p.bedrooms} Bed`);

  const propType = translatePropertyType(p.propertyType || "Condo", lang);

  const typeText = p.listingType === "sale"
    ? (lang === "th" ? "สำหรับขาย" : lang === "zh" ? "出售" : "for Sale")
    : p.listingType === "short_stay"
    ? (lang === "th" ? "สำหรับเช่าระยะสั้น" : lang === "zh" ? "短租" : "for Short-Term Rent")
    : (lang === "th" ? "สำหรับเช่า" : lang === "zh" ? "出租" : "for Rent");

  if (lang === "th") {
    return `${propType}${bedText} ${typeText}`;
  }
  if (lang === "zh") {
    return `${bedText} ${propType}${typeText}`;
  }
  return `${bedText} ${propType} ${typeText}`;
}

function translateDistance(distance: string, lang: Lang = "en"): string {
  if (!distance) return "";
  const minsMatch = distance.match(/(\d+)/);
  const mins = minsMatch ? minsMatch[1] : "";
  const isDrive = /drive|ขับรถ|驾车/i.test(distance);

  if (lang === "th") {
    if (!mins) return distance;
    return isDrive ? `ขับรถ ${mins} นาที` : `เดิน ${mins} นาที`;
  }
  if (lang === "zh") {
    if (!mins) return distance;
    return isDrive ? `驾车 ${mins} 分钟` : `步行 ${mins} 分钟`;
  }

  if (!mins) return distance;
  return isDrive ? `${mins} min drive` : `${mins} min walk`;
}

/* Relative date string e.g. "Posted 3 days ago" */
function relativeDate(iso: string, lang: Lang = "en"): string {
  const t = T_PROPERTY[lang]?.relative || T_PROPERTY.en.relative;
  const then = new Date(iso).getTime();
  const now  = Date.now();
  const days = Math.max(0, Math.floor((now - then) / 86_400_000));
  if (days === 0)  return t.today;
  if (days === 1)  return t.yesterday;
  if (days <  7)   return t.daysAgo.replace("{count}", String(days));
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return t.weeksAgo.replace("{count}", String(weeks)).replace("{plural}", weeks === 1 ? "" : "s");
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return t.monthsAgo.replace("{count}", String(months)).replace("{plural}", months === 1 ? "" : "s");
  }
  const formattedDate = new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : lang === "th" ? "th-TH" : "zh-CN", { day: "numeric", month: "short", year: "numeric" });
  return t.onDate.replace("{date}", formattedDate);
}


/* ── Smart defaults — derived from id/listingType when explicit field absent ── */

function viewCount(p: PropertyCard): number {
  if (p.viewCount != null) return p.viewCount;
  // Deterministic pseudo-random based on id + likes
  return p.likes * 6 + p.id * 23 + 47;
}

interface Facility {
  name: string;
  distance: string; // e.g. "5 min walk", "10 min drive"
  type: "transit" | "mall" | "cafe" | "hospital" | "school";
  icon: string;
  latOffset: number; // For rendering on map relative to center
  lngOffset: number;
}

const NEIGHBORHOOD_DATA: Record<string, Facility[]> = {
  "Sukhumvit": [
    { name: "BTS Phrom Phong", distance: "5 min walk", type: "transit", icon: "🚇", latOffset: -0.005, lngOffset: -0.006 },
    { name: "EmQuartier Shopping Mall", distance: "6 min walk", type: "mall", icon: "🛍", latOffset: 0.004, lngOffset: 0.007 },
    { name: "Starbucks Sukhumvit 24", distance: "3 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.003 },
    { name: "Bumrungrad International Hospital", distance: "8 min drive", type: "hospital", icon: "🏥", latOffset: -0.007, lngOffset: 0.005 },
    { name: "NIST International School", distance: "10 min drive", type: "school", icon: "🏫", latOffset: 0.005, lngOffset: -0.005 }
  ],
  "Asok": [
    { name: "BTS Asok / MRT Sukhumvit", distance: "3 min walk", type: "transit", icon: "🚇", latOffset: -0.003, lngOffset: -0.004 },
    { name: "Terminal 21 Asok", distance: "4 min walk", type: "mall", icon: "🛍", latOffset: 0.005, lngOffset: 0.005 },
    { name: "Craft Wi-Fi Cafe", distance: "5 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.002 },
    { name: "Samitivej Sukhumvit Hospital", distance: "10 min drive", type: "hospital", icon: "🏥", latOffset: -0.006, lngOffset: 0.006 },
    { name: "Australian International School", distance: "8 min drive", type: "school", icon: "🏫", latOffset: 0.006, lngOffset: -0.003 }
  ],
  "Thong Lo": [
    { name: "BTS Thong Lo", distance: "4 min walk", type: "transit", icon: "🚇", latOffset: -0.004, lngOffset: -0.005 },
    { name: "The Commons Thonglor", distance: "7 min walk", type: "mall", icon: "🛍", latOffset: 0.006, lngOffset: 0.006 },
    { name: "Roast Coffee & Eatery", distance: "6 min walk", type: "cafe", icon: "☕", latOffset: 0.003, lngOffset: -0.003 },
    { name: "Camillian Hospital", distance: "5 min drive", type: "hospital", icon: "🏥", latOffset: -0.005, lngOffset: 0.004 },
    { name: "The American School of Bangkok", distance: "7 min drive", type: "school", icon: "🏫", latOffset: 0.004, lngOffset: -0.004 }
  ],
  "Ekkamai": [
    { name: "BTS Ekkamai", distance: "5 min walk", type: "transit", icon: "🚇", latOffset: -0.005, lngOffset: -0.005 },
    { name: "Gateway Ekamai Mall", distance: "6 min walk", type: "mall", icon: "🛍", latOffset: 0.004, lngOffset: 0.006 },
    { name: "Ink & Lion Cafe", distance: "4 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.002 },
    { name: "Sukumvit Hospital", distance: "3 min drive", type: "hospital", icon: "🏥", latOffset: -0.003, lngOffset: 0.004 },
    { name: "St. Andrews International School", distance: "5 min drive", type: "school", icon: "🏫", latOffset: 0.005, lngOffset: -0.003 }
  ],
  "On Nut": [
    { name: "BTS On Nut", distance: "6 min walk", type: "transit", icon: "🚇", latOffset: -0.006, lngOffset: -0.006 },
    { name: "Century The Movie Plaza", distance: "5 min walk", type: "mall", icon: "🛍", latOffset: 0.003, lngOffset: 0.005 },
    { name: "The Coffee Club", distance: "4 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.003 },
    { name: "Kluaynamthai Hospital", distance: "8 min drive", type: "hospital", icon: "🏥", latOffset: -0.006, lngOffset: 0.004 },
    { name: "Wells International School", distance: "7 min drive", type: "school", icon: "🏫", latOffset: 0.004, lngOffset: -0.004 }
  ],
  "Silom": [
    { name: "BTS Sala Daeng / MRT Silom", distance: "4 min walk", type: "transit", icon: "🚇", latOffset: -0.004, lngOffset: -0.005 },
    { name: "Silom Complex", distance: "5 min walk", type: "mall", icon: "🛍", latOffset: 0.004, lngOffset: 0.006 },
    { name: "Everyday KMKM Cafe", distance: "3 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.002 },
    { name: "Bangkok Christian Hospital", distance: "6 min walk", type: "hospital", icon: "🏥", latOffset: -0.002, lngOffset: 0.004 },
    { name: "St. Joseph Convent School", distance: "8 min walk", type: "school", icon: "🏫", latOffset: 0.003, lngOffset: -0.004 }
  ],
  "Sathorn": [
    { name: "BTS Chong Nonsi / MRT Lumphini", distance: "7 min walk", type: "transit", icon: "🚇", latOffset: -0.005, lngOffset: -0.006 },
    { name: "Sathorn Square", distance: "8 min walk", type: "mall", icon: "🛍", latOffset: 0.005, lngOffset: 0.006 },
    { name: "Glow Cafe", distance: "5 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.003 },
    { name: "BNH Hospital", distance: "5 min drive", type: "hospital", icon: "🏥", latOffset: -0.004, lngOffset: 0.004 },
    { name: "Garden International School", distance: "9 min drive", type: "school", icon: "🏫", latOffset: 0.006, lngOffset: -0.004 }
  ],
  "Ari": [
    { name: "BTS Ari", distance: "8 min walk", type: "transit", icon: "🚇", latOffset: -0.006, lngOffset: -0.006 },
    { name: "La Villa Ari", distance: "7 min walk", type: "mall", icon: "🛍", latOffset: 0.005, lngOffset: 0.005 },
    { name: "Common Room x Ari Cafe", distance: "4 min walk", type: "cafe", icon: "☕", latOffset: 0.001, lngOffset: -0.002 },
    { name: "Vichaiyut Hospital", distance: "6 min drive", type: "hospital", icon: "🏥", latOffset: -0.005, lngOffset: 0.004 },
    { name: "RBIS International School", distance: "9 min drive", type: "school", icon: "🏫", latOffset: 0.004, lngOffset: -0.004 }
  ]
};


// Cleans the map pin label to show only the core building name
function cleanMapLabel(name: string): string {
  let clean = name;
  // Strip "For Rent – ", "For Sale -", etc.
  clean = clean.replace(/^(?:for\s+(?:rent|sale)\s*[-–—]\s*)/i, "");
  // Strip pricing info like "💰 Rental Price..." or "Rental Price..."
  clean = clean.replace(/(?:💰?\s*Rental\s+Price.*)$/i, "");
  clean = clean.replace(/(?:💰?\s*Price.*)$/i, "");
  
  const parts = clean.split(/\s*[-–—]\s*/);
  if (parts.length > 1) {
    clean = parts[0];
  }
  
  if (clean.length > 25) {
    clean = clean.slice(0, 25) + "...";
  }
  return clean.trim();
}

// Extracts BTS, MRT, and Malls dynamically from property descriptions for non-standard neighborhoods
function getDynamicFacilities(p: PropertyCard): Facility[] {
  if (NEIGHBORHOOD_DATA[p.area]) {
    return NEIGHBORHOOD_DATA[p.area];
  }

  const desc = p.description || "";
  const facilities: Facility[] = [];

  // Parse BTS (e.g., "Only 300 m. to BTS Ha Yaek Lat Phrao")
  const btsRegex = /(?:(\d+)\s*(?:m|meter|min|minute)s?\.?\s*(?:to|from)?\s*)?BTS\s+([A-Za-z0-9\s\-]+?)(?=\.|\,|and|near|only|with|features|is|in|$)/gi;
  let btsMatch;
  while ((btsMatch = btsRegex.exec(desc)) !== null) {
    const meters = btsMatch[1] ? parseInt(btsMatch[1], 10) : null;
    const station = btsMatch[2].trim();
    if (station) {
      const distance = meters
        ? meters < 100 ? `${meters} min walk` : `${Math.round(meters / 80)} min walk`
        : "5 min walk";
      facilities.push({
        name: `BTS ${station}`,
        distance,
        type: "transit",
        icon: "🚇",
        latOffset: -0.005,
        lngOffset: -0.006
      });
    }
  }

  // Parse MRT (e.g., "700 m. to MRT Phahon Yothin")
  const mrtRegex = /(?:(\d+)\s*(?:m|meter|min|minute)s?\.?\s*(?:to|from)?\s*)?MRT\s+([A-Za-z0-9\s\-]+?)(?=\.|\,|and|near|only|with|features|is|in|$)/gi;
  let mrtMatch;
  while ((mrtMatch = mrtRegex.exec(desc)) !== null) {
    const meters = mrtMatch[1] ? parseInt(mrtMatch[1], 10) : null;
    const station = mrtMatch[2].trim();
    if (station) {
      const distance = meters
        ? meters < 100 ? `${meters} min walk` : `${Math.round(meters / 80)} min walk`
        : "5 min walk";
      facilities.push({
        name: `MRT ${station}`,
        distance,
        type: "transit",
        icon: "🚇",
        latOffset: 0.004,
        lngOffset: 0.005
      });
    }
  }

  // Parse Landmarks (e.g., "Near Central Ladprao, Lotus, and Union Mall")
  const nearRegex = /(?:near|close to)\s+([A-Za-z0-9\s,]+?)(?=\.|\n|$)/gi;
  const nearMatch = nearRegex.exec(desc);
  if (nearMatch && nearMatch[1]) {
    const places = nearMatch[1].split(/,|\band\b/i).map(x => x.trim()).filter(Boolean);
    places.forEach((place, idx) => {
      if (place.toUpperCase().includes("BTS") || place.toUpperCase().includes("MRT")) return;
      
      let type: "mall" | "cafe" | "hospital" | "school" = "mall";
      let icon = "🛍";
      const lowerPlace = place.toLowerCase();
      if (lowerPlace.includes("hospital")) {
        type = "hospital";
        icon = "🏥";
      } else if (lowerPlace.includes("school") || lowerPlace.includes("university")) {
        type = "school";
        icon = "🏫";
      } else if (lowerPlace.includes("cafe") || lowerPlace.includes("coffee")) {
        type = "cafe";
        icon = "☕";
      }

      facilities.push({
        name: place,
        distance: `${3 + idx * 2} min walk`,
        type,
        icon,
        latOffset: 0.003 + (idx * 0.002),
        lngOffset: -0.004 - (idx * 0.002)
      });
    });
  }

  return facilities.length > 0 ? facilities : NEIGHBORHOOD_DATA["Sukhumvit"];
}

function getDynamicFloor(description: string, id: number, propertyType: string): string {
  const floorRegex = /(?:floor\s+(\d+))|(?:(\d+)(?:st|nd|rd|th)\s+floor)/i;
  const match = description.match(floorRegex);
  const condoType = propertyType.toLowerCase() === "condo" || propertyType.toLowerCase() === "apartment";
  
  if (!condoType) {
    return "Ground";
  }

  let floor = (id % 25) + 3;
  if (match) {
    floor = Number(match[1] || match[2]);
  }
  
  const totalFloors = Math.max(floor + 3, (id % 20) + 15);
  return `${floor} / ${totalFloors}`;
}

function getDynamicParking(description: string, id: number, propertyType: string): string {
  const parkingRegex = /(?:(\d+)\s*(?:parking|car\s*park|parking\s*space|garage\s*space|parking\s*spot|private\s*space|car\s*slot|slot|spot))/i;
  const match = description.match(parkingRegex);
  
  if (match) {
    const spaces = Number(match[1]);
    return `${spaces} Space${spaces > 1 ? "s" : ""}`;
  }

  const isHouse = propertyType.toLowerCase() === "house" || propertyType.toLowerCase() === "villa" || propertyType.toLowerCase() === "townhouse";
  if (isHouse) {
    const spaces = (id % 3) + 2;
    return `${spaces} Private Space${spaces > 1 ? "s" : ""}`;
  }
  
  const spaces = (id % 2) + 1;
  return `${spaces} Covered Spot${spaces > 1 ? "s" : ""}`;
}


function availableFromLabel(p: PropertyCard, lang: Lang = "en"): string {
  if (p.availableFrom) {
    const d = new Date(p.availableFrom);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(lang === "en" ? "en-GB" : lang === "th" ? "th-TH" : "zh-CN", { day: "numeric", month: "short", year: "numeric" });
    }
    return p.availableFrom;
  }
  const transSpecs = T_PROPERTY[lang]?.specs || T_PROPERTY.en.specs;
  if (p.listingType === "sale") return transSpecs.negotiable;
  return transSpecs.availableNow;
}


function lastVerifiedLabel(p: PropertyCard, lang: Lang = "en"): string {
  const t = T_PROPERTY[lang]?.verified || T_PROPERTY.en.verified;
  if (p.lastVerifiedAt) {
    const days = Math.floor((Date.now() - new Date(p.lastVerifiedAt).getTime()) / 86_400_000);
    if (days === 0) return t.today;
    if (days === 1) return t.yesterday;
    if (days < 7)   return t.daysAgo.replace("{count}", String(days));
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return t.weeksAgo.replace("{count}", String(weeks)).replace("{plural}", weeks === 1 ? "" : "s");
    }
    const months = Math.floor(days / 30);
    return t.monthsAgo.replace("{count}", String(months)).replace("{plural}", months === 1 ? "" : "s");
  }
  return t.byTeam;
}


function houseRulesDefaults(p: PropertyCard): Required<NonNullable<PropertyCard["houseRules"]>> {
  const r = p.houseRules ?? {};
  return {
    pets:     r.pets     ?? p.petFriendly,
    smoking:  r.smoking  ?? false,
    parties:  r.parties  ?? false,
    children: r.children ?? true,
  };
}


/* ─────────────────────────────────────────────
   Icons (inline SVGs — no external lib needed)
───────────────────────────────────────────── */
const Icon = {
  bed:        () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h20v12M22 12H2"/></svg>,
  bath:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-2.5 1.06V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5H2"/><path d="M10 5a2 2 0 0 1 4 0v3h-4z"/></svg>,
  sqft:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h6M3 15h6M9 3v6M15 3v6M9 21v-6M15 21v-6M15 9h6M15 15h6"/></svg>,
  garage:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V8l9-5 9 5v13M5 21V11h14v10"/><path d="M5 14h14"/></svg>,
  home:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  status:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
  subtype:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/></svg>,
  calendar:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  hash:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  stories:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="5"/><rect x="4" y="11" width="16" height="5"/><rect x="4" y="18" width="16" height="3"/></svg>,
  ruler:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m21 8-9-5-9 5v11l9 5 9-5z"/><path d="M3 8h6M3 14h6"/></svg>,
  money:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8M12 6v2M12 16v2"/></svg>,
  parking:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>,
  view:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  heating:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21V10M16 21V10M12 21V3"/><path d="M8 7s2-2 4-2 4 2 4 2"/></svg>,
  cooling:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/></svg>,
  fire:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  share:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  heart:      ({ filled = false }: { filled?: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#10B981" : "none"} stroke={filled ? "#10B981" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  chevL:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevR:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chevRSm:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  phone:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  pin:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
};

function getAmenityIcon(label: string) {
  const norm = label.toLowerCase();
  
  if (norm.includes("pool") || norm.includes("swimming")) {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20s2-2 5-2 5 2 7 2 5-2 5-2 2 2 3 2"/><path d="M2 16s2-2 5-2 5 2 7 2 5-2 5-2 2 2 3 2"/><path d="M6 11V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6"/><path d="M14 11V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v11"/></svg>;
  }
  if (norm.includes("gym") || norm.includes("fitness")) {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5 17.5 17.5"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>;
  }
  if (norm.includes("garden") || norm.includes("park")) {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a6 6 0 0 0-6-6H3v3a6 6 0 0 0 6 6h3z"/><path d="M12 22V12"/><path d="M12 12a6 6 0 0 1 6-6h3v3a6 6 0 0 1-6 6h-3z"/></svg>;
  }
  if (norm.includes("coworking") || norm.includes("co-working") || norm.includes("workspace") || norm.includes("lounge")) {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="3" rx="2"/><path d="M12 15v5M5 20h14"/></svg>;
  }
  if (norm.includes("sauna") || norm.includes("steam") || norm.includes("jacuzzi")) {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M8 4v4M16 4v4M4 14h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2z"/></svg>;
  }
  if (norm.includes("security") || norm.includes("cctv") || norm.includes("guard")) {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
  }
  if (norm.includes("parking") || norm.includes("garage")) {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>;
  }
  if (norm.includes("keycard") || norm.includes("card") || norm.includes("access")) {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
  }
  
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}

function getPlaceImage(area: string, category: string, placeName: string, fallbackUrl?: string): string {
  const normArea = area.toLowerCase().replace(/\s+/g, "_");
  const normName = placeName.toLowerCase();
  
  if (category === "BTS/MRT" || normName.includes("bts") || normName.includes("mrt")) {
    return "https://images.unsplash.com/photo-1568992688467-f47055745d7a?w=400&auto=format&q=80";
  }
  if (normName.includes("emquartier") || normName.includes("emporium")) {
    return "https://images.unsplash.com/photo-1569937728357-4971c45f974c?w=400&auto=format&q=80";
  }
  if (normName.includes("terminal 21")) {
    return "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&auto=format&q=80";
  }
  if (normName.includes("jodd fairs") || normName.includes("market")) {
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&q=80";
  }
  if (normName.includes("commons")) {
    return "https://images.unsplash.com/photo-1582298538104-ed2d6bb5ab82?w=400&auto=format&q=80";
  }
  
  const validAreas = ["ari", "asok", "ekkamai", "on_nut", "sathorn", "silom", "sukhumvit", "thong_lo"];
  if (validAreas.includes(normArea)) {
    if (category === "Cafes" || category === "Co-working") {
      return `/images/lifestyles/${normArea}_cafe.webp`;
    }
    if (category === "Restaurants" || category === "Dining") {
      return `/images/lifestyles/${normArea}_dining.webp`;
    }
    if (category === "Parks" || category === "Fitness") {
      return `/images/lifestyles/${normArea}_parks.webp`;
    }
    if (category === "Nightlife") {
      return `/images/lifestyles/${normArea}_nightlife.webp`;
    }
  }
  
  if (fallbackUrl) return fallbackUrl;
  
  if (category === "Parks" || normName.includes("park")) {
    return "https://images.unsplash.com/photo-1596700447384-e40ab4a4a4a4?w=400&auto=format&q=80";
  }
  if (category === "Cafes") {
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&q=80";
  }
  if (category === "Restaurants") {
    return "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&q=80";
  }
  return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80";
}

/* ─────────────────────────────────────────────
   PlacePhotoCard — Nearby Places card with live
   Google Places photo + shimmer skeleton fallback
───────────────────────────────────────────── */
interface PlacePhotoCardProps {
  place: NearbyPlace & { area: string };
  property: import("@/types/property").PropertyCard;
  getDirectionsUrlFn: (property: import("@/types/property").PropertyCard, name: string) => string;
}

function PlacePhotoCard({ place, property, getDirectionsUrlFn }: PlacePhotoCardProps) {
  const { lang } = useLanguage();
  const t = T_PROPERTY[lang] || T_PROPERTY.en;
  const fallback = getPlaceImage(property.area, place.category, place.name, place.image);
  const [imgSrc, setImgSrc] = useState<string>(fallback);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setImageLoaded(false);
    setImgSrc(fallback);

    const url = `/api/places-photo?name=${encodeURIComponent(place.name)}&area=${encodeURIComponent(property.area)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data: { photoUrl?: string | null }) => {
        if (!cancelled && data.photoUrl) {
          setImgSrc(data.photoUrl);
        }
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place.name, property.area]);

  return (
    <a
      href={getDirectionsUrlFn(property, place.name)}
      target="_blank"
      rel="noopener noreferrer"
      className="relative rounded-xl overflow-hidden group cursor-pointer block no-underline"
      style={{ aspectRatio: "3 / 4" }}
    >
      {/* Shimmer skeleton shown while loading or image hasn't painted */}
      {(loading || !imageLoaded) && (
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(90deg, #e8e3d9 25%, #f0ece4 50%, #e8e3d9 75%)",
            backgroundSize: "200% 100%",
            animation: "nhp-shimmer 1.4s infinite linear",
          }}
        />
      )}

      <Image
        src={imgSrc}
        alt={place.name}
        fill
        sizes="(max-width: 768px) 100vw, 300px"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        style={{ opacity: imageLoaded ? 1 : 0, transition: "opacity 0.4s" }}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          // photo_reference URL failed → fall back to static
          if (imgSrc !== fallback) {
            setImgSrc(fallback);
          }
          setImageLoaded(true);
        }}
      />

      {/* Google Maps badge when using a real photo */}
      {!loading && imgSrc !== fallback && (
        <div
          className="absolute top-2 left-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
          style={{ background: "rgba(255,255,255,0.92)", color: "#1C3A2F" }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="#4285F4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          Live
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)" }} />

      {/* Rating badge */}
      <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5" style={{ background: "rgba(255,255,255,0.92)", color: "#1C3A2F" }}>
        <Star className="w-2.5 h-2.5 fill-[#C9A84C] text-[#C9A84C]" /> {place.rating}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-left z-20">
        <div className="text-[12px] font-bold text-white leading-tight mb-0.5">{place.name}</div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/80">{translateDistance(place.distance, lang)}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(201,168,76,0.85)", color: "#1C3A2F" }}>
            {(() => {
              const placeCatKey = place.category === "BTS/MRT" ? "bts/mrt" : place.category.toLowerCase();
              return t.nearbyCategories[placeCatKey as keyof typeof t.nearbyCategories] || place.category;
            })()}
          </span>
        </div>
      </div>
    </a>
  );
}

function getAreaSlug(area: string): string {
  return area.toLowerCase().replace(/\s+/g, "-");
}

function getDescriptiveAltText({
  bedrooms,
  propertyType,
  listingType,
  area,
  index
}: {
  bedrooms: number;
  propertyType: string;
  listingType: string;
  area: string;
  index: number;
}) {
  const roomType = bedrooms === 0 ? "Studio" : `${bedrooms} bedroom`;
  const type = propertyType || "condo";
  const action = listingType === "sale" ? "sale" : "rent";
  const location = `${area} Bangkok`;
  
  const contexts = [
    "living room view",
    "kitchen and dining area",
    "master bedroom interior",
    "bathroom and modern finishes",
    "swimming pool and building amenities",
    "balcony perspective"
  ];
  
  const suffix = contexts[index % contexts.length];
  return `${roomType} ${type} for ${action} in ${location} - ${suffix}`;
}

/* ─────────────────────────────────────────────
   Gallery — main image + thumbnails
   ───────────────────────────────────────────── */
function Gallery({
  images,
  name,
  isFeatured,
  propertyId,
  area,
  bedrooms,
  listingType,
  propertyType
}: {
  images: string[];
  name: string;
  isFeatured: boolean;
  propertyId: number;
  area: string;
  bedrooms: number;
  listingType: string;
  propertyType: string;
}) {
  const { lang } = useLanguage();
  const t = T_PROPERTY[lang] || T_PROPERTY.en;
  const [active, setActive]       = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const { isSaved, toggle }       = useSaved();
  const saved                     = isSaved(propertyId);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollLock, setScrollLock] = useState(false);

  const rawImages = useMemo(() => images.filter(Boolean), [images]);
  // Pad to always show 4 thumbnails — cycle through available images when fewer exist
  const safeImages = rawImages.length === 0
    ? []
    : rawImages.length >= 4
      ? rawImages
      : Array.from({ length: 4 }, (_, i) => rawImages[i % rawImages.length]);
  const visibleThumbs = safeImages.slice(0, 4);
  const extraCount = Math.max(0, rawImages.length - 4);

  const prev = useCallback(() => setActive((a) => {
    const len = rawImages.length || 1;
    return (a - 1 + len) % len;
  }), [rawImages.length]);

  const next = useCallback(() => setActive((a) => {
    const len = rawImages.length || 1;
    return (a + 1) % len;
  }), [rawImages.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart(touch.clientX);
    setTouchStartY(touch.clientY);
    setDragOffset(0);
    setIsDragging(true);
    setScrollLock(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null || touchStartY === null || !isDragging) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStart;
    const diffY = touch.clientY - touchStartY;

    if (!scrollLock) {
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 10) {
        setIsDragging(false);
        return;
      }
      if (Math.abs(diffX) > 10) {
        setScrollLock(true);
      }
    }

    if (scrollLock) {
      if (e.cancelable) e.preventDefault();
      setDragOffset(diffX);
    }
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setScrollLock(false);

    if (Math.abs(dragOffset) > 50) {
      if (dragOffset < 0) {
        next();
      } else {
        prev();
      }
    }
    setDragOffset(0);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, prev, next]);

  const GALLERY_H = "clamp(360px, 36vw, 460px)";

  return (
    <div>
      {copied && (
        <div
          className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-lg animate-fade-in border"
          style={{ background: "#1C3A2F", color: "#E2C97E", borderColor: "#C9A84C" }}
        >
          {t.linkCopied || "🔗 Link copied to clipboard!"}
        </div>
      )}
      <div className="flex gap-4 md:gap-5" style={{ height: GALLERY_H }}>

      {/* ── LEFT: vertical thumbnail column (desktop) ── */}
      {safeImages.length > 1 && (
        <div className="hidden md:flex flex-col gap-2 flex-shrink-0" style={{ width: 210 }}>
          {visibleThumbs.map((src, i) => {
            const isLastWithExtra = i === visibleThumbs.length - 1 && extraCount > 0;
            return (
              <button
                key={i}
                onClick={() => setActive(i % (rawImages.length || 1))}
                className="relative overflow-hidden rounded-xl cursor-pointer transition-all flex-1 min-h-0"
                style={{
                  border: (i % (rawImages.length || 1)) === (active % (rawImages.length || 1)) ? "2px solid #C9A84C" : "2px solid transparent",
                  background: "#1C3A2F",
                }}
              >
                <Image
                  src={!imgErrors[i] && src ? src : "/images/homepage_hero_v2.webp"}
                  alt={getDescriptiveAltText({ bedrooms, propertyType, listingType, area, index: i })}
                  fill
                  sizes="(max-width: 768px) 20vw, 80px"
                  className="object-cover"
                  onError={() => setImgErrors((e) => ({ ...e, [i]: true }))}
                />
                {/* Last thumb + extra count overlay */}
                {isLastWithExtra && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(28,58,47,0.75)" }}>
                    <span className="text-[18px] font-bold leading-none mb-1" style={{ color: "#E2C97E" }}>+{extraCount}</span>
                    <span className="text-[10px] font-medium uppercase tracking-[0.5px]" style={{ color: "rgba(255,255,255,0.85)" }}>{t.photos}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── RIGHT: main image — fills remaining width ── */}
      <div
        className="relative overflow-hidden rounded-2xl flex-1 min-w-0 h-full"
        style={{ background: "#1C3A2F" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full w-full"
          style={{
            transform: `translateX(${isDragging ? `calc(-${active * 100}% + ${dragOffset}px)` : `-${active * 100}%`})`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        >
          {(rawImages.length > 0 ? rawImages : [""]).map((src, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 relative">
              <Image
                src={!imgErrors[idx] && src ? src : "/images/homepage_hero_v2.webp"}
                alt={getDescriptiveAltText({ bedrooms, propertyType, listingType, area, index: idx })}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
                onError={() => setImgErrors((e) => ({ ...e, [idx]: true }))}
              />
            </div>
          ))}
        </div>

        {/* "New Listing" badge */}
        {isFeatured && (
          <div
            className="absolute top-4 left-4 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.5px]"
            style={{ background: "rgba(28,58,47,0.92)", color: "#E2C97E", borderRadius: 6 }}
          >
            {t.newListing}
          </div>
        )}

        {/* Share + Heart — top right */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none transition-transform active:scale-90"
            style={{ background: "#FFFFFF", color: "#1C3A2F", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
            aria-label="Share"
          >
            <Icon.share />
          </button>
          <button
            onClick={() => toggle(propertyId)}
            className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none transition-all duration-200 ${
              saved ? "animate-pop-bounce scale-110" : "hover:scale-110 active:scale-90"
            }`}
            style={{ background: "#FFFFFF", color: "#1C3A2F", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
            aria-label="Save"
          >
            <Icon.heart filled={saved} />
          </button>
        </div>

        {/* View Photos Button */}
        {rawImages.length > 0 && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-4 right-4 px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer border-none flex items-center gap-2 transition-all active:scale-95 hover:bg-opacity-90 shadow-md z-10"
            style={{ background: "#FFFFFF", color: "#1C3A2F", fontFamily: "inherit" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            {t.viewPhotos}
          </button>
        )}

        {/* Prev / Next */}
        {rawImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.92)", color: "#1C3A2F", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
              aria-label="Previous image"
            >
              <Icon.chevL />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.92)", color: "#1C3A2F", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
              aria-label="Next image"
            >
              <Icon.chevR />
            </button>
          </>
        )}
      </div>

      </div>

      {/* ── MOBILE: horizontal thumbnail strip below main image ── */}
      {safeImages.length > 1 && (
        <div className="md:hidden grid grid-cols-4 gap-2 mt-2.5">
          {visibleThumbs.map((src, i) => {
            const isLastWithExtra = i === visibleThumbs.length - 1 && extraCount > 0;
            return (
              <button
                key={i}
                onClick={() => setActive(i % (rawImages.length || 1))}
                className="relative overflow-hidden rounded-lg cursor-pointer transition-all"
                style={{
                  aspectRatio: "4 / 3",
                  border: (i % (rawImages.length || 1)) === (active % (rawImages.length || 1)) ? "2px solid #C9A84C" : "2px solid transparent",
                  background: "#1C3A2F",
                }}
              >
                {!imgErrors[i] && (
                  <Image
                    src={src}
                    alt={getDescriptiveAltText({ bedrooms, propertyType, listingType, area, index: i })}
                    fill
                    sizes="(max-width: 768px) 25vw, 100px"
                    className="object-cover"
                    onError={() => setImgErrors((e) => ({ ...e, [i]: true }))}
                  />
                )}
                {isLastWithExtra && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(28,58,47,0.75)" }}>
                    <span className="text-[14px] font-bold leading-none" style={{ color: "#E2C97E" }}>+{extraCount}</span>
                    <span className="text-[9px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.85)" }}>{t.photos}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4" 
          style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button 
            onClick={() => setLightboxOpen(false)} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-none text-white text-xl z-50 transition-all hover:scale-110 active:scale-90"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            ✕
          </button>

          {/* Center container */}
          <div 
            className="relative max-w-5xl w-full h-[75vh] flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {rawImages[active % (rawImages.length || 1)] && (
              <Image 
                src={rawImages[active % (rawImages.length || 1)]} 
                alt={getDescriptiveAltText({ bedrooms, propertyType, listingType, area, index: active })} 
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain rounded-xl shadow-2xl"
              />
            )}

            {/* Prev / Next buttons */}
            {rawImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prev(); }} 
                  className="absolute left-2 md:left-4 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border-none text-white transition-all hover:scale-110 hover:bg-opacity-30 active:scale-90"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Icon.chevL />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); next(); }} 
                  className="absolute right-2 md:right-4 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border-none text-white transition-all hover:scale-110 hover:bg-opacity-30 active:scale-90"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Icon.chevR />
                </button>
              </>
            )}
          </div>

          {/* Image counter */}
          <div className="text-white text-[14px] font-semibold mt-6 tracking-wide px-4 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            {(active % (rawImages.length || 1)) + 1} / {rawImages.length}
          </div>
        </div>
      )}
    </div>
  );
}


/* ─────────────────────────────────────────────
   Enquiry form (used by Send Enquiry button)
───────────────────────────────────────────── */
function EnquiryModal({ property, onClose }: { property: PropertyCard; onClose: () => void }) {
  const { data: session }     = useSession();
  const [name, setName]       = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod]   = useState("WhatsApp");
  const [msg, setMsg]         = useState("");
  const { status, errorMsg, submit: sendEnquiry } = useEnquiry();
  const { lang } = useLanguage();
  const t = T_PROPERTY[lang] || T_PROPERTY.en;

  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) {
        setName(session.user.name);
      }
      if (session.user.email && !contact) {
        setContact(session.user.email);
      }
    }
  }, [session, name, contact]);

  const { formatPrice: formatPriceFn } = useCurrency();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    await sendEnquiry({
      propertySlug: property.slug,
      propertyName: property.name,
      listingType:  property.listingType,
      price:        formatPrice(property, formatPriceFn, lang),
      area:         property.area,
      name, contact, method,
      message:      msg || undefined,
      source:       "detail",
    });
  };

  const inputStyle = { border: "1.5px solid #E5E0D8", background: "#F7F3EC", color: "#1A1A1A", fontFamily: "inherit" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {status === "done" ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <p className="text-[18px] font-bold mb-2" style={{ color: "#1C3A2F" }}>
                {lang === "en" ? "Enquiry sent!" : lang === "th" ? "ส่งคำขอข้อมูลแล้ว!" : "已发送咨询！"}
              </p>
              <p className="text-[13px] font-light mb-5" style={{ color: "#555" }}>
                {lang === "en" 
                  ? `We'll contact you via ${method} within 24 hours.` 
                  : lang === "th" 
                  ? `เราจะติดต่อกลับผ่าน ${method} ภายใน 24 ชั่วโมง` 
                  : `我们将在 24 小时内通过 ${method} 与您联系。`}
              </p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer border-none" style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}>
                {t.close || "Close"}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[16px] font-bold" style={{ color: "#1C3A2F" }}>{t.sendEnquiry || "Send Enquiry"}</h3>
                  <p className="text-[12px] mt-0.5" style={{ color: "#999" }}>{property.name}</p>
                </div>
                <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none text-base" style={{ background: "#EDE8DF", color: "#555", fontFamily: "inherit" }}>✕</button>
              </div>
              <form className="flex flex-col gap-3" onSubmit={submit}>
                <input suppressHydrationWarning className="w-full rounded-xl px-4 py-3 text-[14px] outline-none" style={inputStyle} placeholder={lang === "en" ? "Your name" : lang === "th" ? "ชื่อของคุณ" : "您的姓名"} value={name} onChange={(e) => setName(e.target.value)} onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")} onBlur={(e) => (e.target.style.borderColor = "#E5E0D8")} required />
                <div className="flex gap-2 w-full min-w-0">
                  <select suppressHydrationWarning value={method} onChange={(e) => setMethod(e.target.value)} className="shrink-0 rounded-xl px-3 py-3 text-[14px] outline-none cursor-pointer" style={inputStyle}>
                    <option>WhatsApp</option><option>Line</option><option>Telegram</option>
                  </select>
                  <input suppressHydrationWarning className="flex-1 min-w-0 rounded-xl px-4 py-3 text-[14px] outline-none" style={inputStyle} placeholder={lang === "en" ? "Phone / username" : lang === "th" ? "เบอร์โทรศัพท์ / ชื่อผู้ใช้" : "电话 / 用户名"} value={contact} onChange={(e) => setContact(e.target.value)} onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")} onBlur={(e) => (e.target.style.borderColor = "#E5E0D8")} required />
                </div>
                <textarea suppressHydrationWarning className="w-full rounded-xl px-4 py-3 text-[14px] outline-none resize-none" style={inputStyle} placeholder={lang === "en" ? `I'm interested in ${property.name}...` : lang === "th" ? `ฉันสนใจใน ${property.name}...` : `我对 ${property.name} 感兴趣...`} rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")} onBlur={(e) => (e.target.style.borderColor = "#E5E0D8")} />
                {errorMsg && (
                  <p className="text-[12px] px-1 flex items-center gap-1" style={{ color: "#E05252" }}>
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errorMsg}
                  </p>
                )}
                <button suppressHydrationWarning type="submit" disabled={status === "loading"} className="w-full py-3.5 rounded-xl text-[14px] font-semibold cursor-pointer border-none disabled:opacity-60" style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}>
                  {status === "loading" ? (t.sending || "Sending…") : `${t.sendEnquiry || "Send Enquiry"} →`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Similar card
───────────────────────────────────────────── */
function SimilarCard({ property }: { property: PropertyCard }) {
  const [imgErr, setImgErr] = useState(false);
  const { formatPrice: formatPriceFn } = useCurrency();
  const { lang } = useLanguage();
  const t = T_PROPERTY[lang] || T_PROPERTY.en;
  
  const priceLabelTranslated = property.listingType === "sale"
    ? ""
    : (property.priceLabel === " /month" || property.priceLabel === "/month"
      ? (lang === "en" ? " /month" : lang === "th" ? " /เดือน" : " /月")
      : (property.priceLabel || ""));

  return (
    <a href={`/property/${property.slug}`} className="no-underline rounded-2xl overflow-hidden block group" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
      <div className="relative h-36 overflow-hidden" style={{ background: "#1C3A2F" }}>
        {property.coverImage && !imgErr ? (
          <Image
            src={property.coverImage}
            alt={getDescriptiveAltText({ bedrooms: property.bedrooms, propertyType: property.propertyType, listingType: property.listingType, area: property.area, index: 0 })}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-3xl font-black" style={{ color: "rgba(255,255,255,0.08)" }}>NHP</span></div>
        )}
      </div>
      <div className="p-3">
        <div className="text-[14px] font-bold mb-0.5" style={{ color: "#1C3A2F" }}>
          {formatPriceFn(Number(property.priceTHB))}
          {priceLabelTranslated}
        </div>
        <div className="text-[12px] font-medium line-clamp-1 mb-1" style={{ color: "#1A1A1A" }}>{property.name}</div>
        <div className="text-[11px] flex items-center gap-3.5" style={{ color: "#999" }}>
          <span className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />{" "}
            {property.bedrooms === 0
              ? t.studio
              : `${property.bedrooms} ${property.bedrooms === 1 ? t.bed : t.beds}`}
          </span>
          <span className="flex items-center gap-1">
            <ShowerHead className="w-3.5 h-3.5" /> {property.bathrooms} {t.bath}
          </span>
          {property.sqm && (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" /> {property.sqm}m²
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

/* ─────────────────────────────────────────────
   Tour calendar — date + time picker modal
───────────────────────────────────────────── */
function TourCalendar({ property, onClose }: { property: PropertyCard; onClose: () => void }) {
  const { lang } = useLanguage();
  const t = T_PROPERTY[lang] || T_PROPERTY.en;
  const { data: session }   = useSession();
  const [selDate, setDate]  = useState<string | null>(null);
  const [selTime, setTime]  = useState<string | null>(null);
  const [name, setName]     = useState("");
  const [method, setMethod] = useState<"WhatsApp" | "Line">("WhatsApp");
  const [contact, setContact] = useState("");
  const { status, errorMsg, submit: sendEnquiry } = useEnquiry();

  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) {
        setName(session.user.name);
      }
      if (session.user.email && !contact) {
        setContact(session.user.email);
      }
    }
  }, [session, name, contact]);

  const step: "pick" | "done" = status === "done" ? "done" : "pick";

  /* ── Dropdown Date Picker Logic ── */
  const MONTHS = useMemo(() => [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ], []);

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();

  const [selMonth, setSelMonth] = useState<string>("");
  const [selDay, setSelDay]   = useState<string>("");
  const [selYear, setSelYear]  = useState<string>("");
  const [agentMsg, setAgentMsg] = useState<string>("");

  function daysInMonth(m: number, y: number) {
    if (!m) return 31;
    const yr = y || currentYear;
    return new Date(yr, m, 0).getDate();
  }

  // Pre-fill date to tomorrow on mount
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const m = String(tomorrow.getMonth() + 1);
    const d = String(tomorrow.getDate());
    const y = String(tomorrow.getFullYear());
    setSelMonth(m);
    setSelDay(d);
    setSelYear(y);
    const formattedM = m.padStart(2, "0");
    const formattedD = d.padStart(2, "0");
    setDate(`${y}-${formattedM}-${formattedD}`);
  }, [today]);

  const years = useMemo(
    () => [currentYear, currentYear + 1],
    [currentYear]
  );

  const maxDay = daysInMonth(Number(selMonth), Number(selYear));
  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => i + 1),
    [maxDay]
  );

  const handleDayChange = (v: string) => {
    setSelDay(v);
    updateIso(v, selMonth, selYear);
  };

  const handleMonthChange = (v: string) => {
    setSelMonth(v);
    let newDay = selDay;
    if (selDay && Number(selDay) > daysInMonth(Number(v), Number(selYear))) {
      newDay = "";
      setSelDay("");
    }
    updateIso(newDay, v, selYear);
  };

  const handleYearChange = (v: string) => {
    setSelYear(v);
    let newDay = selDay;
    if (selDay && Number(selDay) > daysInMonth(Number(selMonth), Number(v))) {
      newDay = "";
      setSelDay("");
    }
    updateIso(newDay, selMonth, v);
  };

  const updateIso = (d: string, m: string, y: string) => {
    if (d && m && y) {
      const formattedM = m.padStart(2, "0");
      const formattedD = d.padStart(2, "0");
      setDate(`${y}-${formattedM}-${formattedD}`);
    } else {
      setDate(null);
    }
  };

  const isDateComplete = Boolean(selDay && selMonth && selYear);
  const formattedDateString = isDateComplete
    ? `${selDay} ${MONTHS[Number(selMonth) - 1]} ${selYear}`
    : null;

  const times = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"];

  const { formatPrice: formatPriceFn } = useCurrency();

  const submit = async () => {
    if (!selDate || !selTime || !name || !contact) return;
    const tourDetails = `Tour requested for ${formattedDateString || selDate} at ${selTime}`;
    const fullMessage = agentMsg.trim()
      ? `${tourDetails}\n\nMessage to Agent: ${agentMsg.trim()}`
      : tourDetails;

    await sendEnquiry({
      propertySlug: property.slug,
      propertyName: property.name,
      listingType:  property.listingType,
      price:        formatPrice(property, formatPriceFn, lang),
      area:         property.area,
      name,
      contact,
      method,
      message:      fullMessage,
      source:       "tour",
      tourDate:     selDate,
      tourTime:     selTime,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {step === "done" ? (
            <div className="text-center py-6">
              <Calendar className="w-12 h-12 text-[#C9A84C] mx-auto mb-3" />
              <p className="text-[18px] font-bold mb-2" style={{ color: "#1C3A2F" }}>{t.tourRequested}</p>
              <p className="text-[13px] font-light mb-1" style={{ color: "#555" }}>
                {formattedDateString || selDate} at {selTime}
              </p>
              <p className="text-[12px] font-light mb-5" style={{ color: "#999" }}>
                {lang === "en" 
                  ? `We'll confirm via ${method} within 1 hour.` 
                  : lang === "th" 
                  ? `เราจะยืนยันผ่าน ${method} ภายใน 1 ชั่วโมง` 
                  : `我们将在 1 小时内通过 ${method} 进行确认。`}
              </p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer border-none" style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}>
                {t.close}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-[16px] font-bold" style={{ color: "#1C3A2F" }}>{t.scheduleTour}</h3>
                  <p className="text-[12px] mt-0.5" style={{ color: "#999" }}>{property.name}</p>
                </div>
                <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none text-base" style={{ background: "#EDE8DF", color: "#555", fontFamily: "inherit" }}>✕</button>
              </div>

              {/* ── Date Picker Dropdowns (Month, Day, Year) ── */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-[1px] font-semibold" style={{ color: "#999" }}>
                  {t.pickDate || "Pick a Date"}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#C9A84C]">
                  <Calendar size={13} />
                  <span>Tour Date</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                {/* Month */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.5px] mb-1" style={{ color: "#777" }}>
                    Month
                  </label>
                  <select
                    value={selMonth}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="w-full bg-[#F7F3EC] border border-[#E5E0D8] rounded-xl px-2 py-2.5 text-[13px] font-medium outline-none cursor-pointer focus:border-[#1C3A2F]"
                    style={{ color: "#1C3A2F", fontFamily: "inherit" }}
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.5px] mb-1" style={{ color: "#777" }}>
                    Day
                  </label>
                  <select
                    value={selDay}
                    onChange={(e) => handleDayChange(e.target.value)}
                    className="w-full bg-[#F7F3EC] border border-[#E5E0D8] rounded-xl px-2 py-2.5 text-[13px] font-medium outline-none cursor-pointer focus:border-[#1C3A2F]"
                    style={{ color: "#1C3A2F", fontFamily: "inherit" }}
                  >
                    <option value="">Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.5px] mb-1" style={{ color: "#777" }}>
                    Year
                  </label>
                  <select
                    value={selYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="w-full bg-[#F7F3EC] border border-[#E5E0D8] rounded-xl px-2 py-2.5 text-[13px] font-medium outline-none cursor-pointer focus:border-[#1C3A2F]"
                    style={{ color: "#1C3A2F", fontFamily: "inherit" }}
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selection Result Badge */}
              <div
                className={`mb-5 rounded-xl px-3.5 py-2 text-[12px] font-semibold text-center transition-all duration-200 ${
                  isDateComplete
                    ? "bg-[#1C3A2F]/10 text-[#1C3A2F] border border-[#1C3A2F]/20"
                    : "bg-[#FAF8F3] text-gray-400 border border-[#EDE8DF]"
                }`}
              >
                {formattedDateString ? `Selected Date: ${formattedDateString}` : "Select Month, Day, and Year"}
              </div>

              {/* ── Time ── */}
              <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5" style={{ color: "#999" }}>{t.pickTime}</p>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {times.map((t) => {
                  const isSel = selTime === t;
                  return (
                    <button key={t} onClick={() => setTime(t)}
                      className="py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer border-[1.5px] transition-all"
                      style={isSel
                        ? { background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F", fontFamily: "inherit" }
                        : { background: "#FFFFFF", color: "#444", borderColor: "#E5E0D8", fontFamily: "inherit" }
                      }
                    >{t}</button>
                  );
                })}
              </div>

              {/* ── Contact ── */}
              <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5" style={{ color: "#999" }}>{t.yourContact}</p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "en" ? "Your name" : lang === "th" ? "ชื่อของคุณ" : "您的姓名"}
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none mb-2"
                style={{ border: "1.5px solid #E5E0D8", background: "#F7F3EC", color: "#1A1A1A", fontFamily: "inherit" }}
              />

              {/* WhatsApp / Line selector + number */}
              <div className="flex gap-2 mb-4 w-full min-w-0">
                {/* Selector */}
                <div className="inline-flex rounded-xl overflow-hidden shrink-0" style={{ border: "1.5px solid #E5E0D8" }}>
                  {(["WhatsApp", "Line"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className="flex items-center gap-1.5 cursor-pointer border-none text-[12px] font-semibold transition-all"
                      style={{
                        padding: "0 12px",
                        background: method === m ? "#1C3A2F" : "#FFFFFF",
                        color:      method === m ? "#FFFFFF" : "#666",
                        fontFamily: "inherit",
                      }}
                    >
                      {m === "WhatsApp" ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zM12 .572C5.495.572.16 5.907.157 12.464c0 2.097.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 4.572"/></svg>
                      )}
                      {m}
                    </button>
                  ))}
                </div>
                {/* Number */}
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={method === "WhatsApp" ? t.whatsappPlaceholder : t.linePlaceholder}
                  className="flex-1 rounded-xl px-4 py-3 text-[14px] outline-none min-w-0"
                  style={{ border: "1.5px solid #E5E0D8", background: "#F7F3EC", color: "#1A1A1A", fontFamily: "inherit" }}
                />
              </div>

              {/* ── Message to Agent ── */}
              <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2" style={{ color: "#999" }}>
                Message to Agent
              </p>
              <textarea
                value={agentMsg}
                onChange={(e) => setAgentMsg(e.target.value)}
                placeholder={
                  lang === "en"
                    ? "Add any notes or special questions for the agent..."
                    : lang === "th"
                    ? "ข้อความถึงเอเจนต์..."
                    : "给中介的留言..."
                }
                rows={2}
                className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none resize-none mb-4 font-medium"
                style={{ border: "1.5px solid #E5E0D8", background: "#F7F3EC", color: "#1A1A1A", fontFamily: "inherit" }}
              />

              {errorMsg && (
                <p className="text-[12px] mb-3 px-1 flex items-center gap-1" style={{ color: "#E05252" }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errorMsg}
                </p>
              )}
              <button onClick={submit} disabled={!selDate || !selTime || !name || !contact || status === "loading"}
                className="w-full py-3.5 rounded-xl text-[14px] font-semibold cursor-pointer border-none disabled:opacity-50"
                style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
              >
                {status === "loading" ? (t.sending || "Sending…") : (t.requestTour || "Request Tour")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Recently viewed strip — sticky bottom row
───────────────────────────────────────────── */
function RecentlyViewedStrip({ currentId }: { currentId: number }) {
  const { ids } = useRecentlyViewed();
  const { lang } = useLanguage();
  const t = T_PROPERTY[lang] || T_PROPERTY.en;
  const items = ids.filter((id) => id !== currentId).slice(0, 4)
    .map((id) => MOCK_PROPERTIES.find((p) => p.id === id))
    .filter((p): p is PropertyCard => p != null);

  if (items.length === 0) return null;

  return (
    <div className="px-5 md:px-10 py-4 md:py-5" style={{ background: "#FFFFFF", borderTop: "1px solid #EDE8DF" }}>
      <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1A1A1A" }}>{t.recentlyViewed || "Recently viewed"}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => <SimilarCard key={p.id} property={p} />)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   NEARBY PLACES HELPERS
   ───────────────────────────────────────────── */
function formatLocationDisplay(district?: string, area?: string, lang: string = "en") {
  const cleanDistrict = district ? district.trim() : "";
  const cleanArea = area ? area.trim() : "";
  const bkk = lang === "en" ? "Bangkok" : lang === "th" ? "กรุงเทพฯ" : "曼谷";

  if (!cleanDistrict || cleanDistrict.toLowerCase() === cleanArea.toLowerCase()) {
    return `${cleanArea || "Bangkok"}, ${bkk}`;
  }
  return `${cleanDistrict}, ${cleanArea}, ${bkk}`;
}

function renderSeoDescription(property: PropertyCard, lang: Lang = "en") {
  const s = getStructuredSeoDescription(property, lang);

  const titles = {
    overview: lang === "th" ? "ภาพรวมและจุดเด่นยูนิต" : lang === "zh" ? "房源概览与核心亮点" : "Unit Overview & Highlights",
    interior: lang === "th" ? "สเปคและการตกแต่งภายใน" : lang === "zh" ? "室内配置与家具家电" : "Interior Specs & Furnishings",
    location: lang === "th" ? "ทำเล การเดินทาง BTS & สภาพแวดล้อม" : lang === "zh" ? "位置、轻轨交通与周边环境" : "Location, BTS Transit & Neighborhood",
    facilities: lang === "th" ? "สิ่งอำนวยความสะดวกและระบบรักษาความปลอดภัย" : lang === "zh" ? "大楼配套设施与安保" : "Building Facilities & Security",
    lease: lang === "th" ? "เงื่อนไขสัญญาเช่าและการย้ายเข้า" : lang === "zh" ? "租约与入住条款" : "Lease & Move-In Terms",
    additional: lang === "th" ? "รายละเอียดเพิ่มเติม" : lang === "zh" ? "其他房源细节" : "Property Details",
  };

  const sections = [
    { icon: "🏢", title: titles.overview, text: s.overview },
    { icon: "🛋️", title: titles.interior, text: s.interior },
    { icon: "📍", title: titles.location, text: s.location },
    { icon: "🏊", title: titles.facilities, text: s.facilities },
    { icon: "📋", title: titles.lease, text: s.lease },
  ];

  if (s.additional) {
    sections.push({ icon: "📝", title: titles.additional, text: s.additional });
  }

  return (
    <div className="space-y-6">
      {sections.map((sec, idx) => (
        <div key={idx} className="border-b border-gray-100/80 pb-4 last:border-none last:pb-0">
          <h4 className="text-[15px] sm:text-[16px] font-bold mb-2 flex items-center gap-2 font-outfit" style={{ color: "#1C3A2F" }}>
            <span className="text-[18px]">{sec.icon}</span>
            <span>{sec.title}</span>
          </h4>
          <p className="text-[14px] sm:text-[14.5px] leading-[1.8] font-normal text-gray-700 m-0">
            {sec.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function getDirectionsUrl(property: PropertyCard, placeName: string) {
  const origin = property.latitude && property.longitude
    ? `${property.latitude},${property.longitude}`
    : `${property.name}, Bangkok`;
  const destination = `${placeName}, ${property.area}, Bangkok`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
}

interface PropertyDetailProps {
  property: PropertyCard;
  siblings?: PropertyCard[];
  sameBuilding: PropertyCard[];
  nearby: PropertyCard[];
  sameArea?: PropertyCard[];
}

interface CommuteItem {
  name: string;
  minutes: number;
  distance: number;
  transitMode: "transit" | "driving" | "walking";
}

export default function PropertyDetail({
  property: rawProperty,
  siblings = [],
  sameBuilding,
  nearby,
  googleMapsApiKey,
}: Omit<PropertyDetailProps, "sameArea"> & { googleMapsApiKey?: string }) {
  const { lang } = useLanguage();
  const t = T_PROPERTY[lang] || T_PROPERTY.en;

  const property = {
    ...rawProperty,
    name: stripEmojis(rawProperty.name),
    area: stripEmojis(rawProperty.area),
    description: stripEmojis(
      enrichPropertyDescription({
        name: rawProperty.name,
        description: rawProperty.description,
        bedrooms: rawProperty.bedrooms,
        bathrooms: rawProperty.bathrooms,
        sqm: rawProperty.sqm,
        floor: rawProperty.floor,
        area: rawProperty.area,
        district: rawProperty.district,
        listingType: rawProperty.listingType,
        propertyType: rawProperty.propertyType,
        priceTHB: rawProperty.priceTHB,
        priceLabel: rawProperty.priceLabel,
        btsStation: rawProperty.btsStation,
        btsWalkMin: rawProperty.btsWalkMin,
        mrtStation: rawProperty.mrtStation,
        mrtWalkMin: rawProperty.mrtWalkMin,
        petFriendly: rawProperty.petFriendly,
        foreignQuota: rawProperty.foreignQuota,
        amenities: rawProperty.amenities,
      })
    ),
    district: stripEmojis(rawProperty.district),
  };
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [rawHubs, setRawHubs] = useState<StoredCommuteHub[]>([]);

  const buildingName = property.projectName || property.name;
  const buildingSlug = slugifyBuildingName(buildingName);

  // Custom commute calculator states
  const [customLocationName, setCustomLocationName] = useState("");
  const [customMode, setCustomMode] = useState<"transit" | "driving" | "walking">("transit");
  const [customResult, setCustomResult] = useState<{
    name: string;
    minutes: number;
    distance: number;
    latitude: number;
    longitude: number;
    transitMode: "transit" | "driving" | "walking";
  } | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState("");

  const handleCalculateCustomCommute = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcError("");
    setCustomResult(null);

    const query = customLocationName.trim();
    if (!query) {
      setCalcError(t.errorEmptyCalc);
      return;
    }

    setCalcLoading(true);
    try {
      // Resolve property coordinates with fallback geocoding if null or 0
      let pLat = Number(property.latitude);
      let pLng = Number(property.longitude);

      if (!pLat || !pLng || isNaN(pLat) || isNaN(pLng)) {
        const propQuery = `${property.name}, ${property.area}, Bangkok`;
        try {
          const propRes = await fetch(`/api/geocode?q=${encodeURIComponent(propQuery)}`);
          const propData = await propRes.json();
          if (propRes.ok && propData.success) {
            pLat = Number(propData.lat);
            pLng = Number(propData.lng);
          } else {
            // Fallback to area geocoding
            const areaRes = await fetch(`/api/geocode?q=${encodeURIComponent(property.area + ", Bangkok")}`);
            const areaData = await areaRes.json();
            if (areaRes.ok && areaData.success) {
              pLat = Number(areaData.lat);
              pLng = Number(areaData.lng);
            }
          }
        } catch (err) {
          console.warn("Failed to geocode property location:", err);
        }
      }

      if (!pLat || !pLng || isNaN(pLat) || isNaN(pLng)) {
        setCalcError(t.errorGeocode);
        return;
      }

      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setCalcError(data.error || t.errorPlaceNotFound);
        return;
      }

      const hLat = Number(data.lat);
      const hLng = Number(data.lng);

      if (isNaN(hLat) || isNaN(hLng)) {
        setCalcError("Invalid destination coordinates.");
        return;
      }

      // Calculate Haversine distance
      const R = 6371; // Earth radius in km
      const dLat = ((hLat - pLat) * Math.PI) / 180;
      const dLon = ((hLng - pLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pLat * Math.PI) / 180) *
          Math.cos((hLat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;

      let mins = 15;
      if (customMode === "walking") {
        mins = Math.round(dist * 12);
      } else if (customMode === "driving") {
        mins = Math.round(dist * 3 + 5);
      } else {
        mins = Math.round(dist * 2.5 + 8);
      }

      setCustomResult({
        name: data.name,
        latitude: hLat,
        longitude: hLng,
        transitMode: customMode,
        distance: dist,
        minutes: Math.max(1, mins),
      });
    } catch (err) {
      console.error("PropertyDetail: transit time calculation failed:", err);
      setCalcError("An error occurred during calculation. Please try again.");
    } finally {
      setCalcLoading(false);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nhp_commute_hubs");
      if (stored) {
        setRawHubs(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const commutes = useMemo<CommuteItem[]>(() => {
    if (!property.latitude || !property.longitude) return [];
    const pLat = Number(property.latitude);
    const pLng = Number(property.longitude);
    if (isNaN(pLat) || isNaN(pLng)) return [];

    return rawHubs.map((h: StoredCommuteHub) => {
      const hLat = Number(h.latitude);
      const hLng = Number(h.longitude);
      const R = 6371;
      const dLat = ((hLat - pLat) * Math.PI) / 180;
      const dLon = ((hLng - pLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pLat * Math.PI) / 180) *
          Math.cos((hLat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;

      let mins = 15;
      if (h.transitMode === "walking") {
        mins = Math.round(dist * 12);
      } else if (h.transitMode === "driving") {
        mins = Math.round(dist * 3 + 5);
      } else {
        mins = Math.round(dist * 2.5 + 8);
      }
      return {
        name: h.name,
        minutes: Math.max(1, mins),
        distance: dist,
        transitMode: h.transitMode,
      };
    });
  }, [rawHubs, property.latitude, property.longitude]);

  const nearbyPlaces = useMemo(() => getNearbyPlaces(property.area), [property.area]);
  const filteredPlaces = useMemo(() => {
    if (activeCategory === "All") return nearbyPlaces;
    return nearbyPlaces.filter((p) => p.category === activeCategory);
  }, [nearbyPlaces, activeCategory]);
  const [tourOpen, setTourOpen] = useState(false);
  const allImages = property.images?.length ? property.images : [property.coverImage ?? ""];
  const posted    = relativeDate(property.createdAt, lang);
  const { track } = useRecentlyViewed();
  const { formatPrice: formatPriceFn } = useCurrency();
  const rentSibling = siblings.find((s) => s.listingType === "rent");
  const shortStaySibling = siblings.find((s) => s.listingType === "short_stay");
  const hasPriceSwitcher = rentSibling && shortStaySibling && (property.listingType === "rent" || property.listingType === "short_stay");

  // Real-time View Tracking State
  const [views, setViews] = useState<number>(property.viewCount ?? viewCount(property));

  // Selected Place State for Interactive Map


  const areaFacilities = getDynamicFacilities(property);

  // Track this property as recently viewed and track active view engagement
  useEffect(() => {
    track(property.id);
    fetch(`/api/properties/${property.id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view", page: window.location.pathname }),
    })
      .then((res) => {
        if (res.ok) {
          setViews((v: number) => v + 1);
        }
      })
      .catch(() => {});
  }, [property.id, track]);

  /* ── Right-sidebar stats (Beds | Baths | Sq Ft | Garage) ── */
  const parkingValue = getDynamicParking(property.description, property.id, property.propertyType).split(" ")[0];

  // Find matching neighborhood pillar page for breadcrumb link
  const matchingNeighborhood = NEIGHBORHOODS.find((n) => {
    const areaLower = property.area.toLowerCase().trim();
    return (
      n.slug.toLowerCase() === areaLower ||
      n.name.toLowerCase().trim() === areaLower ||
      n.aliases?.some((alias) => alias.toLowerCase().trim() === areaLower)
    );
  });
  const neighborhoodHref = matchingNeighborhood
    ? `/neighborhood/${matchingNeighborhood.slug.toLowerCase()}`
    : `/explore?area=${encodeURIComponent(property.area)}`;

  return (
    <div>
      {property.status === "unlisted" && (
        <div className="px-5 md:px-10 py-3.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-[13px] font-medium flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <span>This listing is currently unlisted. It is only accessible via direct link.</span>
        </div>
      )}

      {/* ── Breadcrumb + Back to Search ── */}
      <div className="px-5 md:px-10 py-4 flex items-center justify-between" style={{ background: "#F7F3EC", borderBottom: "1px solid #EDE8DF" }}>
        <div className="flex items-center gap-2 text-[12px] overflow-x-auto no-scrollbar">
          <Link href="/" className="no-underline transition-opacity hover:opacity-70" style={{ color: "#999" }}>{lang === "en" ? "Home" : lang === "th" ? "หน้าแรก" : "首页"}</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <Link href="/explore" className="no-underline transition-opacity hover:opacity-70" style={{ color: "#999" }}>{listingBadge(property.listingType, lang)}</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <Link href={neighborhoodHref} className="no-underline transition-opacity hover:opacity-70 whitespace-nowrap" style={{ color: "#999" }}>{translateArea(property.area, lang)}</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <span className="font-semibold whitespace-nowrap" style={{ color: "#1C3A2F" }}>{property.name}</span>
        </div>
        <Link href="/explore" className="hidden md:flex items-center gap-1.5 text-[12px] font-medium no-underline transition-opacity hover:opacity-70 whitespace-nowrap" style={{ color: "#1C3A2F" }}>
          <Icon.chevL /> {lang === "en" ? "Back to Search" : lang === "th" ? "กลับไปที่การค้นหา" : "返回搜索"}
        </Link>
      </div>

      {/* ── Main layout ── */}
      <div className="px-5 md:px-10 pt-6 pb-2 md:pt-8 md:pb-4">
        <div className="md:grid md:grid-cols-[1fr_400px] md:gap-4 lg:gap-5">

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <div>

            {/* ── MOBILE PART A — chips + title + location BEFORE gallery ── */}
            <div className="md:hidden mb-4">
              {/* Trust chips row */}
              <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar flex-nowrap whitespace-nowrap pb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FAF8F3", color: "#1C3A2F", border: "1px solid #EDE8DF" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {views.toLocaleString()} {t.views}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.12)", color: "#2E7D4F", border: "1px solid rgba(74,222,128,0.3)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  {lastVerifiedLabel(property, lang)}
                </span>
                {posted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FAF8F3", color: "#999", border: "1px solid #EDE8DF" }}>
                    <span className="text-[10px]"><Icon.calendar /></span>
                    {posted}
                  </span>
                )}
              </div>

              {/* Subtitle Badge */}
              <div className="text-[11px] font-bold tracking-[1px] uppercase mb-1 font-outfit" style={{ color: "#C9A84C" }}>
                {formatSubtitleBadge(property, lang)}
              </div>

              {/* Title */}
              <h1 className="text-[22px] font-bold mb-1.5 leading-tight font-outfit" style={{ color: "#1A1A1A", letterSpacing: "-0.4px" }}>
                {property.name}
              </h1>

              {/* Location — clickable Google Maps link */}
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(property.name + " " + (property.district ?? "") + " " + property.area + " Bangkok")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] no-underline transition-opacity hover:opacity-70"
                style={{ color: "#888" }}
              >
                <span style={{ color: "#1C3A2F" }}><Icon.pin /></span>
                <span style={{ borderBottom: "1px solid #ccc" }}>
                  {formatLocationDisplay(property.district, translateArea(property.area, lang), lang)}
                </span>
              </a>

              {/* Commute Times */}
              {commutes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {commutes.map((c) => (
                    <span
                      key={c.name}
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg"
                      style={{ background: "#FAF8F3", color: "#1C3A2F", border: "1px solid #EDE8DF" }}
                      title={`${c.distance.toFixed(1)} km away`}
                    >
                      {c.transitMode === "walking" ? (
                        <Footprints className="w-3.5 h-3.5" />
                      ) : c.transitMode === "driving" ? (
                        <Car className="w-3.5 h-3.5" />
                      ) : (
                        <TrainFront className="w-3.5 h-3.5" />
                      )}
                      <span>{c.minutes}{lang === "en" ? "m" : lang === "th" ? " นาที" : "分钟"} {lang === "en" ? "to" : lang === "th" ? "ไปยัง" : "至"} {c.name}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Condo Building Profile CTA — Mobile View Luxury Pill */}
              {buildingSlug && (
                <div className="mt-3">
                  <Link
                    href={`/building/${buildingSlug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/building/${buildingSlug}`);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      router.push(`/building/${buildingSlug}`);
                    }}
                    className="group flex items-center justify-between px-3.5 py-2.5 rounded-2xl no-underline transition-all border shadow-xs active:scale-[0.98] cursor-pointer relative z-10 select-none"
                    style={{
                      background: "#FAF8F3",
                      borderColor: "#EDE8DF",
                      touchAction: "manipulation",
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ background: "#1C3A2F", color: "#C9A84C" }}
                      >
                        <Building2 size={15} />
                      </div>
                      <div className="text-left truncate pointer-events-none">
                        <div className="flex items-center gap-1.5 pointer-events-none">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-[#C9A84C]">
                            Official Building Profile
                          </span>
                          <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                            Verified
                          </span>
                        </div>
                        <span className="text-[12.5px] font-bold text-[#1C3A2F] group-hover:text-[#C9A84C] transition-colors truncate block pointer-events-none">
                          {buildingName}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-[#1C3A2F] group-hover:text-[#C9A84C] inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-all whitespace-nowrap ml-2 pointer-events-none">
                      Explore <ChevronRight size={13} className="text-[#C9A84C]" />
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Gallery */}
            <Gallery
              images={allImages}
              name={property.name}
              isFeatured={property.featured}
              propertyId={property.id}
              area={property.area}
              bedrooms={property.bedrooms}
              listingType={property.listingType}
              propertyType={property.propertyType}
            />

            {/* Mobile Price, Stats, and Switcher Block - Mobile Only (under images section) */}
            <div className="md:hidden mt-4 rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #EDE8DF", boxShadow: "none" }}>
              {/* Gold price (currency-aware) */}
              <div className="text-[24px] font-bold mt-1 mb-2.5" style={{ color: "#C9A84C", letterSpacing: "-0.8px", lineHeight: 1 }}>
                {formatPriceFn(Number(property.priceTHB))}
                {property.listingType !== "sale" && (
                  <span className="text-[13px] font-normal ml-1" style={{ color: "#555" }}>
                    {property.priceLabel ?? t.month}
                  </span>
                )}
              </div>

              {/* Stats Horizontal Row */}
              <div className="flex items-center flex-nowrap gap-x-2.5 xs:gap-x-3.5 text-[11px] xs:text-[12px] font-medium border-t pt-3.5 mt-3 mb-1.5 whitespace-nowrap" style={{ color: "#555", borderColor: "#EDE8DF" }}>
                <div className="flex items-center gap-1.5">
                  <span style={{ color: "#1C3A2F" }}><Icon.bed /></span>
                  <span>{property.bedrooms === 0 ? t.studio : `${property.bedrooms} ${property.bedrooms === 1 ? t.bed : t.beds}`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span style={{ color: "#1C3A2F" }}><Icon.bath /></span>
                  <span>{property.bathrooms} {t.bath}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span style={{ color: "#1C3A2F" }}><Icon.garage /></span>
                  <span>{parkingValue} {t.parking}</span>
                </div>
                {property.sqm && (
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: "#1C3A2F" }}><Icon.sqft /></span>
                    <span>{property.sqm} m²</span>
                  </div>
                )}
              </div>

              {/* Rental Duration Switcher */}
              {hasPriceSwitcher && rentSibling && shortStaySibling && (
                <div className="mt-3 mb-2 p-3.5 rounded-xl border flex flex-col gap-2.5" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                  <div className="text-[10px] font-bold uppercase tracking-[1.5px]" style={{ color: "#8B7E66" }}>
                    {t.rentContractOptions}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Long Term (1 Year) */}
                    {property.listingType === "rent" ? (
                      <div
                        className="flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-default"
                        style={{
                          background: "#E8F4F0",
                          borderColor: "#2D7D62",
                          color: "#1C3A2F",
                          boxShadow: "0 2px 8px rgba(45,125,98,0.08)"
                        }}
                      >
                        <span className="text-[11px] font-bold">{t.longTerm}</span>
                        <span className="text-[8px] opacity-75 font-medium">{t.yearContract1}</span>
                        <span className="text-[12px] font-extrabold mt-1" style={{ color: "#1C3A2F" }}>
                          {formatPriceFn(Number(rentSibling.priceTHB))}{t.mo}
                        </span>
                      </div>
                    ) : (
                      <a
                        href={`/property/${rentSibling.slug}`}
                        className="flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all hover:scale-[1.02] no-underline hover:border-gray-400"
                        style={{
                          background: "#FFFFFF",
                          borderColor: "#EDE8DF",
                          color: "#666",
                        }}
                      >
                        <span className="text-[11px] font-bold">{t.longTerm}</span>
                        <span className="text-[8px] text-gray-400">{t.yearContract1}</span>
                        <span className="text-[12px] font-semibold mt-1" style={{ color: "#C9A84C" }}>
                          {formatPriceFn(Number(rentSibling.priceTHB))}{t.mo}
                        </span>
                      </a>
                    )}

                    {/* Short Term (3-6 Months) */}
                    {property.listingType === "short_stay" ? (
                      <div
                        className="flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-default"
                        style={{
                          background: "#E8F4F0",
                          borderColor: "#2D7D62",
                          color: "#1C3A2F",
                          boxShadow: "0 2px 8px rgba(45,125,98,0.08)"
                        }}
                      >
                        <span className="text-[11px] font-bold">{t.shortTerm}</span>
                        <span className="text-[8px] opacity-75 font-medium">{t.months3to6}</span>
                        <span className="text-[12px] font-extrabold mt-1" style={{ color: "#1C3A2F" }}>
                          {formatPriceFn(Number(shortStaySibling.priceTHB))}{t.mo}
                        </span>
                      </div>
                    ) : (
                      <a
                        href={`/property/${shortStaySibling.slug}`}
                        className="flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all hover:scale-[1.02] no-underline hover:border-gray-400"
                        style={{
                          background: "#FFFFFF",
                          borderColor: "#EDE8DF",
                          color: "#666",
                        }}
                      >
                        <span className="text-[11px] font-bold">{t.shortTerm}</span>
                        <span className="text-[8px] text-gray-400">{t.months3to6}</span>
                        <span className="text-[12px] font-semibold mt-1" style={{ color: "#C9A84C" }}>
                          {formatPriceFn(Number(shortStaySibling.priceTHB))}{t.mo}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── 2-Column Content Block (About on left, Amenities & Location stacked on right) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mt-3.5 lg:mt-6 items-stretch">
              
              {/* Column 1: ABOUT THIS PROPERTY */}
              <div className="rounded-2xl p-6 transition-all duration-300 flex flex-col lg:h-0 lg:min-h-full overflow-hidden" style={{ background: "#ffffff", border: "none", boxShadow: "none" }}>
                <h3 className="text-[12px] font-bold uppercase tracking-[1.5px] mb-4 font-outfit" style={{ color: "#C9A84C" }}>
                  {t.aboutProperty}
                </h3>
                <div className="flex-1 min-h-[340px] max-h-[450px] overflow-y-auto pr-3 mb-4 custom-scrollbar">
                  {renderSeoDescription(rawProperty, lang)}
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex-shrink-0">
                  <h4 className="text-[12px] font-bold uppercase tracking-[1px] mb-3 font-outfit" style={{ color: "#1C3A2F" }}>
                    {t.highlights}
                  </h4>
                  <ul className="list-none p-0 m-0 grid grid-cols-2 gap-y-2 gap-x-4">
                    {(property.features && property.features.length > 0
                      ? property.features
                      : [
                          "Fully furnished",
                          "Air conditioning",
                          "Television",
                          "Sofa",
                          "Modern kitchen"
                        ]
                    ).map((hl, i) => (
                      <li key={i} className="flex items-center text-[12.5px] text-gray-600 font-light truncate">
                        <span className="text-[#C9A84C] font-bold mr-2 flex-shrink-0 text-[13px]">✓</span>
                        <span className="truncate">{translateFeature(hl, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Neighborhood Guide CTA Block */}
                {NEIGHBORHOODS.some(
                  (n) => n.slug.toLowerCase() === getAreaSlug(property.area).toLowerCase()
                ) && (
                  <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#C9A84C]">{lang === "en" ? "Local Guide" : lang === "th" ? "คู่มือท้องถิ่น" : "本地指南"}</span>
                      <h4 className="text-[13.5px] font-bold text-[#1C3A2F] leading-tight">
                        {t.livingIn} {translateArea(property.area, lang)}
                      </h4>
                      <p className="text-[11.5px] text-gray-500 font-light leading-normal">
                        {t.guideSubtitle}
                      </p>
                    </div>
                    <Link
                      href={`/neighborhood/${getAreaSlug(property.area)}`}
                      className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold no-underline text-center text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                      style={{ background: "#1C3A2F" }}
                    >
                      {t.readGuide} &rarr;
                    </Link>
                  </div>
                )}
              </div>

              {/* Column 2: AMENITIES & LOCATION Stacked */}
              <div className="flex flex-col gap-4">
                
                {/* AMENITIES card */}
                <div className="rounded-2xl p-6 transition-all duration-300" style={{ background: "#ffffff", border: "none", boxShadow: "none" }}>
                  <h3 className="text-[12px] font-bold uppercase tracking-[1.5px] mb-5 font-outfit" style={{ color: "#C9A84C" }}>
                    {t.amenities}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-5 gap-x-3">
                    {(property.amenities && property.amenities.length > 0
                      ? property.amenities
                      : [
                          "Swimming Pool",
                          "Fitness Center",
                          "24h Security",
                          "Parking"
                        ]
                    ).map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-[13px] text-gray-600 font-light">
                        <span className="text-[#1C3A2F] flex-shrink-0">{getAmenityIcon(amenity)}</span>
                        <span className="truncate">{translateAmenity(amenity, lang)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LOCATION card */}
                <div className="rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between" style={{ background: "#ffffff", border: "none", boxShadow: "none" }}>
                  <div>
                    <h3 className="text-[12px] font-bold uppercase tracking-[1.5px] mb-5 font-outfit" style={{ color: "#C9A84C" }}>
                      {t.location}
                    </h3>
                    
                    {/* Light Cartographic Map Container */}
                    {property.latitude && property.longitude ? (
                      <div className="mb-4" style={{ height: 220 }}>
                        <CommuteMap
                          propertyLat={Number(property.latitude)}
                          propertyLng={Number(property.longitude)}
                          propertyName={cleanMapLabel(property.name)}
                          googleMapsApiKey={googleMapsApiKey}
                          commuteHubs={[
                            ...rawHubs.map(h => ({
                              name: h.name,
                              latitude: h.latitude,
                              longitude: h.longitude,
                              transitMode: h.transitMode
                            })),
                            ...(customResult ? [{
                              name: `Custom: ${customResult.name}`,
                              latitude: customResult.latitude,
                              longitude: customResult.longitude,
                              transitMode: customResult.transitMode
                            }] : [])
                          ]}
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl overflow-hidden relative mb-4" style={{ height: 150, background: "#F0EBE1", border: "1px solid #E8E2D6" }}>
                        {/* Road grid lines */}
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 150">
                          {/* Horizontal roads */}
                          <line x1="0" y1="40" x2="300" y2="42" stroke="#DDD7CA" strokeWidth="3" />
                          <line x1="0" y1="75" x2="300" y2="73" stroke="#E3DDD0" strokeWidth="5" />
                          <line x1="0" y1="110" x2="300" y2="112" stroke="#DDD7CA" strokeWidth="2.5" />
                          {/* Vertical roads */}
                          <line x1="60" y1="0" x2="58" y2="150" stroke="#DDD7CA" strokeWidth="2.5" />
                          <line x1="150" y1="0" x2="152" y2="150" stroke="#E3DDD0" strokeWidth="4" />
                          <line x1="230" y1="0" x2="228" y2="150" stroke="#DDD7CA" strokeWidth="2" />
                          {/* Diagonal accent road */}
                          <line x1="20" y1="0" x2="280" y2="150" stroke="#E3DDD0" strokeWidth="2" opacity="0.5" />
                          {/* Small blocks / green areas */}
                          <rect x="70" y="48" width="30" height="20" rx="3" fill="#C8D4BC" opacity="0.5" />
                          <rect x="170" y="80" width="25" height="25" rx="3" fill="#C8D4BC" opacity="0.4" />
                          <rect x="100" y="15" width="35" height="18" rx="3" fill="#D6CFC2" opacity="0.5" />
                          <rect x="200" y="30" width="20" height="30" rx="3" fill="#D6CFC2" opacity="0.4" />
                          <rect x="35" y="90" width="18" height="15" rx="2" fill="#C8D4BC" opacity="0.35" />
                          <rect x="245" y="95" width="28" height="18" rx="3" fill="#D6CFC2" opacity="0.4" />
                        </svg>
                        {/* Pin + Label */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                          {/* Pin */}
                          <div className="flex flex-col items-center">
                            <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
                              <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#1C3A2F"/>
                              <circle cx="14" cy="13" r="5.5" fill="#ffffff"/>
                            </svg>
                          </div>
                          {/* Property label */}
                          <span className="mt-1 text-[8px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.9)", color: "#1C3A2F", whiteSpace: "nowrap", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis" }} title={property.name}>
                            {cleanMapLabel(property.name)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Travel facilities list */}
                    <div className="space-y-2.5 mb-4">
                      {areaFacilities.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-[12px]">
                          <span className="flex-shrink-0" style={{ color: "#1C3A2F" }}>
                            {f.type === "transit" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 15h8M12 2v13"/></svg>}
                            {f.type === "hospital" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M12 8v8M8 12h8"/></svg>}
                            {f.type === "mall" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>}
                            {f.type === "cafe" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/></svg>}
                            {f.type === "school" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>}
                          </span>
                          <span className="font-medium truncate" style={{ color: "#1A1A1A" }}>{f.name}</span>
                          <span className="ml-auto text-[11px] flex-shrink-0" style={{ color: "#999" }}>{translateDistance(f.distance, lang)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Commute Calculator UI */}
                  <div className="mt-4 pt-4 border-t border-[#EDE8DF] mb-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-2.5 font-outfit">
                      {t.commuteTitle}
                    </h4>
                    <form onSubmit={handleCalculateCustomCommute} className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t.commutePlaceholder}
                          value={customLocationName}
                          onChange={(e) => setCustomLocationName(e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 text-[12px] rounded-xl border border-[#EDE8DF] outline-none bg-white font-light"
                          style={{ fontFamily: "inherit" }}
                        />
                        <button
                          type="submit"
                          disabled={calcLoading}
                          className="flex-shrink-0 px-4 py-2 text-[12px] font-bold text-white rounded-xl bg-[#1C3A2F] hover:bg-[#152c23] transition-colors cursor-pointer disabled:opacity-50"
                          style={{ fontFamily: "inherit" }}
                        >
                          {calcLoading ? t.calculating : t.calculate}
                        </button>
                      </div>

                      {/* Transport mode selector pills */}
                      <div className="flex gap-1.5">
                        {(["transit", "driving", "walking"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setCustomMode(mode)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                              customMode === mode
                                ? "bg-[#1C3A2F] text-white border-[#1C3A2F]"
                                : "bg-white text-gray-500 border-[#EDE8DF] hover:bg-gray-50"
                            }`}
                            style={{ fontFamily: "inherit" }}
                          >
                            <span className="flex items-center gap-1">
                              {mode === "transit" ? (
                                <TrainFront className="w-3.5 h-3.5" />
                              ) : mode === "driving" ? (
                                <Car className="w-3.5 h-3.5" />
                              ) : (
                                <Footprints className="w-3.5 h-3.5" />
                              )}
                              {mode === "transit" ? t.transit : mode === "driving" ? t.driving : t.walking}
                            </span>
                          </button>
                        ))}
                      </div>

                      {calcError && (
                        <p className="text-[11px] text-red-500 font-semibold">{calcError}</p>
                      )}

                      {customResult && (
                        <div className="p-3 rounded-xl border bg-[#FAF8F3] border-[#EDE8DF] relative">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomResult(null);
                              setCustomLocationName("");
                            }}
                            className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 border-none text-[10px] text-gray-600 cursor-pointer"
                            title="Clear result"
                          >
                            ✕
                          </button>
                          <p className="text-[11px] font-bold text-[#1C3A2F] mb-1">
                            {t.estimatedCommute}
                          </p>
                          <p className="text-[11px] text-gray-600 leading-normal font-light">
                            {lang === "zh" ? (
                              <>
                                <span className="inline-flex items-center gap-1.5 align-middle">
                                  {customResult.transitMode === "walking" ? (
                                    <Footprints className="w-3.5 h-3.5" />
                                  ) : customResult.transitMode === "driving" ? (
                                    <Car className="w-3.5 h-3.5" />
                                  ) : (
                                    <TrainFront className="w-3.5 h-3.5" />
                                  )}
                                  <span>{customResult.transitMode === "walking" ? t.walking : customResult.transitMode === "driving" ? t.driving : t.publicTransit}</span>
                                </span>{" "}
                                {t.fromPropertyTo} <strong className="font-semibold">{customResult.name}</strong> {t.takes} <strong className="text-[#C9A84C] font-semibold">{customResult.minutes} {t.mins}</strong> ({customResult.distance.toFixed(1)} km)。
                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center gap-1.5 align-middle">
                                  {customResult.transitMode === "walking" ? (
                                    <Footprints className="w-3.5 h-3.5" />
                                  ) : customResult.transitMode === "driving" ? (
                                    <Car className="w-3.5 h-3.5" />
                                  ) : (
                                    <TrainFront className="w-3.5 h-3.5" />
                                  )}
                                  <span>{customResult.transitMode === "walking" ? t.walking : customResult.transitMode === "driving" ? t.driving : t.publicTransit}</span>
                                </span>{" "}
                                {t.takes} <strong className="text-[#C9A84C] font-semibold">{customResult.minutes} {t.mins}</strong> ({customResult.distance.toFixed(1)} km) {t.fromPropertyTo} <strong className="font-semibold">{customResult.name}</strong>.
                              </>
                            )}
                          </p>
                        </div>
                      )}
                    </form>
                  </div>
                  
                  {/* Google Maps Link */}
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(property.name + " " + (property.district ?? property.area) + " Bangkok")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold no-underline transition-opacity hover:opacity-70 pt-2"
                    style={{ color: "#C9A84C" }}
                  >
                    {t.viewOnGoogleMaps} →
                  </a>
                </div>

                {/* At a Glance Box - Mobile Only (rendered under Location card) */}
                <div className="lg:hidden rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Property Type */}
                    <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                        <span style={{ color: "#1C3A2F" }}><Icon.home /></span>
                        <span>{t.specs.type}</span>
                      </div>
                      <div className="text-[12px] font-bold mt-1 capitalize" style={{ color: "#1A1A1A" }}>
                        {translatePropertyType(property.propertyType, lang)}
                      </div>
                    </div>

                    {/* Floor */}
                    <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                        <span style={{ color: "#1C3A2F" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m16 14-4-4-4 4"/></svg>
                        </span>
                        <span>{t.specs.floor}</span>
                      </div>
                      <div className="text-[12px] font-bold mt-1" style={{ color: "#1A1A1A" }}>
                        {(() => {
                          const fl = property.floor ? String(property.floor) : getDynamicFloor(property.description, property.id, property.propertyType).split(" / ")[0];
                          return fl === "Ground" ? (lang === "en" ? "Ground" : lang === "th" ? "ชั้นกราวด์" : "地面层") : fl;
                        })()}
                      </div>
                    </div>

                    {/* Total Floors */}
                    <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                        <span style={{ color: "#1C3A2F" }}><Icon.stories /></span>
                        <span>{t.specs.totalFloors}</span>
                      </div>
                      <div className="text-[12px] font-bold mt-1" style={{ color: "#1A1A1A" }}>
                        {property.totalFloors ? String(property.totalFloors) : getDynamicFloor(property.description, property.id, property.propertyType).split(" / ")[1] || "—"}
                      </div>
                    </div>

                    {/* Pet Friendly */}
                    <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                        <span style={{ color: "#1C3A2F" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S8.83 8 8 8zm8 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S16.83 8 16 8zm-4 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                        </span>
                        <span>{t.specs.pets}</span>
                      </div>
                      <div className="text-[12px] font-bold mt-1" style={{ color: "#1A1A1A" }}>
                        {property.petFriendly || houseRulesDefaults(property).pets ? t.specs.yes : t.specs.no}
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                        <span style={{ color: "#1C3A2F" }}><Icon.calendar /></span>
                        <span>{t.specs.available}</span>
                      </div>
                      <div className="text-[12px] font-bold mt-1 leading-tight truncate" style={{ color: "#1A1A1A" }}>
                        {availableFromLabel(property, lang)}
                      </div>
                    </div>

                    {/* Min Stay */}
                    <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                        <span style={{ color: "#1C3A2F" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </span>
                        <span>{t.specs.minStay}</span>
                      </div>
                      <div className="text-[12px] font-bold mt-1 truncate" style={{ color: "#1A1A1A" }}>
                        {property.listingType === "sale"
                          ? t.specs.freehold
                          : property.listingType === "short_stay"
                            ? (property.leaseTerms === "3 Months" || !property.leaseTerms ? t.specs.months3 : property.leaseTerms)
                            : (property.leaseTerms === "12 Months" || !property.leaseTerms ? t.specs.months12 : property.leaseTerms)
                        }
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* FAQ section — Mobile view only (placed before Nearby Places) */}
            <div className="block md:hidden mt-6 mb-2">
              <ListingFaqBlock property={property} />
            </div>

            {/* ── NEARBY PLACES Section ── */}
            <div className="rounded-2xl p-6 mt-6 mb-8" style={{ background: "#ffffff", border: "none", boxShadow: "none" }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[12px] font-bold uppercase tracking-[1.5px] font-outfit" style={{ color: "#C9A84C" }}>
                  {t.nearbyPlaces}
                </h3>
                <a
                  href={`https://www.google.com/maps/search/places+near+${encodeURIComponent(property.area + " Bangkok")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-semibold no-underline transition-opacity hover:opacity-70"
                  style={{ color: "#C9A84C" }}
                >
                  {t.viewAllPlaces} →
                </a>
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4">
                {["All", "BTS/MRT", "Cafes", "Restaurants", "Shopping", "Fitness", "Parks", "Co-working", "Markets", "Hospitals"].map((cat) => {
                  const catKey = cat === "BTS/MRT" ? "bts/mrt" : cat.toLowerCase();
                  const catLabel = t.nearbyCategories[catKey as keyof typeof t.nearbyCategories] || cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className="px-4 py-2 rounded-full text-[12px] font-semibold cursor-pointer border transition-all whitespace-nowrap flex-shrink-0"
                      style={{
                        background: activeCategory === cat ? "#1C3A2F" : "#FFFFFF",
                        color: activeCategory === cat ? "#FFFFFF" : "#555",
                        borderColor: activeCategory === cat ? "#1C3A2F" : "#E5E0D8",
                        fontFamily: "inherit",
                      }}
                    >
                      {catLabel}
                    </button>
                  );
                })}
              </div>

              {/* Places grid — each card fetches a real Google Places photo */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {filteredPlaces.slice(0, 6).map((place, idx) => (
                  <PlacePhotoCard
                    key={idx}
                    place={{ ...place, area: property.area }}
                    property={property}
                    getDirectionsUrlFn={getDirectionsUrl}
                  />
                ))}
              </div>

              {/* Empty state */}
              {filteredPlaces.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[13px]" style={{ color: "#999" }}>{t.noPlacesFound}</p>
                </div>
              )}
            </div>


            {/* Similar properties — building → nearby */}
            {(sameBuilding.length + nearby.length) > 0 && (
              <div className="pb-0" style={{ borderTop: "1px solid #EDE8DF", paddingTop: 32 }}>

                {sameBuilding.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-[17px] font-bold mb-1" style={{ color: "#1A1A1A" }}>
                      {t.moreFromBuilding}
                    </h2>
                    <p className="text-[12px] mb-4" style={{ color: "#999" }}>{t.otherCondoUnits}</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {sameBuilding.map((p) => <SimilarCard key={p.id} property={p} />)}
                    </div>
                  </div>
                )}

                {nearby.length > 0 && (
                  <div>
                    <h2 className="text-[17px] font-bold mb-1" style={{ color: "#1A1A1A" }}>
                      {t.nearbyProperties}
                    </h2>
                    <p className="text-[12px] mb-4" style={{ color: "#999" }}>
                      {t.justMinsFrom.includes("{area}") 
                        ? t.justMinsFrom.replace("{area}", translateArea(property.area, lang)) 
                        : `${t.justMinsFrom} ${translateArea(property.area, lang)}`}
                    </p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {nearby.map((p) => <SimilarCard key={p.id} property={p} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
          <div className="hidden md:block">
            <div className="sticky top-20 flex flex-col gap-5">

              {/* Sidebar Combined Container: Name, Price, Details, Tour and Enquiry */}
              <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
                
                {/* Trust Badge Chips Row (views, verified, posted) side-by-side on desktop */}
                <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap overflow-x-auto no-scrollbar mb-4">
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "#FAF8F3", color: "#1C3A2F", border: "1px solid #EDE8DF" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {views.toLocaleString()} {t.views}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(74,222,128,0.12)", color: "#2E7D4F", border: "1px solid rgba(74,222,128,0.3)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    {lastVerifiedLabel(property, lang)}
                  </span>
                  {posted && (
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "#FAF8F3", color: "#999", border: "1px solid #EDE8DF" }}>
                      <span className="text-[9.5px]"><Icon.calendar /></span>
                      {posted}
                    </span>
                  )}
                </div>

                {/* Subtitle Badge */}
                <div className="text-[12px] font-bold tracking-[1px] uppercase mb-1 font-outfit" style={{ color: "#C9A84C" }}>
                  {formatSubtitleBadge(property, lang)}
                </div>

                {/* Property Name Title — desktop (mobile has the single <h1> for mobile-first indexing) */}
                <h2 className="text-[26px] font-bold mb-1.5 leading-tight font-outfit" style={{ color: "#1A1A1A", letterSpacing: "-0.5px" }}>
                  {property.name}
                </h2>

                {/* Location — clickable Google Maps link */}
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(property.name + " " + (property.district ?? "") + " " + property.area + " Bangkok")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] mb-2.5 no-underline transition-opacity hover:opacity-70"
                  style={{ color: "#888" }}
                >
                  <span style={{ color: "#1C3A2F" }}><Icon.pin /></span>
                  <span style={{ borderBottom: "1px solid #ccc" }}>
                    {formatLocationDisplay(property.district, translateArea(property.area, lang), lang)}
                  </span>
                </a>

                {/* Building Pillar Page Link */}
                <div className="mb-3">
                  <Link
                    href={`/building/${slugifyBuildingName(property.projectName || property.name)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const bSlug = slugifyBuildingName(property.projectName || property.name);
                      if (bSlug) router.push(`/building/${bSlug}`);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const bSlug = slugifyBuildingName(property.projectName || property.name);
                      if (bSlug) router.push(`/building/${bSlug}`);
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold no-underline px-2.5 py-1 rounded-lg border transition-all hover:bg-[#FAF8F3] active:scale-[0.98] cursor-pointer relative z-10 select-none"
                    style={{ background: "#FFFFFF", color: "#1C3A2F", borderColor: "#EDE8DF", touchAction: "manipulation" }}
                  >
                    <span className="pointer-events-none">
                      {lang === "th"
                        ? `🏢 ดูคู่มือโครงการและยูนิตทั้งหมดของ ${property.projectName || property.name} →`
                        : lang === "zh"
                        ? `🏢 查看 ${property.projectName || property.name} 项目指南与所有房源 →`
                        : `🏢 View ${property.projectName || property.name} Building Guide & All Units →`}
                    </span>
                  </Link>
                </div>

                {/* Commute Times */}
                {commutes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4 mt-1">
                    {commutes.map((c) => (
                      <span
                        key={c.name}
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg"
                        style={{ background: "#FAF8F3", color: "#1C3A2F", border: "1px solid #EDE8DF" }}
                        title={`${c.distance.toFixed(1)} km away`}
                      >
                        {c.transitMode === "walking" ? (
                          <Footprints className="w-3.5 h-3.5" />
                        ) : c.transitMode === "driving" ? (
                          <Car className="w-3.5 h-3.5" />
                        ) : (
                          <TrainFront className="w-3.5 h-3.5" />
                        )}
                        <span>{c.minutes}{lang === "en" ? "m" : lang === "th" ? " นาที" : "分钟"} {lang === "en" ? "to" : lang === "th" ? "ไปยัง" : "至"} {c.name}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Gold price (currency-aware) */}
                <div className="text-[26px] font-bold mb-4" style={{ color: "#C9A84C", letterSpacing: "-0.8px", lineHeight: 1 }}>
                  {formatPriceFn(Number(property.priceTHB))}
                  {property.listingType !== "sale" && (
                    <span className="text-[14px] font-normal ml-1" style={{ color: "#555" }}>
                      {(() => {
                        const lbl = property.priceLabel || t.month;
                        if (lbl.toLowerCase().includes("month") || lbl.toLowerCase().includes("mo")) return t.month;
                        return lbl;
                      })()}
                    </span>
                  )}
                </div>

                {/* Rental Duration Switcher */}
                {hasPriceSwitcher && rentSibling && shortStaySibling && (
                  <div className="mb-6 p-4 rounded-xl border flex flex-col gap-3" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="text-[11px] font-bold uppercase tracking-[1.5px]" style={{ color: "#8B7E66" }}>
                      {t.rentContractOptions}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Long Term (1 Year) */}
                      {property.listingType === "rent" ? (
                        <div
                          className="flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-default"
                          style={{
                            background: "#E8F4F0",
                            borderColor: "#2D7D62",
                            color: "#1C3A2F",
                            boxShadow: "0 2px 8px rgba(45,125,98,0.08)"
                          }}
                        >
                          <span className="text-[12px] font-bold">{t.longTerm}</span>
                          <span className="text-[9px] opacity-75 font-medium">{t.yearContract1}</span>
                          <span className="text-[14px] font-extrabold mt-1.5" style={{ color: "#1C3A2F" }}>
                            {formatPriceFn(Number(rentSibling.priceTHB))}{t.mo}
                          </span>
                        </div>
                      ) : (
                        <a
                          href={`/property/${rentSibling.slug}`}
                          className="flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all hover:scale-[1.02] no-underline hover:border-gray-400"
                          style={{
                            background: "#FFFFFF",
                            borderColor: "#EDE8DF",
                            color: "#666",
                          }}
                        >
                          <span className="text-[12px] font-bold">{t.longTerm}</span>
                          <span className="text-[9px] text-gray-400">{t.yearContract1}</span>
                          <span className="text-[14px] font-semibold mt-1.5" style={{ color: "#C9A84C" }}>
                            {formatPriceFn(Number(rentSibling.priceTHB))}{t.mo}
                          </span>
                        </a>
                      )}

                      {/* Short Term (3-6 Months) */}
                      {property.listingType === "short_stay" ? (
                        <div
                          className="flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-default"
                          style={{
                            background: "#E8F4F0",
                            borderColor: "#2D7D62",
                            color: "#1C3A2F",
                            boxShadow: "0 2px 8px rgba(45,125,98,0.08)"
                          }}
                        >
                          <span className="text-[12px] font-bold">{t.shortTerm}</span>
                          <span className="text-[9px] opacity-75 font-medium">{t.months3to6}</span>
                          <span className="text-[14px] font-extrabold mt-1.5" style={{ color: "#1C3A2F" }}>
                            {formatPriceFn(Number(shortStaySibling.priceTHB))}{t.mo}
                          </span>
                        </div>
                      ) : (
                        <a
                          href={`/property/${shortStaySibling.slug}`}
                          className="flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all hover:scale-[1.02] no-underline hover:border-gray-400"
                          style={{
                            background: "#FFFFFF",
                            borderColor: "#EDE8DF",
                            color: "#666",
                          }}
                        >
                          <span className="text-[12px] font-bold">{t.shortTerm}</span>
                          <span className="text-[9px] text-gray-400">{t.months3to6}</span>
                          <span className="text-[14px] font-semibold mt-1.5" style={{ color: "#C9A84C" }}>
                            {formatPriceFn(Number(shortStaySibling.priceTHB))}{t.mo}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats Horizontal Row */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-[12px] font-medium border-t pt-4 mt-2 mb-6" style={{ color: "#555", borderColor: "#E5E0D8" }}>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: "#1C3A2F" }}><Icon.bed /></span>
                    <span>{property.bedrooms === 0 ? t.studio : `${property.bedrooms} ${property.bedrooms === 1 ? t.bed : t.beds}`}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: "#1C3A2F" }}><Icon.bath /></span>
                    <span>{property.bathrooms} {t.bath}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: "#1C3A2F" }}><Icon.garage /></span>
                    <span>{parkingValue} {t.parking}</span>
                  </div>
                  {property.sqm && (
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: "#1C3A2F" }}><Icon.sqft /></span>
                      <span>{property.sqm} m²</span>
                    </div>
                  )}
                </div>

                {/* Tour booking & Enquiry Section */}
                <div className="border-t pt-5" style={{ borderColor: "#E5E0D8" }}>
                  {/* Schedule a Tour card */}
                  <button
                    onClick={() => {
                      setTourOpen(true);
                      fetch(`/api/properties/${property.id}/track`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "click" }),
                      }).catch(() => {});
                    }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
                    style={{ background: "#FAF8F3", border: "1px solid #EDE8DF", textAlign: "left", fontFamily: "inherit" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "#C9A84C")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "#EDE8DF")}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#FFFFFF", color: "#1C3A2F" }}>
                      <Icon.calendar />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold" style={{ color: "#1A1A1A" }}>{t.scheduleTour}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "#999" }}>{t.tourSub}</div>
                    </div>
                    <span style={{ color: "#999" }}><Icon.chevRSm /></span>
                  </button>

                  {/* Send Enquiry button */}
                  <button
                    onClick={() => {
                      setEnquiryOpen(true);
                      fetch(`/api/properties/${property.id}/track`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "click" }),
                      }).catch(() => {});
                    }}
                    className="w-full mt-3 py-3.5 rounded-xl text-[14px] font-semibold cursor-pointer border-none transition-opacity hover:opacity-90 text-white"
                    style={{ background: "#1C3A2F", fontFamily: "inherit" }}
                  >
                    {t.sendEnquiry}
                  </button>
                </div>

                {/* FAQ block — Desktop view only */}
                <div className="hidden md:block">
                  <ListingFaqBlock property={property} />
                </div>

              </div>

              {/* WHY YOU'LL LOVE [AREA] Card */}
              {(() => {
                let areaKey = property.area.toLowerCase().replace(/\s+/g, "");
                if (areaKey === "thonglo") areaKey = "thonglor";
                const loveAreaBulletPoints = t.loveBullets[areaKey as keyof typeof t.loveBullets] || t.loveBullets.default;

                return (
                  <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3 font-outfit" style={{ color: "#1C3A2F" }}>
                        {t.whyYouWillLove} {translateArea(property.area, lang)}
                      </h3>
                      <ul className="list-none p-0 m-0 space-y-2">
                        {loveAreaBulletPoints.map((bp, i) => (
                          <li key={i} className="flex items-start text-[12px] leading-tight" style={{ color: "#555" }}>
                            <span className="font-semibold mr-1.5 flex-shrink-0" style={{ color: "#C9A84C" }}>✓</span>
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4">
                        <Link
                          href={`/explore?area=${property.area}`}
                          className="text-[11px] font-semibold hover:underline no-underline inline-flex items-center gap-1"
                          style={{ color: "#C9A84C" }}
                        >
                          {t.learnMoreAbout} {translateArea(property.area, lang)} <span className="text-[9px]">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* At a Glance Box (No Title) */}
              <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
                <div className="grid grid-cols-3 gap-2">
                  {/* Property Type */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}><Icon.home /></span>
                      <span>{t.specs.type}</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1 capitalize" style={{ color: "#1A1A1A" }}>
                      {translatePropertyType(property.propertyType, lang)}
                    </div>
                  </div>

                  {/* Floor */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m16 14-4-4-4 4"/></svg>
                      </span>
                      <span>{t.specs.floor}</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1" style={{ color: "#1A1A1A" }}>
                      {(() => {
                        const fl = property.floor ? String(property.floor) : getDynamicFloor(property.description, property.id, property.propertyType).split(" / ")[0];
                        return fl === "Ground" ? (lang === "en" ? "Ground" : lang === "th" ? "ชั้นกราวด์" : "地面层") : fl;
                      })()}
                    </div>
                  </div>

                  {/* Total Floors */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}><Icon.stories /></span>
                      <span>{t.specs.totalFloors}</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1" style={{ color: "#1A1A1A" }}>
                      {property.totalFloors ? String(property.totalFloors) : getDynamicFloor(property.description, property.id, property.propertyType).split(" / ")[1] || "—"}
                    </div>
                  </div>

                  {/* Pet Friendly */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S8.83 8 8 8zm8 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S16.83 8 16 8zm-4 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                      </span>
                      <span>{t.specs.pets}</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1" style={{ color: "#1A1A1A" }}>
                      {property.petFriendly || houseRulesDefaults(property).pets ? t.specs.yes : t.specs.no}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}><Icon.calendar /></span>
                      <span>{t.specs.available}</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1 leading-tight truncate" style={{ color: "#1A1A1A" }}>
                      {availableFromLabel(property, lang)}
                    </div>
                  </div>

                  {/* Min Stay */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </span>
                      <span>{t.specs.minStay}</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1 truncate" style={{ color: "#1A1A1A" }}>
                      {property.listingType === "sale"
                        ? t.specs.freehold
                        : property.listingType === "short_stay"
                          ? (property.leaseTerms === "3 Months" || !property.leaseTerms ? t.specs.months3 : property.leaseTerms)
                          : (property.leaseTerms === "12 Months" || !property.leaseTerms ? t.specs.months12 : property.leaseTerms)
                      }
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ─────────── MOBILE STICKY CTA BAR ─────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{ background: "#FFFFFF", borderTop: "1px solid #E5E0D8", boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}
      >
        <button
          onClick={() => {
            setTourOpen(true);
            fetch(`/api/properties/${property.id}/track`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "click" }),
            }).catch(() => {});
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[13px] font-bold bg-white border border-border text-charcoal cursor-pointer"
          style={{ fontFamily: "inherit" }}
        >
          <Icon.calendar /> {t.requestViewing}
        </button>
        <button
          onClick={() => {
            setEnquiryOpen(true);
            fetch(`/api/properties/${property.id}/track`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "click" }),
            }).catch(() => {});
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[13px] font-bold bg-forest text-white cursor-pointer border-none"
          style={{ fontFamily: "inherit" }}
        >
          {t.sendEnquiry}
        </button>
      </div>

      {/* Tenant Reviews & Ratings section */}
      <div className="px-5 md:px-10">
        <Reviews
          propertyId={property.id}
          propertyName={property.name}
          projectName={property.projectName || property.name}
        />
      </div>

      {/* Recently viewed strip */}
      <RecentlyViewedStrip currentId={property.id} />

      {/* Padding for mobile sticky CTA */}
      <div className="md:hidden" style={{ height: 80 }} />

      {/* Enquiry modal */}
      {enquiryOpen && <EnquiryModal property={property} onClose={() => setEnquiryOpen(false)} />}

      {/* Tour calendar modal */}
      {tourOpen && <TourCalendar property={property} onClose={() => setTourOpen(false)} />}
    </div>
  );
}
