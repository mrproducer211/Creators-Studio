export type ListingType  = "sale" | "rent" | "short_stay";
export type PropertyType = "condo" | "house" | "villa" | "townhouse" | "apartment";
export type Furnishing   = "furnished" | "partially_furnished" | "unfurnished";

export interface PropertyCard {
  id: number;
  slug: string;
  name: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  priceTHB: number;
  priceUSD?: number;
  priceLabel?: string;
  bedrooms: number;
  bathrooms: number;
  sqm?: number;
  area: string;
  district?: string;
  latitude?: string;
  longitude?: string;
  coverImage?: string;
  images?: string[];
  videoUrl?: string;
  likes: number;
  saves: number;
  clicks?: number;
  featured: boolean;
  hasVideo: boolean;
  petFriendly: boolean;
  nearBts: boolean;
  verificationBadge?: boolean;
  expiryDate?: string;
  telegramMediaGroupId?: string;
  createdAt: string;
  updatedAt?: string;

  // ── Optional enrichment (data-driven when set, smart defaults otherwise) ──
  amenities?:       string[];
  features?:        string[];
  schools?:         string[];
  transit?:         string[];
  neighborhood?:    string;
  viewCount?:       number;
  furnishing?:      Furnishing;
  availableFrom?:   string;   // ISO date
  lastVerifiedAt?:  string;   // ISO date
  buildingBuilt?:   number;   // year
  lastRenovated?:   number;   // year
  foreignQuota?:    boolean;  // for sale: foreign ownership available
  visaFriendly?:    boolean;  // LTR / Elite visa accepted
  btsStation?:      string;
  btsWalkMin?:      number;
  mrtStation?:      string;
  mrtWalkMin?:      number;
  utilities?: {
    water?:       "included" | "metered";
    electricity?: "included" | "metered";
    internet?:    "included" | "tenant";
    aircon?:      "included" | "metered";
  };
  houseRules?: {
    pets?:     boolean;
    smoking?:  boolean;
    parties?:  boolean;
    children?: boolean;
  };
  commonAreaImages?: string[];
}

export interface ExploreFilters {
  listingType:  ListingType  | "all";
  propertyType: PropertyType | "all";
  area: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number | "any";
  sort: "newest" | "price_asc" | "price_desc" | "popular";
  search: string;
  petFriendly: boolean;
  nearBts: boolean;
}
