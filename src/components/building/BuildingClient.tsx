"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  TrainFront,
  Footprints,
  ShieldCheck,
  Sparkles,
  Layers,
  Dog,
  ExternalLink,
  ChevronRight,
  Share2,
  Check,
  Star,
} from "lucide-react";
import ExplorePropertyCard from "@/components/explore/ExplorePropertyCard";
import Reviews from "@/components/property/Reviews";
import { PropertyCard } from "@/types/property";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

export interface NearbyBuildingInfo {
  slug: string;
  name: string;
  area: string;
  coverImage?: string;
  minPrice: number;
  unitCount: number;
  ratingValue?: number;
  reviewCount?: number;
}

interface Props {
  buildingSlug?: string;
  buildingName: string;
  properties: PropertyCard[];
  nearbyBuildings?: NearbyBuildingInfo[];
}

export default function BuildingClient({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildingSlug,
  buildingName,
  properties,
  nearbyBuildings = [],
}: Props) {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState<"all" | "rent" | "sale" | "short_stay">("all");
  const [buildingPhoto, setBuildingPhoto] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `${buildingName} Condos in ${area} Bangkok`,
      text: `Check out available condos for rent and sale at ${buildingName} in ${area}, Bangkok on NHP!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const sample = properties[0];
  const area = sample?.area || "Bangkok";
  const defaultImage = sample?.coverImage || "/images/homepage_hero_v2.webp";

  // Dynamically fetch real Google Places building exterior photo
  useEffect(() => {
    let isMounted = true;
    const query = `${buildingName} ${area} Bangkok`;
    fetch(`/api/places-photo?placeName=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.photoUrl) {
          setBuildingPhoto(data.photoUrl);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [buildingName, area]);

  const heroImage = buildingPhoto || defaultImage;

  const filteredProperties = properties.filter((p) => {
    if (filterType === "all") return true;
    return p.listingType === filterType;
  });

  const saleCount = properties.filter((p) => p.listingType === "sale").length;
  const rentCount = properties.filter((p) => p.listingType === "rent").length;
  const shortStayCount = properties.filter((p) => p.listingType === "short_stay").length;
  const isPetFriendly = properties.some((p) => p.petFriendly);

  const mapSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(buildingName + " " + area + " Bangkok")}`;

  return (
    <div className="w-full pb-4 sm:pb-8 bg-[#FAF8F3]">
      {/* ── HERO BANNER & BUILDING PROFILE AVATAR ── */}
      <div className="relative w-full h-[320px] sm:h-[380px] md:h-[440px] bg-[#161B18] overflow-hidden flex items-end">
        <Image
          src={heroImage}
          alt={`${buildingName} Exterior`}
          fill
          priority
          className="object-cover opacity-45 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161B18] via-[#161B18]/50 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-5 pb-6 sm:pb-8 w-full text-left">
          {/* Mobile-Friendly Badges & Share Row */}
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] bg-black/60 backdrop-blur-md border border-[#C9A84C]/30">
                <Building2 size={11} /> Condo Profile
              </span>
              {isPetFriendly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30">
                  <Dog size={11} /> Pet Friendly
                </span>
              )}
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-white bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/30 transition-all cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={12} className="text-[#C9A84C]" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white font-outfit tracking-tight mb-2 leading-tight">
            {buildingName}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs text-gray-300 font-medium">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-[#C9A84C]" />
              {sample?.district ? `${sample.district}, ` : ""}{area}, Bangkok
            </span>
            <span>·</span>
            <Link
              href={`/neighborhood/${area.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[#C9A84C] hover:underline"
            >
              Explore {area} Guide →
            </Link>
            <span>·</span>
            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white inline-flex items-center gap-1 underline"
            >
              Google Maps <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>

      {/* ── BUILDING KEY SPECIFICATIONS STRIP (Mobile Optimized) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-5 -mt-5 sm:-mt-6 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#EDE8DF] shadow-md">
          {/* Transit Proximity */}
          <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#EDE8DF] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <TrainFront size={13} className="text-[#1C3A2F]" />
              <span>Location & BTS</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#1C3A2F] mt-1 leading-tight">
              {area} Hub
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
              <Footprints size={10} /> Walkable
            </div>
          </div>

          {/* Scale & Units */}
          <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#EDE8DF] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <Layers size={13} className="text-[#1C3A2F]" />
              <span>{t.buildings.activeUnits}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#1C3A2F] mt-1 leading-tight">
              {properties.length} {properties.length === 1 ? t.buildings.unit : t.buildings.units}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">
              {rentCount} {t.buildings.rentUnits} · {saleCount} {t.buildings.saleUnits}
            </div>
          </div>

          {/* Pet Policy */}
          <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#EDE8DF] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <Dog size={13} className="text-[#1C3A2F]" />
              <span>{t.buildings.petPolicy}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#1C3A2F] mt-1 leading-tight">
              {isPetFriendly ? t.buildings.petAllowed : t.buildings.subjectToUnit}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">Cats & Dogs</div>
          </div>

          {/* Amenities */}
          <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#EDE8DF] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <Sparkles size={13} className="text-[#1C3A2F]" />
              <span>{t.buildings.facilities}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#1C3A2F] mt-1 leading-tight">
              {t.buildings.facilitiesDesc}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
              <ShieldCheck size={10} className="text-emerald-600" /> {t.buildings.access247}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-5 mt-8 sm:mt-10">
        {/* Title & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1C3A2F] font-outfit">
              {t.buildings.availableUnitsIn} {buildingName}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t.buildings.browseUnitsSub}
            </p>
          </div>

          {/* ── HIGH-END CUSTOM SEGMENTED FILTER BAR ── */}
          <div className="w-full md:w-auto overflow-x-auto no-scrollbar py-1">
            <div className="inline-flex p-1 bg-[#EBE5DA] rounded-2xl gap-1 border border-[#DDD5C7] w-full md:w-auto justify-between sm:justify-start">
              {[
                { id: "all", label: `${t.buildings.allUnits} (${properties.length})` },
                { id: "rent", label: `${t.buildings.rentUnits} (${rentCount})` },
                { id: "sale", label: `${t.buildings.saleUnits} (${saleCount})` },
                { id: "short_stay", label: `${t.buildings.shortStayUnits} (${shortStayCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id as any)}
                  className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-center ${
                    filterType === tab.id
                      ? "bg-[#1C3A2F] text-white shadow-sm"
                      : "text-gray-700 hover:text-[#1C3A2F]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Units Grid */}
        {filteredProperties.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-[#EDE8DF]">
            <p className="text-xs text-gray-500">No active units match your selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProperties.map((prop, idx) => (
              <ExplorePropertyCard key={prop.id} property={prop} index={idx} />
            ))}
          </div>
        )}

        {/* ── BUILDING REVIEWS & RATINGS SECTION ── */}
        <div className="mt-8 sm:mt-10 bg-white p-4 sm:p-6 rounded-2xl border border-[#EDE8DF]">
          <Reviews
            propertyId={sample.id}
            propertyName={buildingName}
            projectName={buildingName}
          />
        </div>

        {/* ── EXPLORE NEARBY BUILDINGS SECTION ── */}
        {nearbyBuildings.length > 0 && (
          <div className="mt-6 sm:mt-8 pt-6 border-t border-[#EDE8DF]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
              <div>
                <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#C9A84C]">
                  {t.buildings.neighborhoodComparison}
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1C3A2F] mt-0.5 font-outfit">
                  {t.buildings.exploreNearby} {area}
                </h3>
              </div>
              <Link
                href={`/buildings?area=${encodeURIComponent(area.toLowerCase().trim())}`}
                className="text-xs font-bold text-[#C9A84C] hover:underline inline-flex items-center gap-1 self-start sm:self-auto whitespace-nowrap"
              >
                {t.buildings.allLocationBuildings.replace("{area}", area)} <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearbyBuildings.map((b) => (
                <Link
                  key={b.slug}
                  href={`/building/${b.slug}`}
                  className="group block bg-white rounded-2xl border border-[#EDE8DF] overflow-hidden no-underline transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
                >
                  <div className="relative h-36 sm:h-40 w-full bg-[#1C3A2F] overflow-hidden">
                    <Image
                      src={b.coverImage || "/images/homepage_hero_v2.webp"}
                      alt={b.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/homepage_hero_v2.webp";
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {b.unitCount} {b.unitCount === 1 ? t.buildings.unit : t.buildings.units}
                    </div>
                  </div>

                  <div className="p-4 text-left flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1C3A2F] group-hover:text-[#C9A84C] transition-colors truncate font-outfit">
                        {b.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={11} className="text-[#C9A84C]" /> {b.area}, Bangkok
                      </p>

                      {/* Review Rating Badge (Right-aligned) */}
                      <div className="mt-2 flex items-center justify-end">
                        {b.reviewCount && b.reviewCount > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold">
                            <Star size={11} className="fill-emerald-600 text-emerald-600" />
                            <span>{b.ratingValue}</span>
                            <span className="text-[9px] text-emerald-700 font-normal">({b.reviewCount} {b.reviewCount === 1 ? t.buildings.review : t.buildings.reviews})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50/80 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded text-[10px] font-semibold">
                            <Star size={10} className="text-emerald-500" />
                            <span>{t.buildings.noReviewsYet}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {b.minPrice > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#F5F0E6] flex items-center justify-between text-xs font-bold text-[#C9A84C]">
                        <span>{t.buildings.from} {formatPrice(b.minPrice)}</span>
                        <span className="text-[10px] text-gray-400 group-hover:translate-x-1 transition-transform">
                          {t.buildings.viewBuilding} →
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
