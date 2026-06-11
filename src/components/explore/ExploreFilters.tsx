"use client";

import { useState } from "react";
import { ExploreFilters, PropertyType } from "@/types/property";
import { AREAS } from "@/data/mockProperties";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  filters:  ExploreFilters;
  total:    number;
  onChange: (f: Partial<ExploreFilters>) => void;
  onReset:  () => void;
}

function activeCount(f: ExploreFilters) {
  let n = 0;
  if (f.listingType  !== "all")    n++;
  if (f.area         !== "")       n++;
  if (f.bedrooms     !== "any")    n++;
  if (f.propertyType !== "all")    n++;
  if (f.search       !== "")       n++;
  if (f.minPrice     > 0)          n++;
  if (f.maxPrice     < Infinity)   n++;
  if (f.petFriendly)               n++;
  if (f.nearBts)                   n++;
  return n;
}

const sel: React.CSSProperties = {
  border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A",
  fontFamily: "inherit", fontSize: 13, borderRadius: 12,
  padding: "8px 10px", cursor: "pointer", outline: "none",
};
const selActive: React.CSSProperties = {
  ...sel, border: "1.5px solid #1C3A2F", background: "#F0F5F2",
  color: "#1C3A2F", fontWeight: 600,
};

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer border-[1.5px] rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-all duration-150"
      style={active
        ? { background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F", fontFamily: "inherit" }
        : { background: "#FFFFFF", color: "#555",    borderColor: "#E5E0D8", fontFamily: "inherit" }
      }
    >
      {children}
    </button>
  );
}

