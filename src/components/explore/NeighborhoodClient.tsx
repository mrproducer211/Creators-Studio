"use client";

import { useState, useMemo } from "react";
import { PropertyCard } from "@/types/property";
import { Neighborhood, NEIGHBORHOODS } from "@/data/neighborhoods";
import { NEIGHBORHOOD_GUIDES } from "@/data/neighborhoodGuides";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSaved } from "@/contexts/SavedContext";
import { T_NEIGHBORHOOD } from "@/data/neighborhoodTranslations";
import Link from "next/link";
import Image from "next/image";
import { Building2, Train, Plane, Sparkles, ThumbsUp, Coffee, Footprints, Heart, Check, ArrowUpRight, Bed, ShowerHead, Maximize2, TrainFront, Home } from "lucide-react";
import { stripEmojis } from "@/lib/emoji";
import POSTS from "@/data/blogPosts";

function VibeCard({ card }: { card: { title: string; subtitle: string; image: string } }) {
  const [src, setSrc] = useState(card.image);
  return (
    <Image
      src={src}
      alt={card.title}
      fill
      sizes="(max-width: 768px) 160px, 250px"
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      onError={() => {
        if (src === card.image && card.image.includes("/images/lifestyles/")) {
          if (card.title.toLowerCase().includes("cafe")) {
            setSrc("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&q=80");
          } else if (card.title.toLowerCase().includes("dining")) {
            setSrc("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&q=80");
          } else if (card.title.toLowerCase().includes("nightlife")) {
            setSrc("https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&auto=format&q=80");
          } else {
            setSrc("https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&q=80");
          }
        }
      }}
    />
  );
}

interface Props {
  neighborhood: Neighborhood;
  initialProperties: PropertyCard[];
}

