export interface SwipeTranslations {
  swipe: string;
  skipped: string;
  saved: string;
  seenAllTitle: string;
  seenAllDesc: string;
  viewSaved: string;
  filters: string;
  searchLocation: string;
  browseByType: string;
  mustHave: string;
  priceRange: string;
  showResults: string;
  showResult: string;
  petFriendly: string;
  nearBts: string;
  studio: string;
  anyBudget: string;
  beds: string;
  baths: string;
  sqm: string;
  undoLastSkip: string;
  keyboardControls: string;
  keyboardControlsShort: string;
  savedToast: string;
  remaining: string;
  browseAllAgain: string;
  viewDetails: string;
  noSavedMatches: string;
  savedSummary: string;
}

export const T_SWIPE: Record<"en" | "th" | "zh", SwipeTranslations> = {
  en: {
    swipe: "Swipe",
    skipped: "Skipped",
    saved: "Saved",
    seenAllTitle: "You've seen them all!",
    seenAllDesc: "Adjust your filters or location search to discover more properties.",
    viewSaved: "View {count} Saved",
    filters: "Filters",
    searchLocation: "Search Location",
    browseByType: "Browse by type",
    mustHave: "Must have",
    priceRange: "Price range (THB)",
    showResults: "Show {count} Properties",
    showResult: "Show {count} Property",
    petFriendly: "Pet Friendly",
    nearBts: "Near BTS / MRT",
    studio: "Studio",
    anyBudget: "Any Budget",
    beds: "Bed",
    baths: "Bath",
    sqm: "sqm",
    undoLastSkip: "Undo last skip",
    keyboardControls: "Swipe or use buttons · ← Skip · → Save",
    keyboardControlsShort: "← Skip · → Save | ↑ Undo last skip",
    savedToast: "Saved!",
    remaining: "Remaining",
    browseAllAgain: "Browse All Again",
    viewDetails: "View details",
    noSavedMatches: "Try a different filter",
    savedSummary: "You saved {count} {count, plural, one {property} other {properties}}"
  },
  th: {
    swipe: "ปัดเลือก",
    skipped: "ข้ามแล้ว",
    saved: "บันทึกแล้ว",
    seenAllTitle: "คุณได้ดูทั้งหมดแล้ว!",
    seenAllDesc: "ปรับตัวกรองหรือการค้นหาทำเลของคุณเพื่อค้นพบอสังหาริมทรัพย์เพิ่มเติม",
    viewSaved: "ดูรายการที่บันทึก {count} รายการ",
    filters: "ตัวกรอง",
    searchLocation: "ค้นหาทำเล",
    browseByType: "เลือกประเภท",
    mustHave: "สิ่งจำเป็น",
    priceRange: "ช่วงราคา (บาท)",
    showResults: "แสดง {count} อสังหาริมทรัพย์",
    showResult: "แสดง {count} อสังหาริมทรัพย์",
    petFriendly: "อนุญาตให้เลี้ยงสัตว์",
    nearBts: "ใกล้ BTS / MRT",
    studio: "สตูดิโอ",
    anyBudget: "ไม่จำกัดงบ",
    beds: "ห้องนอน",
    baths: "ห้องน้ำ",
    sqm: "ตร.ม.",
    undoLastSkip: "เลิกทำการข้ามล่าสุด",
    keyboardControls: "ปัดหรือใช้ปุ่ม · ← ข้าม · → บันทึก",
    keyboardControlsShort: "← ข้าม · → บันทึก | ↑ เลิกทำการข้ามล่าสุด",
    savedToast: "บันทึกแล้ว!",
    remaining: "เหลืออยู่",
    browseAllAgain: "สำรวจทั้งหมดอีกครั้ง",
    viewDetails: "ดูรายละเอียด",
    noSavedMatches: "ลองปรับตัวกรองเพิ่มเติม",
    savedSummary: "คุณบันทึกไว้ {count} รายการ"
  },
  zh: {
    swipe: "滑动模式",
    skipped: "已跳过",
    saved: "已保存",
    seenAllTitle: "您已看完所有房源！",
    seenAllDesc: "调整您的筛选条件或搜索位置以发现更多房源。",
    viewSaved: "查看 {count} 个已保存房源",
    filters: "筛选条件",
    searchLocation: "搜索位置",
    browseByType: "按类型浏览",
    mustHave: "必须具备",
    priceRange: "价格范围 (泰铢)",
    showResults: "显示 {count} 个房源",
    showResult: "显示 {count} 个房源",
    petFriendly: "允许宠物",
    nearBts: "近 BTS / MRT",
    studio: "单身公寓",
    anyBudget: "不限预算",
    beds: "卧室",
    baths: "浴室",
    sqm: "平方米",
    undoLastSkip: "撤销上次跳过",
    keyboardControls: "滑动或使用按钮 · ← 跳过 · → 保存",
    keyboardControlsShort: "← 跳过 · → 保存 | ↑ 撤销上次跳过",
    savedToast: "已保存！",
    remaining: "剩余",
    browseAllAgain: "重新浏览全部",
    viewDetails: "查看详情",
    noSavedMatches: "尝试不同的筛选条件",
    savedSummary: "您保存了 {count} 个房源"
  }
};