export default function ExploreFiltersBar({ filters, total, onChange, onReset }: Props) {
  const { t, lang } = useLanguage();
  const [sheetOpen, setSheetOpen] = useState(false);
  const count = activeCount(filters);

  const listingTabs = [
    { label: t.filters.tabAll,        value: "all" as const },
    { label: t.filters.tabSale,       value: "sale" as const },
    { label: t.filters.tabRent,       value: "rent" as const },
    { label: t.filters.tabShort,      value: "short_stay" as const },
  ];

  const propertyTypes = [
    { label: t.filters.anyType,  value: "all" as const },
    { label: t.filters.condo,     value: "condo" as const },
    { label: t.filters.house,     value: "house" as const },
    { label: t.filters.villa,     value: "villa" as const },
    { label: t.filters.townhouse, value: "townhouse" as const },
    { label: t.filters.apartment, value: "apartment" as const },
  ];

  const bedOptions = [
    { label: t.filters.anyBed,    value: "any" as const },
    { label: t.filters.studio,    value: 0 },
    { label: "1",                 value: 1 },
    { label: "2",                 value: 2 },
    { label: "3",                 value: 3 },
    { label: "4+",                value: 4 },
  ];

  const sortOptions = [
    { label: t.filters.sortNewest,    value: "newest" as const },
    { label: t.filters.sortPriceAsc,  value: "price_asc" as const },
    { label: t.filters.sortPriceDesc, value: "price_desc" as const },
    { label: t.filters.sortPopular,   value: "popular" as const },
  ];

  const minPresets = [
    { label: t.filters.noMin,                  value: 0 },
    { label: `฿10,000${t.filters.perMonth}`,   value: 10000 },
    { label: `฿20,000${t.filters.perMonth}`,   value: 20000 },
    { label: `฿40,000${t.filters.perMonth}`,   value: 40000 },
    { label: "฿5,000,000",                     value: 5000000 },
    { label: "฿10,000,000",                    value: 10000000 },
    { label: "฿20,000,000",                    value: 20000000 },
  ];

  const maxPresets = [
    { label: t.filters.noMax,                  value: Infinity },
    { label: `฿30,000${t.filters.perMonth}`,   value: 30000 },
    { label: `฿60,000${t.filters.perMonth}`,   value: 60000 },
    { label: `฿100,000${t.filters.perMonth}`,  value: 100000 },
    { label: "฿10,000,000",                    value: 10000000 },
    { label: "฿25,000,000",                    value: 25000000 },
    { label: "฿50,000,000",                    value: 50000000 },
  ];

  const getLocalizedAreaName = (area: string) => {
    const map: Record<string, keyof typeof t.category.areas> = {
      "Sukhumvit": "sukhumvit",
      "Sathorn": "sathorn",
      "Thong Lo": "thongLo",
      "Asok": "asok",
      "Ekkamai": "ekkamai",
      "Silom": "silom",
      "On Nut": "onNut",
      "Ari": "ari",
      "Rama 9": "rama9",
      "Bang Na": "bangNa",
      "Huai Khwang": "huaiKhwang",
      "Phaya Thai": "phayaThai",
    };
    const key = map[area];
    return key ? t.category.areas[key] : area;
  };

  const budgetLabel = (() => {
    const hasMin = filters.minPrice > 0;
    const hasMax = filters.maxPrice < Infinity;
    if (!hasMin && !hasMax) return t.filters.anyBudget;
    const fmt = (n: number) => n >= 1_000_000
      ? `฿${(n / 1_000_000).toFixed(0)}M`
      : n >= 1000 ? `฿${(n / 1000).toFixed(0)}K` : `฿${n}`;
    if (hasMin && !hasMax) return `${fmt(filters.minPrice)}+`;
    if (!hasMin && hasMax) return `${t.filters.upTo} ${fmt(filters.maxPrice)}`;
    return `${fmt(filters.minPrice)} – ${fmt(filters.maxPrice)}`;
  })();

  const budgetActive = filters.minPrice > 0 || filters.maxPrice < Infinity;

  return (
    <>
      <div
        suppressHydrationWarning
        className="sticky top-14 z-40"
        style={{ background: "rgba(247,243,236,0.98)", backdropFilter: "blur(14px)", borderBottom: "1px solid #E5E0D8" }}
      >
        {/* ════════════════════════════════════════════
            DESKTOP  (md+)
        ════════════════════════════════════════════ */}
        <div className="hidden md:block px-6 pt-4 pb-3">

          {/* Row 1 — listing type underline tabs + result count */}
          <div className="flex items-center gap-1 mb-3">
            {listingTabs.map((t) => (
              <button
                key={t.value}
                onClick={() => onChange({ listingType: t.value })}
                className="px-4 py-2 text-[13px] cursor-pointer border-none bg-transparent transition-all duration-150"
                style={{
                  color:       filters.listingType === t.value ? "#1C3A2F" : "#888",
                  fontWeight:  filters.listingType === t.value ? 700 : 400,
                  borderBottom: filters.listingType === t.value ? "2px solid #1C3A2F" : "2px solid transparent",
                  fontFamily: "inherit",
                  paddingBottom: 8,
                }}
              >
                {t.label}
              </button>
            ))}
            <span className="ml-auto text-[12px]" style={{ color: "#999" }}>
              {total} {total === 1 ? t.filters.property : t.filters.properties}
            </span>
          </div>

          {/* Row 2 — all filters */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Search */}
            <div
              className="flex items-center gap-2"
              style={{ background: "#FFFFFF", border: "1.5px solid #E5E0D8", borderRadius: 12, padding: "8px 14px", flex: "1 1 180px", minWidth: 0 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder={t.filters.searchPlaceholder}
                value={filters.search}
                onChange={(e) => onChange({ search: e.target.value })}
                onKeyDown={(e) => e.key === "Escape" && onChange({ search: "" })}
                className="flex-1 border-none outline-none bg-transparent text-[13px] min-w-0"
                style={{ color: "#1A1A1A", fontFamily: "inherit" }}
              />
              {filters.search && (
                <button onClick={() => onChange({ search: "" })} className="border-none bg-transparent cursor-pointer text-[11px] flex-shrink-0" style={{ color: "#bbb", fontFamily: "inherit" }}>✕</button>
              )}
            </div>

            {/* ── visual divider ── */}
            <div style={{ width: 1, height: 28, background: "#E5E0D8", flexShrink: 0 }} />

            {/* Area */}
            <select value={filters.area} onChange={(e) => onChange({ area: e.target.value })} style={filters.area ? selActive : sel}>
              {AREAS.map((a) => {
                const label = a === "All Areas" ? t.filters.area : getLocalizedAreaName(a);
                const val = a === "All Areas" ? "" : a;
                return <option key={a} value={val}>{label}</option>;
              })}
              <option value="Other">{lang === "th" ? "พื้นที่อื่นในกรุงเทพฯ" : "Other Bangkok Areas"}</option>
            </select>

            {/* Beds */}
            <select
              value={String(filters.bedrooms)}
              onChange={(e) => { const v = e.target.value; onChange({ bedrooms: v === "any" ? "any" : Number(v) as 0|1|2|3|4 }); }}
              style={filters.bedrooms !== "any" ? selActive : sel}
            >
              {bedOptions.map((b) => {
                let display = "";
                if (b.value === "any") display = t.filters.anyBeds;
                else if (b.value === 0) display = t.filters.studio;
                else display = `${b.label} ${b.value === 1 ? t.filters.bedSingle : t.filters.bedsPlural}`;
                return (
                  <option key={String(b.value)} value={String(b.value)}>
                    {display}
                  </option>
                );
              })}
            </select>

            {/* Property type */}
            <select value={filters.propertyType} onChange={(e) => onChange({ propertyType: e.target.value as PropertyType | "all" })} style={filters.propertyType !== "all" ? selActive : sel}>
              {propertyTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            {/* ── visual divider ── */}
            <div style={{ width: 1, height: 28, background: "#E5E0D8", flexShrink: 0 }} />

            {/* Budget — min */}
            <select
              value={String(filters.minPrice)}
              onChange={(e) => onChange({ minPrice: Number(e.target.value) })}
              style={filters.minPrice > 0 ? selActive : sel}
            >
              {minPresets.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
            </select>

            {/* Budget — max */}
            <select
              value={String(filters.maxPrice)}
              onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
              style={filters.maxPrice < Infinity ? selActive : sel}
            >
              {maxPresets.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
            </select>

            {/* ── visual divider ── */}
            <div style={{ width: 1, height: 28, background: "#E5E0D8", flexShrink: 0 }} />

            {/* Pet friendly */}
            <Toggle active={filters.petFriendly} onClick={() => onChange({ petFriendly: !filters.petFriendly })}>
              {t.filters.petFriendly}
            </Toggle>

            {/* Near BTS/MRT */}
            <Toggle active={filters.nearBts} onClick={() => onChange({ nearBts: !filters.nearBts })}>
              {t.filters.nearBts}
            </Toggle>

            {/* Sort */}
            <select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as ExploreFilters["sort"] })} style={sel}>
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Clear */}
            {count > 0 && (
              <button onClick={onReset} className="text-[12px] font-medium cursor-pointer border-none bg-transparent underline flex-shrink-0" style={{ color: "#E05252", fontFamily: "inherit" }}>
                {t.filters.clearAll}
              </button>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════
            MOBILE compact bar (< md)
        ════════════════════════════════════════════ */}
        <div className="md:hidden px-4 py-3 flex items-center gap-2">
          <div
            className="flex items-center gap-2 flex-1 min-w-0"
            style={{ background: "#FFFFFF", border: "1.5px solid #E5E0D8", borderRadius: 12, padding: "10px 12px" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder={t.filters.searchPlaceholder}
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              className="flex-1 border-none outline-none bg-transparent text-[13px] min-w-0"
              style={{ color: "#1A1A1A", fontFamily: "inherit" }}
            />
            {filters.search && (
              <button onClick={() => onChange({ search: "" })} className="border-none bg-transparent cursor-pointer text-[11px]" style={{ color: "#bbb", fontFamily: "inherit" }}>✕</button>
            )}
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer border-none rounded-xl px-3.5 py-2.5 text-[13px] font-medium"
            style={{ background: count > 0 ? "#1C3A2F" : "#FFFFFF", color: count > 0 ? "#FFFFFF" : "#1A1A1A", border: `1.5px solid ${count > 0 ? "#1C3A2F" : "#E5E0D8"}`, fontFamily: "inherit" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            {t.filters.filtersTitle}{count > 0 && ` (${count})`}
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          MOBILE FILTER SHEET
      ════════════════════════════════════════════ */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex items-end" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }} />
          <div
            className="relative w-full overflow-y-auto"
            style={{ background: "#F7F3EC", borderRadius: "24px 24px 0 0", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "#E5E0D8" }} />
            </div>

            <div className="px-5 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between py-3 mb-4" style={{ borderBottom: "1px solid #EDE8DF" }}>
                <h3 className="text-[16px] font-bold" style={{ color: "#1A1A1A" }}>{t.filters.filtersTitle}</h3>
                {count > 0 && (
                  <button onClick={onReset} className="text-[13px] font-medium cursor-pointer border-none bg-transparent underline" style={{ color: "#E05252", fontFamily: "inherit" }}>
                    {t.filters.clearAll}
                  </button>
                )}
              </div>

              {/* Looking for */}
              <p className="text-[11px] font-semibold uppercase tracking-[1.2px] mb-2.5" style={{ color: "#999" }}>{t.filters.lookingFor}</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {listingTabs.map((t) => (
                  <button key={t.value} onClick={() => onChange({ listingType: t.value })}
                    className="py-3 rounded-xl text-[13px] font-medium cursor-pointer border-[1.5px] transition-all"
                    style={filters.listingType === t.value
                      ? { background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F", fontFamily: "inherit" }
                      : { background: "#FFFFFF", color: "#444", borderColor: "#E5E0D8", fontFamily: "inherit" }
                    }
                  >{t.label}</button>
                ))}
              </div>

              {/* Area */}
              <p className="text-[11px] font-semibold uppercase tracking-[1.2px] mb-2.5" style={{ color: "#999" }}>{t.filters.area}</p>
              <select value={filters.area} onChange={(e) => onChange({ area: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none cursor-pointer mb-5"
                style={{ border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
              >
                {AREAS.map((a) => {
                  const label = a === "All Areas" ? t.filters.area : getLocalizedAreaName(a);
                  const val = a === "All Areas" ? "" : a;
                  return <option key={a} value={val}>{label}</option>;
                })}
                <option value="Other">{lang === "th" ? "พื้นที่อื่นในกรุงเทพฯ" : "Other Bangkok Areas"}</option>
              </select>

              {/* Budget */}
              <p className="text-[11px] font-semibold uppercase tracking-[1.2px] mb-2.5" style={{ color: "#999" }}>
                {t.filters.budget}{budgetActive && <span style={{ color: "#1C3A2F" }}> · {budgetLabel}</span>}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div>
                  <p className="text-[10px] mb-1.5" style={{ color: "#aaa" }}>{t.filters.minimum}</p>
                  <select value={String(filters.minPrice)} onChange={(e) => onChange({ minPrice: Number(e.target.value) })}
                    className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none cursor-pointer"
                    style={{ border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
                  >
                    {minPresets.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] mb-1.5" style={{ color: "#aaa" }}>{t.filters.maximum}</p>
                  <select value={String(filters.maxPrice)} onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
                    className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none cursor-pointer"
                    style={{ border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
                  >
                    {maxPresets.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Bedrooms */}
              <p className="text-[11px] font-semibold uppercase tracking-[1.2px] mb-2.5" style={{ color: "#999" }}>{t.filters.bedrooms}</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {bedOptions.map((b) => (
                  <button key={String(b.value)} onClick={() => onChange({ bedrooms: b.value })}
                    className="px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border-[1.5px] transition-all"
                    style={filters.bedrooms === b.value
                      ? { background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F", fontFamily: "inherit" }
                      : { background: "#FFFFFF", color: "#444", borderColor: "#E5E0D8", fontFamily: "inherit" }
                    }
                  >
                    {b.value === "any" ? t.filters.anyBed : b.value === 0 ? t.filters.studio : `${b.label} ${t.filters.bedSingle}`}
                  </button>
                ))}
              </div>

              {/* Property type */}
              <p className="text-[11px] font-semibold uppercase tracking-[1.2px] mb-2.5" style={{ color: "#999" }}>{t.filters.propertyType}</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {propertyTypes.map((t) => (
                  <button key={t.value} onClick={() => onChange({ propertyType: t.value as PropertyType | "all" })}
                    className="py-2.5 rounded-xl text-[12px] font-medium cursor-pointer border-[1.5px] transition-all"
                    style={filters.propertyType === t.value
                      ? { background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F", fontFamily: "inherit" }
                      : { background: "#FFFFFF", color: "#444", borderColor: "#E5E0D8", fontFamily: "inherit" }
                    }
                  >{t.label}</button>
                ))}
              </div>

              {/* Amenities */}
              <p className="text-[11px] font-semibold uppercase tracking-[1.2px] mb-2.5" style={{ color: "#999" }}>{t.filters.amenities}</p>
              <div className="flex gap-2 mb-5">
                <button onClick={() => onChange({ petFriendly: !filters.petFriendly })}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium cursor-pointer border-[1.5px] transition-all"
                  style={filters.petFriendly
                    ? { background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F", fontFamily: "inherit" }
                    : { background: "#FFFFFF", color: "#444", borderColor: "#E5E0D8", fontFamily: "inherit" }
                  }
                >
                  {t.filters.petFriendly}
                </button>
                <button onClick={() => onChange({ nearBts: !filters.nearBts })}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium cursor-pointer border-[1.5px] transition-all"
                  style={filters.nearBts
                    ? { background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F", fontFamily: "inherit" }
                    : { background: "#FFFFFF", color: "#444", borderColor: "#E5E0D8", fontFamily: "inherit" }
                  }
                >
                  {t.filters.nearBts}
                </button>
              </div>

              {/* Sort */}
              <p className="text-[11px] font-semibold uppercase tracking-[1.2px] mb-2.5" style={{ color: "#999" }}>{t.filters.sortBy}</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {sortOptions.map((o) => (
                  <button key={o.value} onClick={() => onChange({ sort: o.value })}
                    className="py-2.5 rounded-xl text-[12px] font-medium cursor-pointer border-[1.5px] transition-all"
                    style={filters.sort === o.value
                      ? { background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F", fontFamily: "inherit" }
                      : { background: "#FFFFFF", color: "#444", borderColor: "#E5E0D8", fontFamily: "inherit" }
                    }
                  >{o.label}</button>
                ))}
              </div>

              {/* Apply */}
              <button onClick={() => setSheetOpen(false)}
                className="w-full py-4 rounded-2xl text-[15px] font-semibold cursor-pointer border-none"
                style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
              >
                {t.filters.showResults
                  .replace("{total}", String(total))
                  .replace("{label}", total === 1 ? t.filters.property : t.filters.properties)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