const NEIGHBORHOOD_METADATA: Record<string, {
  district: string;
  btsCode: string;
  airportTime: string;
  vibe: string;
  bestFor: string;
  pros: string[];
  vibeCards: { title: string; subtitle: string; image: string }[];
  lifestyleDesc?: string;
}> = {
  ari: {
    district: "Phaya Thai",
    btsCode: "Ari (N5)",
    airportTime: "30–40 min",
    vibe: "Trendy, Friendly, Local",
    bestFor: "Remote Workers, Couples, Young Professionals",
    pros: [
      "Walkable neighborhood with a strong community feel",
      "Amazing cafes, bakeries and local restaurants",
      "Easy access to BTS and main roads",
      "Perfect for remote work and creative lifestyle",
      "Leafy side streets with minimal high-rise traffic",
      "Charming local markets alongside modern supermarkets"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Excellent", image: "/images/lifestyles/ari_cafe.webp" },
      { title: "Dining", subtitle: "Great variety", image: "/images/lifestyles/ari_dining.webp" },
      { title: "Nightlife", subtitle: "Relaxed", image: "/images/lifestyles/ari_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Abundant", image: "/images/lifestyles/ari_parks.webp" }
    ],
    lifestyleDesc: "A charming residential enclave that has evolved into one of Bangkok's trendiest creative hubs. Ari maintains a laid-back, community-centric atmosphere, blending mid-century modern homes with leafy streets, pocket parks, and artisanal spaces. The neighborhood is celebrated for its thriving specialty coffee culture, independent bakeries, cozy bistros, and locally-owned boutiques. It attracts a mix of local creatives, tech founders, digital nomads, and young families who value a slower pace of life with urban conveniences."
  },
  sathorn: {
    district: "Sathon",
    btsCode: "Chong Nonsi (S3)",
    airportTime: "35–45 min",
    vibe: "Sleek, Corporate, Upscale",
    bestFor: "Corporate Executives, Families, Expatriates",
    pros: [
      "Heart of the financial district with top-class towers",
      "Proximity to Lumphini Park for outdoor recreation",
      "Prestigious dining venues and rooftop bars",
      "High concentration of international schools nearby",
      "Quiet, tree-lined residential side-streets (sois)",
      "Convenient tollway access and multi-lane roads",
      "Top-tier healthcare centers and embassies within reach"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "High Quality", image: "/images/lifestyles/sathorn_cafe.webp" },
      { title: "Dining", subtitle: "World-class", image: "/images/lifestyles/sathorn_dining.webp" },
      { title: "Nightlife", subtitle: "Sophisticated", image: "/images/lifestyles/sathorn_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Lumpini Park close", image: "/images/lifestyles/sathorn_parks.webp" }
    ],
    lifestyleDesc: "A perfect blend of premium corporate lifestyle and serene residential comfort. Sathorn is defined by its towering glass skyscrapers, corporate headquarters, and luxury condominium developments, contrasted with quiet, tree-lined side streets (sois). It is home to upscale Michelin-starred dining, exclusive rooftop bars, and tranquil green spaces like Lumphini Park. By day, it is a bustling financial hub; by evening, it transforms into an elegant dining, networking, and wellness sanctuary for working professionals, expatriates, and modern families."
  },
  "thong-lo": {
    district: "Watthana",
    btsCode: "Thong Lo (E6)",
    airportTime: "25–35 min",
    vibe: "Vibrant, Fashionable, Prestige",
    bestFor: "Socialites, Trendsetters, Japanese Expats",
    pros: [
      "Epicenter of Bangkok's trendy dining & nightlife",
      "Beautiful high-end community malls and plazas",
      "Very walkable sub-sois with premium shopping",
      "Excellent Japanese food and sushi culture",
      "Prestige address with high capital appreciation",
      "Close to elite international hospitals and schools"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Artisanal", image: "/images/lifestyles/thong_lo_cafe.webp" },
      { title: "Dining", subtitle: "Fine Dining", image: "/images/lifestyles/thong_lo_dining.webp" },
      { title: "Nightlife", subtitle: "Elite Speakeasies", image: "/images/lifestyles/thong_lo_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Benjasiri nearby", image: "/images/lifestyles/thong_lo_parks.webp" }
    ],
    lifestyleDesc: "Bangkok's undisputed epicenter of fashion, high-end dining, and vibrant nightlife. Thong Lo (Sukhumvit 55) is a glamorous and energetic neighborhood lined with luxury lifestyle malls, designer boutiques, speakeasy bars, and world-class culinary concepts. It is highly popular among Japanese expats, affluent locals, and global travelers who seek a sophisticated urban lifestyle. Beyond the main road, its quiet sub-sois hide high-end residential towers, wellness spas, and hidden cafes, offering an oasis of calm amidst the excitement."
  },
  asok: {
    district: "Watthana",
    btsCode: "Asok (E4) / Sukhumvit (BL22)",
    airportTime: "25–35 min",
    vibe: "Busy, Central, Commuter-Friendly",
    bestFor: "Young Professionals, Commuters, Urbanites",
    pros: [
      "Ultimate transit hub linking BTS Skytrain & MRT Subway",
      "Direct access to Terminal 21 shopping mall",
      "Superb collection of co-working spaces and gyms",
      "Walkable distance to Benjakitti Forest Park",
      "Thriving business district with corporate offices",
      "Diverse dining options ranging from street food to fine dining"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Fast-paced", image: "/images/lifestyles/asok_cafe.webp" },
      { title: "Dining", subtitle: "Global Food Court", image: "/images/lifestyles/asok_dining.webp" },
      { title: "Nightlife", subtitle: "High Energy", image: "/images/lifestyles/asok_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Benjakitti Park", image: "/images/lifestyles/asok_parks.webp" }
    ],
    lifestyleDesc: "The ultimate commercial crossroads of Bangkok, where business, retail, and convenience meet. Asok is a high-energy urban transit hub where the BTS Skytrain and MRT Subway systems intersect, making commute effortless. The area is dominated by towering office plazas, co-working spaces, luxury hotels, and the landmark Terminal 21 shopping mall. It is a highly active neighborhood that caters to fast-paced professionals and urbanites who want everything—from fitness centers to international dining—right at their doorstep, with Benjakitti Forest Park just a short walk away."
  },
  silom: {
    district: "Bang Rak",
    btsCode: "Sala Daeng (S2) / Si Lom (BL26)",
    airportTime: "35–45 min",
    vibe: "Energetic, Inclusive, Diverse",
    bestFor: "Business Travelers, Foodies, Solo Adventurers",
    pros: [
      "Fantastic mix of financial center and historic lanes",
      "Legendary street food and night markets",
      "Inclusive community and vibrant nightlife scene",
      "Quick access to Lumphini Park trails",
      "Dual transit connectivity via BTS and MRT",
      "Proximity to upscale shopping and retail core"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Cozy Corners", image: "/images/lifestyles/silom_cafe.webp" },
      { title: "Dining", subtitle: "Legendary Street", image: "/images/lifestyles/silom_dining.webp" },
      { title: "Nightlife", subtitle: "Vibrant & Late", image: "/images/lifestyles/silom_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Lumphini Adjacent", image: "/images/lifestyles/silom_parks.webp" }
    ],
    lifestyleDesc: "A dynamic neighborhood of contrasts, blending Bangkok's historic commerce with modern financial power. Often referred to as the 'Wall Street of Thailand' by day, Silom is home to major banking headquarters and multinational corporations. By night, it morphs into a vibrant, inclusive, and diverse entertainment district. The neighborhood boasts some of the city's best street food lanes, historic heritage buildings, and the expansive greenery of Lumphini Park at its eastern edge. It is perfect for those who thrive in a high-energy, walk-friendly environment."
  },
  "on-nut": {
    district: "Phra Khanong",
    btsCode: "On Nut (E9)",
    airportTime: "30–40 min",
    vibe: "Value, Local, Relaxed",
    bestFor: "Digital Nomads, Value Seekers, Long-term Expats",
    pros: [
      "Incredible value-for-money rental properties",
      "Massive supermarkets and local food courts",
      "Quieter environment away from downtown noise",
      "Excellent BTS connections to central districts",
      "Thriving community of digital nomads and expats",
      "Abundant street food and local retail options"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Community Cafes", image: "/images/lifestyles/on_nut_cafe.webp" },
      { title: "Dining", subtitle: "Local Food Courts", image: "/images/lifestyles/on_nut_dining.webp" },
      { title: "Nightlife", subtitle: "Beer Gardens", image: "/images/lifestyles/on_nut_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Pocket Parks", image: "/images/lifestyles/on_nut_parks.webp" }
    ],
    lifestyleDesc: "A relaxed, value-oriented residential neighborhood that offers a perfect entry point to Sukhumvit living. On Nut has become a favorite among digital nomads and budget-conscious expats due to its affordable modern condos, local food markets, and hypermarkets like Lotus's and Big C. The vibe is laid-back and local, with a growing number of community malls, cozy cafes, and co-working spots popping up. It provides easy BTS access to the downtown core while offering a quieter, cost-effective base to live and work."
  },
  ekkamai: {
    district: "Watthana",
    btsCode: "Ekkamai (E7)",
    airportTime: "25–35 min",
    vibe: "Leafy, Residential, Cozy",
    bestFor: "Families, Pet Owners, Specialty Coffee Lovers",
    pros: [
      "Quieter, leafy residential sub-sois and lanes",
      "Outstanding specialty coffee roasters and brunch spots",
      "Pet-friendly spaces and rental compounds",
      "Right next to Thong Lo without the high congestion",
      "Excellent community centers and lifestyle shopping",
      "Great connection to the Eastern Bus Terminal and expressways"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Specialty Roasters", image: "/images/lifestyles/ekkamai_cafe.webp" },
      { title: "Dining", subtitle: "Fusion & Brunch", image: "/images/lifestyles/ekkamai_dining.webp" },
      { title: "Nightlife", subtitle: "Craft Beer Pubs", image: "/images/lifestyles/ekkamai_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Garden Cafes", image: "/images/lifestyles/ekkamai_parks.webp" }
    ],
    lifestyleDesc: "A leafy, upscale residential neighborhood that seamlessly blends chic lifestyle venues with quiet family living. Ekkamai runs parallel to Thong Lo, sharing much of its trendy appeal but with a slightly more relaxed, residential feel. It is known for its spacious garden villas, specialty coffee roasters, independent bookshops, and family-friendly community spaces. It is a highly walkable area with a strong focus on high-quality leisure, making it incredibly popular with pet owners, long-term expat families, and coffee connoisseurs."
  },
  sukhumvit: {
    district: "Watthana",
    btsCode: "Phrom Phong (E5)",
    airportTime: "25–35 min",
    vibe: "Global, Retail Core, Premium",
    bestFor: "High-earners, Families, Shopping Lovers",
    pros: [
      "Access to luxury EmDistrict malls (EmQuartier, EmSphere)",
      "Vibrant international community and service teams",
      "Beautiful Benjasiri Park directly next to BTS station",
      "Top concentration of global restaurants and grocers",
      "Premium high-rise residences with city skyline views",
      "Excellent wellness centers and luxury day spas"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Boutique Bakeries", image: "/images/lifestyles/sukhumvit_cafe.webp" },
      { title: "Dining", subtitle: "International Fine", image: "/images/lifestyles/sukhumvit_dining.webp" },
      { title: "Nightlife", subtitle: "Rooftop lounges", image: "/images/lifestyles/sukhumvit_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Benjasiri Park", image: "/images/lifestyles/sukhumvit_parks.webp" }
    ],
    lifestyleDesc: "The prestigious retail and lifestyle heart of downtown Bangkok. Centered around Phrom Phong, this neighborhood represents international luxury, defined by the world-class EmDistrict shopping malls (EmPorium, EmQuartier, EmSphere). The area is exceptionally cosmopolitan, home to a large international expat community, upscale Japanese supermarkets, and premium international schools. With Benjasiri Park providing a lush green escape in the middle of the retail action, it offers an unmatched combination of luxury convenience and urban lifestyle."
  },
  "rama-9": {
    district: "Huai Khwang / Din Daeng",
    btsCode: "Rama 9 MRT (BL20)",
    airportTime: "25–35 min",
    vibe: "Modern, Commercial, High-Density",
    bestFor: "Young Professionals, Office Commuters, Chinese Expats",
    pros: [
      "Rapidly growing corporate hub known as Bangkok's 'New CBD'",
      "Direct MRT Blue Line access and connection to main transport nodes",
      "Excellent retail options at Central Plaza Grand Rama 9 and Fortune Town",
      "Very reasonable condo rents compared to Sukhumvit and Sathorn",
      "Abundance of modern high-rise projects with top-tier facilities",
      "Close to central office plazas and the IT shopping district"
    ],
    vibeCards: [
      { title: "CBD Life", subtitle: "Modern High-Rises", image: "/images/neighborhoods/rama_9.webp" },
      { title: "Tech & IT", subtitle: "Fortune Town Hub", image: "/images/lifestyles/asok_cafe.webp" },
      { title: "Convenience", subtitle: "MRT Integrated Malls", image: "/images/lifestyles/sukhumvit_dining.webp" },
      { title: "Rooftop Lounges", subtitle: "Skyline Views", image: "/images/lifestyles/silom_nightlife.webp" }
    ],
    lifestyleDesc: "A high-energy, modern business and transit corridor widely recognized as Bangkok's 'New CBD'. Rama 9 is characterized by its high-density skyscrapers, corporate offices, and massive shopping malls. Centered around the Rama 9 MRT station, it offers unmatched convenience for commuters and office workers who want to live adjacent to their workplace, with top-tier facilities, cheap IT shopping, and excellent local hot-pot dining."
  },
  "bang-na": {
    district: "Bang Na",
    btsCode: "Bang Na (E13) / Udom Suk (E12)",
    airportTime: "25–35 min",
    vibe: "Suburban, Spacious, Family-oriented",
    bestFor: "Expat Families, International Teachers, Suburban Seekers",
    pros: [
      "Spacious suburban villa compounds and large gated estates",
      "Immediate proximity to top international schools (Patana, Berkeley)",
      "Unparalleled shopping at Mega Bangna and IKEA",
      "Direct BTS Skytrain connection (Sukhumvit Line) to downtown core",
      "Quiet residential environment away from inner-city traffic jams",
      "Excellent road links to eastern industrial zones and beaches"
    ],
    vibeCards: [
      { title: "Spacious Living", subtitle: "Family Villas", image: "/images/neighborhoods/bang_na.webp" },
      { title: "Mega Retail", subtitle: "IKEA & Mega Bangna", image: "/images/neighborhoods/guide_real_estate.webp" },
      { title: "Transit Links", subtitle: "BTS Sukhumvit Line", image: "/images/lifestyles/chatuchak_transit.webp" },
      { title: "Garden Vibe", subtitle: "Green & Shaded Cafes", image: "/images/lifestyles/ekkamai_cafe.webp" }
    ],
    lifestyleDesc: "A spacious and family-centric suburban sanctuary popular with expat residents who want room to breathe. Bang Na offers a relaxed pace of life defined by large residential compounds, international schools, and expansive shopping complexes like Mega Bangna. With direct BTS Skytrain access to the central city, it provides the perfect compromise between suburban tranquility and urban convenience."
  },
  "huai-khwang": {
    district: "Huai Khwang",
    btsCode: "Huai Khwang MRT (BL18)",
    airportTime: "30–40 min",
    vibe: "Local, Vibrant, Culturally Rich",
    bestFor: "Food Lovers, Asian Expats, Students, Budget Nomads",
    pros: [
      "Epicenter of Bangkok's 'New Chinatown' food strip",
      "Fast MRT Blue Line subway connection to main city hubs",
      "Highly affordable housing options and low cost of living",
      "Vibrant nightlife, late-night dining, and active street markets",
      "Close to 24-hour lifestyle complexes like The Street Ratchada",
      "Charming local street vibes and high walkability"
    ],
    vibeCards: [
      { title: "New Chinatown", subtitle: "Authentic Mala Hotpot", image: "/images/neighborhoods/huai_khwang.webp" },
      { title: "Night Markets", subtitle: "Late Night Grazing", image: "/images/lifestyles/silom_nightlife.webp" },
      { title: "24-Hour Nomading", subtitle: "The Street Ratchada", image: "/images/lifestyles/on_nut_cafe.webp" },
      { title: "Local Market", subtitle: "Authentic Thai Stalls", image: "/images/neighborhoods/chatuchak_market.webp" }
    ],
    lifestyleDesc: "A culturally vibrant and budget-friendly residential hub famous for its colorful street life and New Chinatown culinary scene. Huai Khwang offers authentic dining, busy night markets, and 24-hour convenience hubs like The Street Ratchada. It is popular with Asian expats, university students, and digital nomads who appreciate the highly walkable streets, low rent, and late-night food culture."
  },
  "phaya-thai": {
    district: "Ratchathewi",
    btsCode: "Phaya Thai (N3) / ARL Station",
    airportTime: "20–25 min",
    vibe: "Transit-oriented, Academic, Convenient",
    bestFor: "Students, Medical Professionals, Frequent Travelers",
    pros: [
      "Direct Airport Rail Link connection for fast airport transit",
      "BTS interchange node connecting directly to Siam and Sukhumvit",
      "Home to top hospitals, universities, and medical research zones",
      "Popular student cafes, boutique eateries, and roasters along Rangnam Road",
      "Within walking distance to Santiphap Park and King Power Duty Free",
      "Clean, modern high-rise condos catering to young professionals"
    ],
    vibeCards: [
      { title: "Transit Hub", subtitle: "BTS & Airport Link", image: "/images/neighborhoods/phaya_thai.webp" },
      { title: "Rangnam Cafes", subtitle: "Specialty Roasters", image: "/images/lifestyles/ekkamai_cafe.webp" },
      { title: "Santiphap Park", subtitle: "Quiet Green Space", image: "/images/lifestyles/silom_parks.webp" },
      { title: "Duty Free", subtitle: "King Power Mall", image: "/images/lifestyles/ari_dining.webp" }
    ],
    lifestyleDesc: "A bustling, transit-oriented corridor that serves as a key gateway to the city and the airport. Phaya Thai blends academic life, clinical convenience, and modern high-rise living. With the Airport Rail Link and BTS Skytrain meeting at its core, it is highly favored by medical staff, students, and frequent flyers who appreciate its quick access to Siam Paragon, quiet green parks, and the boutique cafe scene along Rangnam Road."
  },
  chatuchak: {
    district: "Chatuchak",
    btsCode: "Mo Chit (N8)",
    airportTime: "25–35 min",
    vibe: "Active, Local, Green",
    bestFor: "Commuters, Nature Lovers, Young Professionals, Couples",
    pros: [
      "Immediate access to Bangkok's largest three-park complex",
      "Exceptional dual-line transit connectivity (BTS Mo Chit & MRT Chatuchak Park)",
      "Unparalleled shopping at Chatuchak Weekend Market and JJ Mall",
      "Highly affordable condo rents with modern high-rise facilities",
      "Thriving local street food scene alongside trendy hidden cafes",
      "Proximity to major office zones (PTT, SCB, and Lardprao intersections)"
    ],
    vibeCards: [
      { title: "Green Space", subtitle: "Exceptional", image: "/images/neighborhoods/chatuchak_park.webp" },
      { title: "Transit Access", subtitle: "Outstanding", image: "/images/lifestyles/chatuchak_transit.webp" },
      { title: "Shopping", subtitle: "World-class", image: "/images/neighborhoods/chatuchak_market.webp" },
      { title: "Affordability", subtitle: "Very Good", image: "/images/lifestyles/chatuchak_affordability.webp" }
    ],
    lifestyleDesc: "A dynamic and highly active residential sanctuary in northern Bangkok. Chatuchak is celebrated for its rare combination of massive public parks and global-scale retail landmarks. Centered around the Mo Chit BTS and Chatuchak Park MRT interchange, it serves as the ultimate northern gateway for commuters. The neighborhood maintains a locally rooted, energetic atmosphere, drawing a mix of corporate office staff, young professionals, and nature lovers who seek room to breathe without sacrificing transit efficiency."
  },
  "rama-4": {
    district: "Pathum Wan / Khlong Toei",
    btsCode: "Lumpini MRT (BL25)",
    airportTime: "25–35 min",
    vibe: "Professional, High-End, Reimagined",
    bestFor: "Corporate Managers, Business Executives, Expatriates, Couples",
    pros: [
      "Immediate proximity to Lumpini Park and Benjakitti Park",
      "Direct transit integration with the massive One Bangkok mega-development",
      "Fast, direct MRT Blue Line subway connectivity to Sathorn and Asok",
      "Brand-new, premium high-rise condominiums with luxury sky facilities",
      "Adjacent to prime Grade-A commercial hubs (The PARQ, FYI Center)",
      "Excellent expressway highway connections for easy airport access"
    ],
    vibeCards: [
      { title: "Park Access", subtitle: "Outstanding", image: "/images/neighborhoods/rama_4_park.webp" },
      { title: "Commercial Hub", subtitle: "World-class", image: "/images/neighborhoods/rama_4_one_bangkok.webp" },
      { title: "Transit Access", subtitle: "Excellent", image: "/images/neighborhoods/rama_4_hero.webp" },
      { title: "Building Vibe", subtitle: "Ultra-modern", image: "/images/neighborhoods/rama_4_condo.webp" }
    ],
    lifestyleDesc: "A core central corridor experiencing a monumental modern renaissance. Rama 4 connects Bangkok's primary corporate CBD (Sathorn and Silom) directly with the main retail strip of Sukhumvit. The neighborhood operates at a fast-forward, highly professional pace, driven by a wave of brand-new corporate skyscrapers, commercial parks, and luxury sky residences. Centered around the Lumpini and Queen Sirikit MRT stations, it serves as the ultimate base for business executives and global professionals."
  },
  "chidlom-ploenchit": {
    district: "Pathum Wan",
    btsCode: "Chit Lom (E1) / Ploenchit (E2)",
    airportTime: "30–40 min",
    vibe: "Ultra-luxury, Prestigious, Elite",
    bestFor: "High-net-worth Individuals, Diplomats, Corporate Leaders",
    pros: [
      "Access to Bangkok's most exclusive retail landmarks (Central Embassy)",
      "Beautiful Wireless Road embassy row with park-like greenery",
      "Ultimate central location on the BTS Sukhumvit line",
      "Extremely secure and well-managed residential developments",
      "Immediate proximity to top international restaurants and tea lounges",
      "Adjacent access to Lumpini Park for outdoor sports"
    ],
    vibeCards: [
      { title: "Embassy Row", subtitle: "Prestigious", image: "/images/neighborhoods/chidlom_ploenchit.webp" },
      { title: "Luxury Retail", subtitle: "World-class", image: "/images/lifestyles/sukhumvit_dining.webp" },
      { title: "Vibe", subtitle: "Elite & Shaded", image: "/images/lifestyles/sathorn_parks.webp" },
      { title: "Dining", subtitle: "Fine Gastronomy", image: "/images/lifestyles/sathorn_dining.webp" }
    ],
    lifestyleDesc: "Bangkok's most prestigious central district, where global diplomacy, corporate power, and ultra-luxury living intersect. Lined with the grand estates of foreign embassies and towering Grade-A commercial towers, the area maintains a highly polished, secure, and exclusive atmosphere. It is the ultimate playground for high-net-worth individuals and corporate directors who demand the finest residential developments, Michelin-standard dining, and covered access to elite retail hubs like Central Embassy, while remaining minutes from Lumpini Park."
  },
  nana: {
    district: "Watthana",
    btsCode: "Nana (E3)",
    airportTime: "30–40 min",
    vibe: "Diverse, High-energy, International",
    bestFor: "Young Professionals, Solo Travelers, Nightlife Seekers",
    pros: [
      "Central Sukhumvit location with instant BTS connection",
      "Vibrant international food district including Soi Arab",
      "Immediate access to Bumrungrad International Hospital",
      "Abundant nightlife, rooftop bars, and active street markets",
      "More spacious older condo layouts available at great prices",
      "Close to major central office parks (Asok / Ploenchit)"
    ],
    vibeCards: [
      { title: "Food Scene", subtitle: "Global Cuisines", image: "/images/lifestyles/on_nut_dining.webp" },
      { title: "Nightlife", subtitle: "High Energy", image: "/images/lifestyles/asok_nightlife.webp" },
      { title: "Healthcare", subtitle: "Bumrungrad Hub", image: "/images/lifestyles/nana_healthcare.webp" },
      { title: "Transit", subtitle: "BTS Accessible", image: "/images/lifestyles/chatuchak_transit.webp" }
    ],
    lifestyleDesc: "A bustling and highly cosmopolitan transit hub in the heart of Sukhumvit. Nana is celebrated for its incredible cultural diversity, offering some of the best Middle Eastern and international culinary enclaves in the city. By day, it is a key commercial zone close to Bumrungrad Hospital; by night, it transforms into an energetic entertainment center with lively street markets and rooftop lounges. It is popular with active urbanites who want central convenience, affordable space, and a non-stop city pulse."
  },
  "phra-khanong": {
    district: "Watthana / Khlong Toei",
    btsCode: "Phra Khanong (E8)",
    airportTime: "30–40 min",
    vibe: "Hip, Artistic, Community-centric",
    bestFor: "Digital Nomads, Creatives, Budget-conscious Expats",
    pros: [
      "Trendy open-air social center at W District",
      "Growing collection of indie cafes and artisan bakeries",
      "Significantly lower rents compared to Thong Lo and Ekkamai",
      "Active, friendly community of international designers and artists",
      "Excellent BTS skytrain connectivity to downtown core",
      "Relaxed residential sub-sois with minimal high-rise traffic"
    ],
    vibeCards: [
      { title: "Creative Vibe", subtitle: "Hipster Pockets", image: "/images/lifestyles/ari_cafe.webp" },
      { title: "Social Hub", subtitle: "W District", image: "/images/lifestyles/on_nut_nightlife.webp" },
      { title: "Value", subtitle: "Outstanding Rent", image: "/images/lifestyles/on_nut_cafe.webp" },
      { title: "Art Scene", subtitle: "Indie Galleries", image: "/images/lifestyles/ari_dining.webp" }
    ],
    lifestyleDesc: "A hip and creative residential sanctuary that serves as the artsy younger sibling to Thong Lo and Ekkamai. Phra Khanong has quickly become a favorite base for digital nomads, tech freelancers, and international creatives due to its unique blend of local Thai charm and modern hipster venues. The neighborhood revolves around community spaces like W District, where residents gather for casual dinners, draft beers, and live music, alongside a thriving network of independent roasters and co-working spots."
  },
  ladprao: {
    district: "Chatuchak / Lat Phrao",
    btsCode: "Ha Yaek Lat Phrao (N9) / Phahon Yothin MRT (BL14)",
    airportTime: "30–40 min",
    vibe: "Local, Bustling, Commuter Hub",
    bestFor: "Students, Commuters, Budget-conscious Expats",
    pros: [
      "Outstanding dual-line transit (BTS Skytrain and MRT Subway)",
      "Excellent local retail at Central Plaza Ladprao and Union Mall",
      "Highly affordable cost of living and food choices",
      "Great selection of modern high-rise condos with rooftop pools",
      "Close to major university campuses and public park zones",
      "Lively local night markets and authentic street food hubs"
    ],
    vibeCards: [
      { title: "Shopping Malls", subtitle: "Union & Central", image: "/images/neighborhoods/chatuchak_market.webp" },
      { title: "Transit hub", subtitle: "Dual-Line Access", image: "/images/lifestyles/chatuchak_transit.webp" },
      { title: "Affordability", subtitle: "Exceptional Value", image: "/images/lifestyles/ladprao_affordability.webp" },
      { title: "Local Life", subtitle: "Authentic Thai", image: "/images/lifestyles/on_nut_dining.webp" }
    ],
    lifestyleDesc: "A high-energy residential and retail corridor in northern Bangkok. Centered around a massive BTS and MRT transit interchange, Ladprao is a strategic home base for commuters, university students, and young professionals. The area feels genuinely local, featuring major shopping landmarks like Central Plaza Ladprao and Union Mall, cheap street dining, and pocket cafes. It offers a highly practical lifestyle where you can live in a modern building and travel anywhere in the city at a fraction of downtown prices."
  },
  thonburi: {
    district: "Thon Buri",
    btsCode: "Krung Thon Buri (G1)",
    airportTime: "35–45 min",
    vibe: "Peaceful, Historic, Traditional",
    bestFor: "Retirees, Long-term Families, Local-leaning Expats",
    pros: [
      "Quiet residential alleys and canals on the west bank",
      "Beautiful creative spaces like The Jam Factory",
      "Affordable rental properties next to the river",
      "Fast, direct BTS Skytrain access to the Sathorn CBD",
      "Rich cultural history with historic temples and heritage streets",
      "Proximity to massive ICONSIAM riverside shopping mall"
    ],
    vibeCards: [
      { title: "Riverside Vibe", subtitle: "Quiet & Scenic", image: "/images/neighborhoods/thonburi.webp" },
      { title: "Creative Hub", subtitle: "The Jam Factory", image: "/images/lifestyles/ari_cafe.webp" },
      { title: "Transit", subtitle: "Direct BTS to CBD", image: "/images/lifestyles/chatuchak_transit.webp" },
      { title: "History", subtitle: "Temples & Alleys", image: "/images/lifestyles/sathorn_parks.webp" }
    ],
    lifestyleDesc: "A peaceful and culturally rich historic sanctuary situated on the west bank of the Chao Phraya River. Historically a capital in its own right, Thonburi preserves a relaxed, neighborhood-centric atmosphere characterized by winding canals, low-rise homes, and centuries-old temples. With creative spaces like The Jam Factory offering art, books, and weekend design markets, it appeals to those seeking local character and room to breathe, while being just an 8-minute skytrain ride from Sathorn."
  },
  charoenkrung: {
    district: "Bang Rak / Sathon",
    btsCode: "Saphan Taksin (S6)",
    airportTime: "35–45 min",
    vibe: "Historic, Cultural, Artistic",
    bestFor: "Art Lovers, Creative Professionals, Culinary Foodies",
    pros: [
      "Epicenter of Bangkok's historic Creative District",
      "Access to design libraries and archives at TCDC Grand Postal",
      "Legendary street food history combined with Michelin dining",
      "Artisanal warehouse galleries and design hubs (Warehouse 30)",
      "Scenic riverside connectivity and shuttle boats",
      "Charming colonial-era architecture and shophouse lanes"
    ],
    vibeCards: [
      { title: "Art District", subtitle: "TCDC & Galleries", image: "/images/neighborhoods/charoenkrung.webp" },
      { title: "Coffee & Dining", subtitle: "Restored Shophouses", image: "/images/lifestyles/ekkamai_cafe.webp" },
      { title: "Riverside", subtitle: "Saphan Taksin Hub", image: "/images/lifestyles/sathorn_parks.webp" },
      { title: "Street Food", subtitle: "Bangrak Classics", image: "/images/lifestyles/on_nut_dining.webp" }
    ],
    lifestyleDesc: "A mesmerizing blend of historic heritage and forward-looking art. As Bangkok's oldest paved road, Charoenkrung is defined by its colonial architecture, ancient shophouses, and riverside piers. Reborn as the city's Creative District, it is home to the Thailand Creative & Design Center (TCDC), art hubs like Warehouse 30, and speakeasy bars. It is the ultimate base for creatives and food lovers who want an inspiring, walkable area full of history and character next to Sathon."
  },
  "sam-yan": {
    district: "Pathum Wan",
    btsCode: "Sam Yan MRT (BL27)",
    airportTime: "30–40 min",
    vibe: "Academic, Youthful, Emerging Tech",
    bestFor: "Students, Tech Founders, Researchers, Couples",
    pros: [
      "Immediate proximity to Chulalongkorn University campus",
      "Modern 24-hour study and retail facilities at Samyan Mitrtown",
      "Gorgeous green spaces at CU Centenary Park",
      "Abundant student food options and affordable dining lanes",
      "Direct MRT Blue Line subway connection to central core",
      "Highly walkable, clean streets with modern city layout"
    ],
    vibeCards: [
      { title: "University Vibe", subtitle: "Youthful & Active", image: "/images/neighborhoods/sam_yan.webp" },
      { title: "Study Spaces", subtitle: "24-Hour Nomading", image: "/images/lifestyles/ari_cafe.webp" },
      { title: "Green Space", subtitle: "CU Centenary Park", image: "/images/neighborhoods/rama_4_park.webp" },
      { title: "Affordability", subtitle: "Student Budgets", image: "/images/lifestyles/on_nut_cafe.webp" }
    ],
    lifestyleDesc: "A youthful and innovative hub of academic and technological activity next to Chulalongkorn University. Sam Yan has evolved into a smart city sandbox, combining digital workspaces, modern high-rises, and green parks like the CU Centenary Park. It is populated by university students, researchers, and tech startups, creating a fast-paced but collaborative environment with plenty of 24-hour convenience, student eateries, and fast subway access to Silom."
  },
  "khlong-san": {
    district: "Khlong San",
    btsCode: "Charoen Nakhon (Gold Line)",
    airportTime: "35–45 min",
    vibe: "Scenic, Luxury, Riverside",
    bestFor: "Riverside Lovers, Luxury Renters, Retirees",
    pros: [
      "Access to ICONSIAM luxury mega-mall and SookSiam market",
      "Panoramic views of the Chao Phraya River and city skyline",
      "BTS Gold Line skytrain connection directly to Silom line",
      "Premium, high-security luxury high-rises with private piers",
      "World-class waterfront dining and luxury hotel options",
      "Relaxed, scenic atmosphere away from central traffic jams"
    ],
    vibeCards: [
      { title: "ICONSIAM", subtitle: "Luxury & Dining", image: "/images/neighborhoods/khlong_san.webp" },
      { title: "River View", subtitle: "Panoramic Views", image: "/images/neighborhoods/thonburi.webp" },
      { title: "Gold Line", subtitle: "Modern Transit", image: "/images/lifestyles/chatuchak_transit.webp" },
      { title: "Luxury Condos", subtitle: "Private Piers", image: "/images/neighborhoods/rama_4_condo.webp" }
    ],
    lifestyleDesc: "An exclusive riverside enclave on the west bank of the Chao Phraya, defined by premium waterfront living and global-scale retail. Khlong San revolves around the landmark ICONSIAM mega-mall, offering world-class luxury shopping and dining options. It is home to upscale high-rise condos with private boat docks and resort facilities, providing a scenic, secure, and relaxed lifestyle for affluent expats, retirees, and riverside lovers who commute via the Gold Line skytrain."
  }
};

const DEFAULT_METADATA = {
  district: "Bangkok District",
  btsCode: "BTS Station",
  airportTime: "30–40 min",
  vibe: "Friendly, Local, Residential",
  bestFor: "Expats, Professionals, Families",
  pros: [
    "Convenient transit connections to CBD areas",
    "Good assortment of local dining and supermarkets",
    "Great walkability and friendly atmosphere",
    "Suitable for families and active remote workers"
  ],
  vibeCards: [
    { title: "Cafe Culture", subtitle: "Great variety", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&q=80" },
    { title: "Dining", subtitle: "Excellent options", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&q=80" },
    { title: "Nightlife", subtitle: "Cozy & Relaxed", image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&auto=format&q=80" },
    { title: "Parks & Green", subtitle: "Accessible spaces", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&q=80" }
  ],
  lifestyleDesc: "A perfect blend of lifestyle and local culture. The neighborhood is known for its tree-lined alleys, artisanal community spaces, independent shops, and some of the best specialty cafe options in Bangkok."
};

export default function NeighborhoodClient({ neighborhood, initialProperties }: Props) {
  const { t, lang } = useLanguage();
  const { formatPrice } = useCurrency();
  const { isSaved: isPropertySaved, toggle: togglePropertySave } = useSaved();

  const [copied, setCopied] = useState(false);
  const [selectedLongFormSection, setSelectedLongFormSection] = useState<number | null>(null);

  // Expat reviews state
  const [reviewsList, setReviewsList] = useState<any[]>(() => {
    const slug = neighborhood.slug.toLowerCase();
    if (slug === "sathorn") {
      return [
        {
          author: "Marcus",
          role: "Corporate Expat",
          origin: "🇬🇧 London, UK",
          stay: "Lived here: 3 years",
          location: "Sathorn Soi 10",
          verified: true,
          date: "July 2026",
          rating: 5,
          pros: "Quiet, leafy side-sois around Suan Phlu and Soi 10 are filled with high-end European bistros and cafes. You can walk to the office in Empire Tower in 5 minutes.",
          cons: "Sathorn Road itself is a complete parking lot during rush hour (5:00 PM - 7:30 PM). The canal on Soi 3 smells quite bad in the hot season, and local street food is disappearing."
        },
        {
          author: "Emily & Ben",
          role: "Expat Parents",
          origin: "🇦🇺 Melbourne",
          stay: "Lived here: 1.5 years",
          location: "Yen Akat Rd",
          verified: true,
          date: "June 2026",
          rating: 4,
          pros: "Excellent international nurseries and school bus routes. BNH Hospital is nearby. Yen Akat has a lovely residential neighborhood vibe with pet-friendly cafes.",
          cons: "Flooding on Yen Akat during downpours is real. Sidewalks are narrow, and taking a taxi during school pick-up times is a nightmare."
        },
        {
          author: "Sven",
          role: "Digital Nomad",
          origin: "🇩🇪 Berlin",
          stay: "Lived here: 9 months",
          location: "Suan Phlu",
          verified: false,
          date: "May 2026",
          rating: 4,
          pros: "Great wellness centers, gym options, and proximity to Lumphini Park. Excellent craft beer bars and quiet coffee spots off the main road.",
          cons: "Rental prices are 20-30% higher than On Nut or Lat Phrao. Street noise can be annoying on weekends if you are close to the hotels."
        }
      ];
    } else if (slug === "ari") {
      return [
        {
          author: "Liam",
          role: "Digital Nomad",
          origin: "🇬🇧 Leeds, UK",
          stay: "Lived here: 2 years",
          location: "Phahon Yothin Soi 7",
          verified: true,
          date: "July 2026",
          rating: 5,
          pros: "Specialty coffee capital of Bangkok. Leafy streets, low-rise architecture, and a wonderful creative, slow-paced atmosphere. Highly walkable.",
          cons: "Expressway entrance nearby gets extremely jammed. Ari BTS station gets extremely crowded during morning commute times."
        },
        {
          author: "Clara",
          role: "Expat Family",
          origin: "🇺🇸 Seattle, USA",
          stay: "Lived here: 3 years",
          location: "Ari Soi 4",
          verified: true,
          date: "June 2026",
          rating: 5,
          pros: "Great community feel, very child-friendly and pet-friendly. Villa Market right at the BTS is perfect for Western groceries.",
          cons: "Sidewalks are narrow and often blocked by parked motorbikes or cafe signboards. Rents are rising quickly due to high demand."
        },
        {
          author: "Takahiro",
          role: "Young Professional",
          origin: "🇯🇵 Tokyo",
          stay: "Lived here: 1 year",
          location: "Ari Soi 1",
          verified: true,
          date: "May 2026",
          rating: 4,
          pros: "Incredible selection of Japanese dining and quiet hipster bars. Lower density means you can actually see the sky.",
          cons: "Quite far from Sukhumvit nightlife and CBD business centers if you need to commute there daily by car."
        }
      ];
    } else if (slug === "ekkamai") {
      return [
        {
          author: "James",
          role: "Young Professional",
          origin: "🇨🇦 Vancouver",
          stay: "Lived here: 2 years",
          location: "Sukhumvit Soi 63",
          verified: true,
          date: "July 2026",
          rating: 5,
          pros: "Access to Thong Lo's bars and restaurants at a much better rental price. Big C Supercenter has everything, and Gateway Ekkamai mall is highly convenient.",
          cons: "Sukhumvit Soi 63 floods up to your ankles during heavy rain. The BTS station gets crowded, and there are fewer large green parks nearby."
        },
        {
          author: "Helen",
          role: "Retiree",
          origin: "🇳🇿 Auckland",
          stay: "Lived here: 4 years",
          location: "Ekkamai Soi 12",
          verified: true,
          date: "June 2026",
          rating: 4,
          pros: "Beautiful quiet side lanes with large houses and boutique cafes. Good connections to the Sirat Expressway via back-sois.",
          cons: "Taxis frequently refuse to turn on meters during rush hour on Ekkamai road. Sidewalks are uneven and lack trees for shade in many spots."
        }
      ];
    } else if (slug === "sukhumvit") {
      return [
        {
          author: "Dave",
          role: "Digital Nomad",
          origin: "🇺🇸 Chicago",
          stay: "Lived here: 1.5 years",
          location: "Sukhumvit Soi 23 (Asok)",
          verified: true,
          date: "July 2026",
          rating: 5,
          pros: "Unmatched transport convenience with the BTS/MRT interchange. Walking distance to Benjakitti Forest Park and Terminal 21 mall.",
          cons: "Extremely busy, loud, and polluted. Soi 21 and Soi 23 have heavy motorcycle traffic and the smell of exhaust is constant."
        },
        {
          author: "Nadia",
          role: "Corporate Expat",
          origin: "🇫🇷 Paris",
          stay: "Lived here: 3 years",
          location: "Phrom Phong Soi 39",
          verified: true,
          date: "June 2026",
          rating: 4,
          pros: "World-class luxury shopping (EmQuartier/EmSphere) and wonderful international dining options. Benchasiri Park is right there.",
          cons: "Extremely expensive renting cost compared to other neighborhoods. Traffic on Sukhumvit Road is a nightmare 24/7."
        }
      ];
    } else if (slug === "thonburi") {
      return [
        {
          author: "Pavel",
          role: "Digital Nomad",
          origin: "🇷🇺 Moscow",
          stay: "Lived here: 1 year",
          location: "Krung Thon Buri",
          verified: true,
          date: "July 2026",
          rating: 5,
          pros: "Incredible value for money. Modern high-rise condos with rooftop pools for half the price of Sukhumvit. Clean air near the river.",
          cons: "Crossing the river to central Sukhumvit takes a long time if you use taxis. ICONSIAM is great, but local nightlife is quiet."
        },
        {
          author: "Regina",
          role: "Retiree",
          origin: "🇬🇧 Bristol",
          stay: "Lived here: 5 years",
          location: "Khlong San",
          verified: true,
          date: "June 2026",
          rating: 4,
          pros: "Charming traditional canal life, local fresh markets, and very low crime. The BTS Gold Line is a nice modern addition.",
          cons: "Traditional narrow lanes make walking with luggage difficult, and there are very few English-speaking medical clinics."
        }
      ];
    } else if (slug === "charoenkrung") {
      return [
        {
          author: "Linus",
          role: "Young Professional",
          origin: "🇸🇪 Stockholm",
          stay: "Lived here: 2 years",
          location: "Talad Noi",
          verified: true,
          date: "July 2026",
          rating: 5,
          pros: "Artistic, historic charm. Walking through street art alleys, converted warehouses, speakeasies, and historic Chinese shrines.",
          cons: "Very narrow streets with no space for cars. Public transit options are limited to Taksin BTS and commuter boats, which stop early."
        },
        {
          author: "Sophia",
          role: "Expat Artist",
          origin: "🇦🇺 Sydney",
          stay: "Lived here: 1.5 years",
          location: "Bang Rak",
          verified: false,
          date: "June 2026",
          rating: 4,
          pros: "Famous street food stalls, old-world shophouse architecture, and creative community hubs like Warehouse 30.",
          cons: "Buildings are mostly older, low-rise shophouses with fewer modern luxury condo options. Heavy construction dust in some zones."
        }
      ];
    } else {
      return [
        {
          author: "Alex",
          role: "Digital Nomad",
          origin: "🇺🇸 New York",
          stay: "Lived here: 1 year",
          location: "Main BTS Soi",
          verified: true,
          date: "July 2026",
          rating: 4,
          pros: "Convenient access to public transit, supermarkets, and local dining.",
          cons: "Traffic congestion during peak office hours and high humidity during rainy season."
        },
        {
          author: "Sarah",
          role: "Local Expat",
          origin: "🇬🇧 Manchester",
          stay: "Lived here: 2 years",
          location: "Residential Lane",
          verified: true,
          date: "June 2026",
          rating: 4,
          pros: "Quiet, safe residential area with friendly local neighbors and nice street vendors.",
          cons: "Narrow sidewalks and limited green park space in the immediate vicinity."
        }
      ];
    }
  });
  const [userRating, setUserRating] = useState(5);
  const [userPersona, setUserPersona] = useState("Digital Nomad");
  const [userName, setUserName] = useState("");
  const [userOrigin, setUserOrigin] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [userPros, setUserPros] = useState("");
  const [userCons, setUserCons] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const trans = T_NEIGHBORHOOD[lang] || T_NEIGHBORHOOD.en;
  const transN = trans.neighborhoods[neighborhood.slug.toLowerCase() as keyof typeof trans.neighborhoods];

  const nName = transN?.name || neighborhood.name;
  const nPersonality = transN?.personality || neighborhood.personality;
  const nDescription = transN?.description || neighborhood.description;
  const nNearestTransit = transN?.nearestTransit || neighborhood.nearestTransit;

  const meta = NEIGHBORHOOD_METADATA[neighborhood.slug.toLowerCase()] || DEFAULT_METADATA;

  const nDistrict = transN?.district || meta.district;
  const nBtsCode = transN?.btsCode || meta.btsCode;
  const nAirportTime = transN?.airportTime || meta.airportTime;
  const nVibe = transN?.vibe || meta.vibe;
  const nBestFor = transN?.bestFor || meta.bestFor;
  const nLifestyleDesc = transN?.lifestyleDesc || meta.lifestyleDesc || `A perfect blend of lifestyle and local culture. ${nName} is known for its tree-lined alleys, artisanal community spaces, independent shops, and some of the best specialty cafe options in Bangkok.`;
  const nPros = transN?.pros || meta.pros;

  const nVibeCards = useMemo(() => {
    return meta.vibeCards.map((card, idx) => {
      const transCard = transN?.vibeCards?.[idx];
      return {
        ...card,
        title: transCard?.title || card.title,
        subtitle: transCard?.subtitle || card.subtitle
      };
    });
  }, [meta.vibeCards, transN]);

  const guide = NEIGHBORHOOD_GUIDES[neighborhood.slug.toLowerCase()];

  const NEARBY_MAP: Record<string, string[]> = {
    ari: ["phaya-thai", "asok", "sukhumvit"],
    sathorn: ["silom", "sukhumvit", "asok"],
    silom: ["sathorn", "sukhumvit", "asok"],
    "thong-lo": ["ekkamai", "on-nut", "sukhumvit"],
    asok: ["sukhumvit", "rama-9", "thong-lo"],
    "on-nut": ["ekkamai", "sukhumvit", "thong-lo"],
    ekkamai: ["thong-lo", "on-nut", "sukhumvit"],
    sukhumvit: ["asok", "thong-lo", "ekkamai"],
    "rama-9": ["huai-khwang", "asok", "sukhumvit"],
    "bang-na": ["on-nut", "ekkamai", "sukhumvit"],
    "huai-khwang": ["rama-9", "asok", "phaya-thai"],
    "phaya-thai": ["ari", "huai-khwang", "asok"],
    chatuchak: ["ari", "phaya-thai", "huai-khwang"],
    "rama-4": ["sathorn", "silom", "sukhumvit"]
  };

  const nearbySlugs = NEARBY_MAP[neighborhood.slug.toLowerCase()] || [];
  const nearbyNeighborhoods = NEIGHBORHOODS.filter(n => nearbySlugs.includes(n.slug.toLowerCase()));

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Percentage Match metrics computed from neighborhood scores
  const matchMetrics = useMemo(() => {
    const scores = neighborhood.scores;
    return [
      { label: "Remote Work", score: Math.min(98, (scores.remoteWork ?? 8) * 9 + 2) },
      { label: "Lifestyle", score: Math.min(98, (scores.cafeCulture ?? 8) * 8 + 10) },
      { label: "Commute", score: Math.min(98, (scores.walkability ?? 8) * 8 + 13) },
      { label: "Nightlife", score: Math.min(98, (scores.nightlife ?? 5) * 10 + 15) },
    ];
  }, [neighborhood.scores]);

  const translatedMetricLabel = (label: string) => {
    if (lang === "th") {
      if (label === "Remote Work") return "ทำงานทางไกล";
      if (label === "Lifestyle") return "ไลฟ์สไตล์";
      if (label === "Commute") return "การเดินทาง";
      if (label === "Nightlife") return "ชีวิตยามค่ำคืน";
    }
    if (lang === "zh") {
      if (label === "Remote Work") return "远程工作";
      if (label === "Lifestyle") return "生活方式";
      if (label === "Commute") return "通勤交通";
      if (label === "Nightlife") return "夜生活";
    }
    return label;
  };

  // Featured Properties — real database listings for this neighbourhood only
  const displayProperties = useMemo(() => {
    return initialProperties.filter(
      (p) => p.area.toLowerCase() === neighborhood.name.toLowerCase()
    );
  }, [initialProperties, neighborhood]);

  // Relevant blog posts for this neighborhood
  const relevantBlogs = useMemo(() => {
    const nName = neighborhood.name.toLowerCase();
    const filtered = POSTS.filter((post) => {
      return (
        post.title.toLowerCase().includes(nName) ||
        post.excerpt.toLowerCase().includes(nName) ||
        post.tags.some((t) => t.toLowerCase() === nName) ||
        post.keywords.some((k) => k.toLowerCase().includes(nName))
      );
    });

    // If we have fewer than 3, pad with the latest general expat guides
    if (filtered.length < 3) {
      const general = POSTS.filter((post) => !filtered.some((f) => f.slug === post.slug));
      return [...filtered, ...general].slice(0, 3);
    }
    return filtered.slice(0, 3);
  }, [neighborhood]);

  return (
    <div className="flex flex-col w-full pb-10" style={{ background: "#FAF8F3" }}>
      {/* ── HERO BANNER ── */}
      <section
        className="relative w-full text-white overflow-hidden pt-6 pb-20 md:py-14 px-4 md:px-8 flex flex-col justify-end"
        style={{ minHeight: "380px" }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={neighborhood.heroImage}
            alt={neighborhood.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Shaded overlay */}
          <div className="absolute inset-0 hero-gradient-overlay" />
        </div>

        {/* Share Alert Toast */}
        {copied && (
          <div
            className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-lg animate-fade-in border"
            style={{ background: "#1C3A2F", color: "#E2C97E", borderColor: "#C9A84C" }}
          >
            {trans.linkCopied}
          </div>
        )}

        {/* Top Header Row: Breadcrumbs & Buttons */}
        <div className="w-full max-w-[1440px] mx-auto z-10 flex items-center justify-between gap-4 mb-3 md:mb-5">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-white/60 font-light">
            <Link href="/" className="hover:text-white no-underline">{trans.home}</Link>
            <span>&gt;</span>
            <span className="font-semibold text-[#E2C97E]">{nName} {trans.neighborhoodSuffix}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-white/20 transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", color: "#FFFFFF" }}
            >
              <span className="flex items-center gap-1.5">{trans.share} <ArrowUpRight className="w-3.5 h-3.5" /></span>
            </button>
          </div>
        </div>

        {/* Main Hero Row: Content on Left, Scorecard on Right */}
        <div className="w-full max-w-[1440px] mx-auto z-10 flex flex-row items-end justify-between gap-6 md:gap-8 hero-content-row">
          {/* Left Hero Content */}
          <div className="flex-1 flex flex-col items-start text-left">
            {/* Guide Badge */}
            <span
              className="px-2.5 py-0.5 rounded text-[9px] font-bold tracking-[1.5px] uppercase mb-3"
              style={{ background: "rgba(201, 168, 76, 0.18)", border: "1px solid rgba(201, 168, 76, 0.3)", color: "#E2C97E" }}
            >
              {trans.neighborhoodGuide}
            </span>

            {/* Neighborhood Name */}
            <h1 className="text-3xl md:text-5xl font-bold mb-1 leading-tight hero-title" style={{ color: "#FFFFFF" }}>
              {nName}
            </h1>

            {/* Personality Tagline */}
            <p className="text-base md:text-xl font-medium italic text-[#E2C97E] mb-3 hero-tagline">
              {nPersonality}
            </p>

            {/* Description */}
            <p className="text-xs md:text-sm leading-relaxed text-white/80 max-w-xl font-light mb-5">
              {nDescription}
            </p>

            {/* Transit Badges Row (Mobile only) */}
            <div className="flex flex-col gap-2 text-[10px] md:hidden w-full">
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                <Train size={11} className="text-[#E2C97E]" /> {nNearestTransit} (5 {trans.minWalk})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                <Train size={11} className="text-[#E2C97E]" /> Sukhumvit Line ({trans.easyAccess})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                <Coffee size={11} className="text-[#E2C97E]" /> {lang === 'en' ? 'Cafe Culture' : lang === 'th' ? 'วัฒนธรรมคาเฟ่' : '咖啡文化'} ({lang === 'en' ? 'Excellent' : lang === 'th' ? 'ยอดเยี่ยม' : '极佳'})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                <Footprints size={11} className="text-[#E2C97E]" /> {lang === 'en' ? 'Walkability' : lang === 'th' ? 'ความสะดวกในการเดิน' : '步行便利度'} ({neighborhood.scores.walkability}/10)
              </span>
            </div>

            {/* Transit Badges Row (Desktop only) */}
            <div className="hidden md:flex md:flex-wrap gap-2 text-[10.5px]">
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                <Train size={11} className="text-[#E2C97E]" /> {nNearestTransit} (5 {trans.minWalk})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                <Train size={11} className="text-[#E2C97E]" /> Sukhumvit Line ({trans.easyAccess})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                <Coffee size={11} className="text-[#E2C97E]" /> {lang === 'en' ? 'Cafe Culture' : lang === 'th' ? 'วัฒนธรรมคาเฟ่' : '咖啡文化'} ({lang === 'en' ? 'Excellent' : lang === 'th' ? 'ยอดเยี่ยม' : '极佳'})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                <Footprints size={11} className="text-[#E2C97E]" /> {lang === 'en' ? 'Walkability' : lang === 'th' ? 'ความสะดวกในการเดิน' : '步行便利度'} ({neighborhood.scores.walkability}/10)
              </span>
            </div>
          </div>

          {/* Right Hero Card - How Area Matches You */}
          <div className="w-[180px] sm:w-[240px] md:w-[280px] lg:w-[320px] flex-shrink-0 text-left scorecard-container mb-8 md:mb-0">
            {/* Scorecard Card */}
            <div
              className="rounded-2xl p-4 sm:p-5 border flex flex-col gap-3 sm:gap-4 shadow-xl"
              style={{ background: "#10231D", borderColor: "rgba(201, 168, 76, 0.3)" }}
            >
              <div>
                <h3 className="text-[10px] sm:text-xs font-bold text-[#E2C97E] tracking-wider uppercase mb-0.5">{trans.matchesYou.replace("{name}", nName)}</h3>
                <p className="text-[9px] sm:text-[10px] text-white/50">{trans.basedOnParams}</p>
              </div>

              {/* Gauges list */}
              <div className="flex flex-col gap-2 sm:gap-3">
                {matchMetrics.map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] sm:text-[11px] font-medium text-white/90">
                      <span>{translatedMetricLabel(item.label)}</span>
                      <span className="font-semibold" style={{ color: "#E2C97E" }}>{item.score}%</span>
                    </div>
                    {/* Gauge bar */}
                    <div className="w-full h-1 sm:h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${item.score}%`, background: "#C9A84C" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Match CTA button */}
              <a
                href={`/explore/match`}
                className="w-full py-2 sm:py-2.5 rounded-xl text-center text-[10px] sm:text-xs font-bold no-underline mt-1 transition-all block"
                style={{ background: "#C9A84C", color: "#1C3A2F" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#D4B665")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#C9A84C")}
              >
                {trans.seeMatches.replace("{name}", nName)}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHITE CARD CONTAINER SECTION ── */}
      <section className="px-4 md:px-8 -mt-5 relative z-20">
        <div
          className="w-full max-w-[1440px] mx-auto rounded-3xl p-6 md:p-8 shadow-md border"
          style={{ background: "#FFFFFF", borderColor: "#EDE8DF" }}
        >
          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 white-card-grid gap-8 items-stretch">
            
            {/* Column 1: AT A GLANCE (at-a-glance-col) */}
            <div className="flex flex-col gap-4 text-left at-a-glance-col">
              <h3 className="text-xs font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                {trans.atAGlance}
              </h3>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Building2 size={13} className="text-[#C9A84C]" /> {trans.area}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{nDistrict}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Train size={13} className="text-[#C9A84C]" /> {trans.btsStation}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{nBtsCode}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Train size={13} className="text-[#C9A84C]" /> {lang === 'en' ? 'Travel to Asok' : lang === 'th' ? 'เดินทางไปอโศก' : '前往阿索克'}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{neighborhood.commuteMinutes["Asok"]} {trans.min}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Train size={13} className="text-[#C9A84C]" /> {lang === 'en' ? 'Travel to Silom' : lang === 'th' ? 'เดินทางไปสีลม' : '前往是隆'}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{neighborhood.commuteMinutes["Silom"]} {trans.min}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Plane size={13} className="text-[#C9A84C]" /> {trans.airport}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{nAirportTime}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#C9A84C]" /> {trans.vibe}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{nVibe}</span>
                </div>
                <div className="flex flex-col py-1.5">
                  <span className="text-gray-500 font-light mb-1 flex items-center gap-1.5">
                    <ThumbsUp size={13} className="text-[#C9A84C]" /> {trans.bestFor}
                  </span>
                  <span className="font-medium leading-relaxed" style={{ color: "#1C3A2F" }}>{nBestFor}</span>
                </div>
              </div>
            </div>

            {/* Column 2: LIFESTYLE & VIBE (lifestyle-col) */}
            <div className="flex flex-col gap-4 text-left lifestyle-col md:h-full">
              <h3 className="text-xs font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                {trans.lifestyleVibe}
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 font-light md:hidden">
                {nLifestyleDesc}
              </p>
              <p className="text-xs md:text-sm leading-relaxed text-gray-600 font-light hidden md:block">
                {nLifestyleDesc}
              </p>
              
              {/* Vibe cards row */}
              <div className="flex overflow-x-auto no-scrollbar gap-3 mt-2 md:mt-auto -mx-4 px-4 scroll-smooth md:grid md:grid-cols-4 md:mx-0 md:px-0">
                {nVibeCards.map((card) => (
                  <div
                    key={card.title}
                    className="relative rounded-xl overflow-hidden shadow-sm aspect-[4/3] group cursor-pointer w-[160px] min-w-[160px] flex-shrink-0 md:w-auto md:min-w-0 md:flex-shrink"
                  >
                    <VibeCard card={card} />
                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }}
                    />
                    {/* Bottom-left text */}
                    <div className="absolute bottom-0 left-0 p-3 text-left w-full">
                      <span className="text-[11px] font-bold text-white block leading-tight truncate">{card.title}</span>
                      <span className="text-[9px] text-white/80 block mt-0.5 font-light truncate">{card.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: WHY PEOPLE LOVE & Map (love-map-col) */}
            <div className="flex flex-col gap-4 text-left w-full love-map-col md:h-full">
              <h3 className="text-xs font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                {trans.whyPeopleLove.replace("{name}", nName)}
              </h3>
              <div className="love-map-grid gap-6 w-full items-stretch md:h-full md:flex-1">
                <ul className="flex flex-col gap-2.5 text-xs text-gray-600 font-light pl-0 list-none">
                  {nPros.map((pro, index) => (
                    <li
                      key={pro}
                      className={`flex items-start gap-2${index >= 5 ? " hidden md:flex" : ""}`}
                    >
                      <Check size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>

                {/* Dynamic Promo container - Desktop Only */}
                <div className="hidden md:flex w-full flex-col gap-2 md:justify-center">
                  {/* Looking for a place promo box - Desktop Only */}
                  <div className="bg-[#FAF8F3] p-6 rounded-3xl border border-[#EDE8DF] flex flex-col gap-3 text-left">
                    <h4 className="text-sm font-bold text-[#1C3A2F] m-0">{trans.lookingForPlace.replace("{name}", nName)}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-light font-sans m-0">
                      {trans.promoDesc.replace("{name}", nName)}
                    </p>
                    <a
                      href="#properties-section"
                      className="text-xs font-bold text-[#C9A84C] hover:text-[#1C3A2F] transition-colors no-underline"
                    >
                      {trans.viewListings}
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* ── FEATURED PROPERTIES ROW ── */}
      {displayProperties.length > 0 ? (
        <section id="properties-section" className="w-full px-4 md:px-8 mt-12 text-left">
          <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-5">
            {/* Header row */}
            <div className="flex items-end justify-between border-b border-[#EDE8DF] pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                  {trans.featuredProperties.replace("{name}", nName)}
                </span>
                <h2 className="text-xl md:text-2xl font-bold leading-tight mt-0.5 section-heading" style={{ color: "#1C3A2F" }}>
                  {trans.condosRentals}
                </h2>
              </div>
              <a
                href={`/explore?area=${neighborhood.name}`}
                className="text-[12px] font-semibold no-underline pb-px transition-colors duration-150 flex items-center gap-1 hover:text-[#C9A84C]"
                style={{ color: "#1C3A2F" }}
              >
                {trans.viewAllProperties}
              </a>
            </div>

            {/* Properties Grid / Scroll Container */}
            <div
              className="properties-container no-scrollbar"
              data-count={Math.min(displayProperties.length, 8)}
            >
              {displayProperties.slice(0, 8).map((prop) => {
                const isSaved = isPropertySaved(prop.id);
                return (
                  <div
                    key={prop.id}
                    className="property-card-item w-full min-w-0 h-[140px] md:w-[320px] md:min-w-[320px] md:h-[240px] rounded-2xl overflow-hidden relative border shadow-sm group hover:shadow-md transition-shadow"
                    style={{ borderColor: "#EDE8DF", background: "#1C3A2F" }}
                  >
                    {prop.coverImage ? (
                      <Image
                        src={prop.coverImage}
                        alt={prop.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 320px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#254D3E,#1C3A2F)" }}>
                        <span className="text-white/10 font-bold select-none text-[36px]">NHP</span>
                      </div>
                    )}
                    {/* shading */}
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 35%, rgba(0,0,0,0.85) 100%)" }}
                    />

                    {/* Top Listing type Badges */}
                    <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3 flex items-center gap-1.5">
                      <span
                        className="px-2 py-0.5 rounded text-[8px] font-bold tracking-[0.5px] uppercase text-white"
                        style={{
                          background: prop.listingType === "sale" ? "#1C3A2F" : prop.listingType === "rent" ? "#C9A84C" : "#555",
                          color: prop.listingType === "rent" ? "#1C3A2F" : "#FFFFFF"
                        }}
                      >
                        {prop.listingType === "sale" ? t.property.forSale : prop.listingType === "rent" ? t.property.longRent : t.property.shortStay}
                      </span>
                    </div>

                    {/* Save Heart icon button */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePropertySave(prop.id); }}
                      className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-none shadow-md cursor-pointer transition-colors"
                      style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
                    >
                      <Heart
                        size={15}
                        className={isSaved ? "fill-[#E11D48] text-[#E11D48]" : "text-white"}
                      />
                    </button>

                    {/* Bottom Text Info */}
                    <a
                      href={`/property/${prop.slug}`}
                      className="absolute inset-0 z-10 flex flex-col justify-end p-2.5 md:p-4 text-white no-underline"
                    >
                      <div className="text-xs md:text-base font-bold leading-none mb-0.5 md:mb-1">
                        {formatPrice(Number(prop.priceTHB))}
                        <span className="text-[8.5px] md:text-[10px] font-light opacity-80">{prop.priceLabel}</span>
                      </div>
                      <div className="text-[10px] md:text-xs font-semibold truncate leading-tight opacity-90 mb-0.5 md:mb-1">
                        {stripEmojis(prop.name)}
                      </div>
                      <div className="text-[8.5px] md:text-[10px] opacity-70 font-light flex items-center gap-1 md:gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        <span className="inline-flex items-center gap-1"><Bed className="w-3 h-3" /> {prop.bedrooms === 0 ? t.property.studio : `${prop.bedrooms} Bed`}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><ShowerHead className="w-3 h-3" /> {prop.bathrooms} Bath</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><Maximize2 className="w-3 h-3" /> {prop.sqm} m²</span>
                        {prop.transit && prop.transit[0] && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1"><TrainFront className="w-3 h-3" /> {prop.transit[0].replace("BTS", "").replace("min walk", "").trim()} min</span>
                          </>
                        )}
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section id="properties-section" className="w-full px-4 md:px-8 mt-12 text-left">
          <div className="w-full max-w-[1440px] mx-auto p-8 rounded-2xl border border-dashed border-[#EDE8DF] bg-[#FAFAF9] flex flex-col items-center justify-center text-center">
            <div className="text-[#C9A84C] mb-3">
              <Home size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-[#1C3A2F] mb-1">{trans.noListings}</h3>
            <p className="text-xs text-gray-500 max-w-sm">{trans.noListingsDesc}</p>
          </div>
        </section>
      )}

      {/* ── EXPAT SCORECARD & RESIDENT REVIEWS ── */}
      <section className="w-full px-4 md:px-8 mt-12 text-left">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6">
          
          {/* Header Row */}
          <div className="border-b border-[#EDE8DF] pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                {neighborhood.name.toUpperCase()} EXPAT RELOCATION DATABASE
              </span>
              <h2 className="text-xl md:text-2xl font-bold leading-tight mt-0.5 section-heading" style={{ color: "#1C3A2F" }}>
                Resident Reviews & Expat Scorecard
              </h2>
            </div>
            <div className="text-[11px] text-gray-400 font-light md:text-right">
              Based on 47 verified resident submissions · Last updated July 2026
            </div>
          </div>

          {/* Main Grid: Scorecard (Left) and Reviews + Form (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Expat Scorecard */}
            <div className="rounded-2xl p-6 border border-[#EDE8DF] bg-white flex flex-col gap-6">
              
              {/* Overall Score */}
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#1C3A2F] mb-4">
                  {neighborhood.name} Scorecard
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-extrabold text-[#1C3A2F]">
                    {neighborhood.slug.toLowerCase() === "sathorn" ? "4.2" :
                     neighborhood.slug.toLowerCase() === "ari" ? "4.6" :
                     neighborhood.slug.toLowerCase() === "ekkamai" ? "4.2" :
                     neighborhood.slug.toLowerCase() === "sukhumvit" ? "4.1" :
                     neighborhood.slug.toLowerCase() === "thonburi" ? "4.1" :
                     neighborhood.slug.toLowerCase() === "charoenkrung" ? "4.3" : "4.0"}
                  </span>
                  <span className="text-sm font-semibold text-gray-400">/ 5.0</span>
                </div>
                <div className="flex gap-0.5 text-[#C9A84C] text-sm">
                  {"★".repeat(4)}
                  <span className="text-gray-300">★</span>
                </div>
              </div>

              {/* Amazon-style Rating Breakdown */}
              <div className="flex flex-col gap-1.5 border-t border-b border-[#EDE8DF] py-4">
                {[
                  { stars: 5, pct: neighborhood.slug.toLowerCase() === "ari" ? 72 : neighborhood.slug.toLowerCase() === "sathorn" ? 54 : 50 },
                  { stars: 4, pct: neighborhood.slug.toLowerCase() === "ari" ? 20 : neighborhood.slug.toLowerCase() === "sathorn" ? 32 : 34 },
                  { stars: 3, pct: neighborhood.slug.toLowerCase() === "ari" ? 6 : neighborhood.slug.toLowerCase() === "sathorn" ? 10 : 12 },
                  { stars: 2, pct: neighborhood.slug.toLowerCase() === "ari" ? 2 : neighborhood.slug.toLowerCase() === "sathorn" ? 3 : 3 },
                  { stars: 1, pct: neighborhood.slug.toLowerCase() === "ari" ? 0 : neighborhood.slug.toLowerCase() === "sathorn" ? 1 : 1 },
                ].map((row) => (
                  <div key={row.stars} className="flex items-center gap-2 text-[11px] text-gray-500 font-light">
                    <span className="w-12 text-right">{row.stars} Stars</span>
                    <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: "#C9A84C" }} />
                    </div>
                    <span className="w-8 text-left">{row.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Individual Metrics with real-world tags */}
              <div className="flex flex-col gap-4">
                {[
                  {
                    label: "Transit & Commute (BTS/MRT)",
                    tag: neighborhood.slug.toLowerCase() === "sukhumvit" || neighborhood.slug.toLowerCase() === "sathorn" ? "Excellent (Central Interchange)" : "Good (Direct Skytrain)",
                    score: neighborhood.slug.toLowerCase() === "sathorn" ? 90 :
                           neighborhood.slug.toLowerCase() === "ari" ? 84 :
                           neighborhood.slug.toLowerCase() === "ekkamai" ? 84 :
                           neighborhood.slug.toLowerCase() === "sukhumvit" ? 96 :
                           neighborhood.slug.toLowerCase() === "thonburi" ? 80 :
                           neighborhood.slug.toLowerCase() === "charoenkrung" ? 76 : 80
                  },
                  {
                    label: "Quietness & Residential Safety",
                    tag: neighborhood.slug.toLowerCase() === "sukhumvit" ? "Busy / High Traffic Noise" : neighborhood.slug.toLowerCase() === "ari" ? "Very Quiet Leafy Alleys" : "Quiet Side Lanes",
                    score: neighborhood.slug.toLowerCase() === "sathorn" ? 80 :
                           neighborhood.slug.toLowerCase() === "ari" ? 92 :
                           neighborhood.slug.toLowerCase() === "ekkamai" ? 84 :
                           neighborhood.slug.toLowerCase() === "sukhumvit" ? 64 :
                           neighborhood.slug.toLowerCase() === "thonburi" ? 90 :
                           neighborhood.slug.toLowerCase() === "charoenkrung" ? 76 : 80
                  },
                  {
                    label: "Food Scene & Cafes",
                    tag: neighborhood.slug.toLowerCase() === "ari" ? "Specialty Roaster Capital" : neighborhood.slug.toLowerCase() === "sathorn" ? "Fine Dining & Bistros" : "Great Local Hubs",
                    score: neighborhood.slug.toLowerCase() === "sathorn" ? 96 :
                           neighborhood.slug.toLowerCase() === "ari" ? 96 :
                           neighborhood.slug.toLowerCase() === "ekkamai" ? 94 :
                           neighborhood.slug.toLowerCase() === "sukhumvit" ? 98 :
                           neighborhood.slug.toLowerCase() === "thonburi" ? 88 :
                           neighborhood.slug.toLowerCase() === "charoenkrung" ? 96 : 80
                  },
                  {
                    label: "Value & Rental Affordability",
                    tag: neighborhood.slug.toLowerCase() === "sathorn" ? "Premium (฿฿฿฿)" : neighborhood.slug.toLowerCase() === "thonburi" ? "Excellent Value (฿฿)" : "Mid-to-High (฿฿฿)",
                    score: neighborhood.slug.toLowerCase() === "sathorn" ? 70 :
                           neighborhood.slug.toLowerCase() === "ari" ? 90 :
                           neighborhood.slug.toLowerCase() === "ekkamai" ? 84 :
                           neighborhood.slug.toLowerCase() === "sukhumvit" ? 76 :
                           neighborhood.slug.toLowerCase() === "thonburi" ? 96 :
                           neighborhood.slug.toLowerCase() === "charoenkrung" ? 84 : 80
                  },
                  {
                    label: "Walkability & Shade",
                    tag: neighborhood.slug.toLowerCase() === "ari" ? "Leafy Residential Parks" : "Narrow / Crowded Sidewalks",
                    score: neighborhood.slug.toLowerCase() === "sathorn" ? 84 :
                           neighborhood.slug.toLowerCase() === "ari" ? 96 :
                           neighborhood.slug.toLowerCase() === "ekkamai" ? 76 :
                           neighborhood.slug.toLowerCase() === "sukhumvit" ? 80 :
                           neighborhood.slug.toLowerCase() === "thonburi" ? 70 :
                           neighborhood.slug.toLowerCase() === "charoenkrung" ? 88 : 80
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline text-[11px] font-semibold text-[#1C3A2F]">
                      <span>{item.label}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{(item.score / 20).toFixed(1)} / 5</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${item.score}%`, background: "#1C3A2F" }} />
                    </div>
                    <span className="text-[9.5px] text-gray-400 font-light">{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Reviews List & Write form */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Dynamic Review List */}
              <div className="flex flex-col gap-4">
                {reviewsList.map((rev, idx) => (
                  <div key={idx} className="rounded-2xl p-5 border border-[#EDE8DF] bg-white flex flex-col gap-4">
                    
                    {/* Reviewer Header */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                      <div className="flex flex-col gap-1 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#1C3A2F] m-0">{rev.author}</h4>
                          <span className="text-[11px] text-gray-400 font-light">{rev.origin}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                          <span>{rev.role}</span>
                          <span>·</span>
                          <span>{rev.stay}</span>
                          <span>·</span>
                          <span className="font-semibold text-gray-500">{rev.location}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex gap-0.5 text-[#C9A84C] text-[11px] mb-1 justify-end">
                          {"★".repeat(rev.rating)}
                          {"☆".repeat(5 - rev.rating)}
                        </div>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-semibold text-green-700 bg-green-50 border border-green-200">
                            ✓ Verified Resident
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pros and Cons split view */}
                    <div className="flex flex-col gap-3 text-left">
                      {rev.pros && (
                        <div className="rounded-xl p-3 bg-green-50/50 border border-green-100/50 flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 flex items-center gap-1.5">
                            🟢 PROS
                          </span>
                          <p className="text-[12.5px] font-light leading-relaxed text-gray-600 m-0">
                            {rev.pros}
                          </p>
                        </div>
                      )}
                      
                      {rev.cons && (
                        <div className="rounded-xl p-3 bg-red-50/50 border border-red-100/50 flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                            🔴 CONS & FLOODING/TRAFFIC ISSUES
                          </span>
                          <p className="text-[12.5px] font-light leading-relaxed text-gray-600 m-0">
                            {rev.cons}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline Write a Review Form */}
              <div className="rounded-2xl border border-[#EDE8DF] bg-white overflow-hidden transition-all duration-300">
                {!submitSuccess ? (
                  <div className="p-5 flex flex-col gap-4 text-left">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-[#1C3A2F] m-0">Write a Resident Review</h4>
                      <span className="text-[11px] text-[#C9A84C] font-semibold">Share your local experience</span>
                    </div>

                    {/* Metadata inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Name input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Your Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Marcus"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="px-3 py-2 rounded-xl text-[12.5px] outline-none border bg-white border-[#EDE8DF] text-gray-700 font-light"
                        />
                      </div>
                      
                      {/* Origin input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Home Country & City</label>
                        <input
                          type="text"
                          placeholder="e.g. 🇬🇧 London, UK"
                          value={userOrigin}
                          onChange={(e) => setUserOrigin(e.target.value)}
                          className="px-3 py-2 rounded-xl text-[12.5px] outline-none border bg-white border-[#EDE8DF] text-gray-700 font-light"
                        />
                      </div>

                      {/* Location/Soi input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Your Street / Soi</label>
                        <input
                          type="text"
                          placeholder="e.g. Sathorn Soi 10"
                          value={userLocation}
                          onChange={(e) => setUserLocation(e.target.value)}
                          className="px-3 py-2 rounded-xl text-[12.5px] outline-none border bg-white border-[#EDE8DF] text-gray-700 font-light"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Persona Select */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Your Expat Role</label>
                        <select 
                          value={userPersona} 
                          onChange={(e) => setUserPersona(e.target.value)}
                          className="px-3 py-2 rounded-xl text-[12.5px] outline-none border bg-white border-[#EDE8DF] text-gray-700"
                        >
                          <option value="Digital Nomad">💻 Digital Nomad</option>
                          <option value="Expat Parent">🏫 Expat Parent</option>
                          <option value="Corporate Professional">👔 Corporate Professional</option>
                          <option value="Retiree">☕ Retiree</option>
                          <option value="Young Expat">🌴 Young Expat</option>
                        </select>
                      </div>

                      {/* Star Rating Select */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Rating Score</label>
                        <div className="flex items-center gap-2 h-[38px]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setUserRating(star)}
                              className="text-lg cursor-pointer transition-colors bg-transparent border-none p-0"
                              style={{ color: star <= userRating ? "#C9A84C" : "#E5E0D8" }}
                            >
                              ★
                            </button>
                          ))}
                          <span className="text-xs text-gray-400 font-semibold ml-1">({userRating} Stars)</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Pros Text */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-green-700">🟢 What you love (Pros)</label>
                      <textarea
                        rows={2}
                        placeholder="Tell others what makes this neighborhood great to live in."
                        value={userPros}
                        onChange={(e) => setUserPros(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl text-[12.5px] outline-none border border-[#EDE8DF] text-gray-800 resize-none font-light"
                      />
                    </div>

                    {/* Review Cons Text */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-red-700">🔴 What to watch out for (Cons, Traffic, Flooding)</label>
                      <textarea
                        rows={2}
                        placeholder="Be honest about local flaws, noisy streets, commute jams, or rain flooding issues."
                        value={userCons}
                        onChange={(e) => setUserCons(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl text-[12.5px] outline-none border border-[#EDE8DF] text-gray-800 resize-none font-light"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!userPros.trim() && !userCons.trim()) return;
                          
                          // Prepend review instantly to the local state so the user sees it live
                          const newReview = {
                            author: userName || "Anonymous Resident",
                            role: userPersona,
                            origin: userOrigin || "Expat",
                            stay: "Lived here: Less than a year",
                            location: userLocation || "Local Area",
                            verified: true,
                            date: "Just now",
                            rating: userRating,
                            pros: userPros.trim(),
                            cons: userCons.trim()
                          };
                          
                          setReviewsList([newReview, ...reviewsList]);
                          setSubmitSuccess(true);
                        }}
                        className="px-5 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer transition-opacity hover:opacity-90 border-none text-[#1C3A2F]"
                        style={{ background: "#C9A84C" }}
                      >
                        Submit Resident Review →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                    <span className="text-3xl">✓</span>
                    <h4 className="text-sm font-bold text-[#1C3A2F] m-0">Review Submitted Successfully!</h4>
                    <p className="text-xs text-gray-500 font-light max-w-sm m-0">
                      Your local review has been posted and queued for verification. Thank you for contributing to the expat community!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setUserName("");
                        setUserOrigin("");
                        setUserLocation("");
                        setUserPros("");
                        setUserCons("");
                        setSubmitSuccess(false);
                      }}
                      className="text-[11px] font-bold underline mt-2 text-[#C9A84C] bg-transparent border-none cursor-pointer"
                    >
                      Write another review
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      {nearbyNeighborhoods.length > 0 && (
        <section className="w-full px-4 md:px-8 mt-6 text-left mb-8">
          <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6">
            <div className="border-b border-[#EDE8DF] pb-3">
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#C9A84C]">
                {trans.exploreBangkok}
              </span>
              <h2 className="text-xl md:text-2xl font-bold leading-tight mt-0.5 section-heading" style={{ color: "#1C3A2F" }}>
                {trans.nearbyNeighborhoods}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyNeighborhoods.map((n) => {
                const nTrans = trans.neighborhoods[n.slug.toLowerCase() as keyof typeof trans.neighborhoods];
                return (
                  <Link
                    key={n.slug}
                    href={`/neighborhood/${n.slug}`}
                    className="flex flex-col rounded-2xl overflow-hidden shadow-sm border border-[#EDE8DF] group hover:shadow-md transition-shadow no-underline text-left bg-white"
                  >
                    <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100 relative">
                      <Image
                        src={n.heroImage}
                        alt={nTrans?.name || n.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 360px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex flex-col gap-1 flex-grow">
                      <h4 className="text-sm font-bold text-[#1C3A2F] group-hover:text-[#C9A84C] transition-colors">
                        {nTrans?.name || n.name}
                      </h4>
                      <p className="text-xs text-[#C9A84C] italic mb-1">
                        {nTrans?.personality || n.personality}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {nTrans?.description || n.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Modal removed as guides now link to real blog posts */}

      <style>{`
        .hero-gradient-overlay {
          background: linear-gradient(to right, rgba(28, 58, 47, 0.95) 0%, rgba(28, 58, 47, 0.8) 50%, rgba(0, 0, 0, 0.15) 100%);
        }
        
        /* Default mobile typography */
        .hero-title, .hero-tagline, .section-heading {
          font-family: var(--font-inter), Inter, sans-serif !important;
        }

        /* Default mobile properties layout */
        .properties-container {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 12px !important;
        }
        .property-card-item {
          height: 140px !important;
          width: 100% !important;
          min-width: 0 !important;
        }
        .property-card-item:nth-child(n+5) {
          display: none !important;
        }
        
        /* Default mobile stacked view (< 480px) */
        .hero-content-row {
          flex-direction: column !important;
          align-items: stretch !important;
        }
        .scorecard-container {
          width: 100% !important;
        }
        .white-card-grid {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }
        .love-map-grid {
          display: grid !important;
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
          gap: 16px !important;
        }

        /* 2-Column Side-by-Side layout (>= 480px) */
        @media (min-width: 480px) {
          .hero-content-row {
            flex-direction: row !important;
            align-items: flex-end !important;
          }
          .scorecard-container {
            width: 220px !important;
          }
          .white-card-grid {
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
          }
          .at-a-glance-col {
            grid-column: span 5 / span 5 !important;
          }
          .lifestyle-col {
            grid-column: span 7 / span 7 !important;
          }
          .love-map-col {
            grid-column: span 12 / span 12 !important;
          }
        }

        /* Tablet/Desktop Viewports (>= 768px) */
        @media (min-width: 768px) {
          .hero-title, .hero-tagline, .section-heading {
            font-family: Georgia, serif !important;
          }
          .properties-container {
            display: flex !important;
            overflow-x: auto !important;
            gap: 16px !important;
            padding-bottom: 16px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .property-card-item {
            height: 240px !important;
            width: 320px !important;
            min-width: 320px !important;
          }
          .property-card-item:nth-child(n+9) {
            display: block !important;
          }
          .love-map-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 24px !important;
          }
        }

        /* Desktop Grid Override (>= 1024px) */
        @media (min-width: 1024px) {
          .scorecard-container {
            width: 320px !important;
          }
          .white-card-grid {
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
          }
          .at-a-glance-col {
            grid-column: span 3 / span 3 !important;
          }
          .lifestyle-col {
            grid-column: span 5 / span 5 !important;
          }
          .love-map-col {
            grid-column: span 4 / span 4 !important;
          }
          .properties-container {
            display: grid !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            grid-auto-rows: 240px !important;
            grid-template-rows: none !important;
            grid-auto-flow: row !important;
            height: auto !important;
            overflow-x: hidden !important;
            gap: 16px !important;
            padding-bottom: 0 !important;
          }
          /* Collapse to 1 row when 4 or fewer properties */
          .properties-container[data-count="1"],
          .properties-container[data-count="2"],
          .properties-container[data-count="3"],
          .properties-container[data-count="4"] {
            grid-template-rows: 240px !important;
            grid-auto-rows: 0px !important;
            max-height: 240px !important;
            overflow: hidden !important;
          }
          .property-card-item {
            width: 100% !important;
            min-width: 0 !important;
            height: 240px !important;
          }
          .property-card-item:nth-child(n+9) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
