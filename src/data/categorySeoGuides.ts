import { SeoCategoryGuideProps } from "@/components/seo/SeoCategoryGuide";

export const CATEGORY_SEO_GUIDES: Record<string, SeoCategoryGuideProps> = {
  rent: {
    title: "Complete Expat Guide to Renting Condos & Apartments in Bangkok",
    subtitle: "Everything you need to know about lease terms, top expat neighborhoods, security deposits, and BTS/MRT transit connections.",
    badge: "Long-Term Rental Guide",
    sections: [
      {
        heading: "Top Bangkok Neighborhoods for Expats & Nomads",
        text: "Choosing the right neighborhood in Bangkok shapes your daily lifestyle, commute, and access to dining and international amenities. The BTS Sukhumvit line remains the most popular corridor for international residents.",
        list: [
          "Sukhumvit (Phrom Phong & Thong Lo): Premier luxury hubs featuring high-end EmDistrict shopping, Japanese dining, rooftop bars, and international schools.",
          "Sathorn & Silom: Bangkok's primary financial district offering leafy sub-sois, executive high-rises, and direct access to Lumphini Park.",
          "Ari & Phaya Thai: Quiet, green residential neighborhoods favored by creative professionals, digital nomads, and hospital staff.",
          "On Nut & Ekkamai: Vibrant residential hubs providing modern BTS-adjacent condos with excellent value for long-term rentals.",
        ],
      },
      {
        heading: "Standard Rental Contracts & Security Deposits",
        text: "Long-term residential leases in Thailand typically require a minimum 12-month contract commitment. Standard leases protect both landlord and tenant under Thai consumer protection guidelines.",
        list: [
          "Deposit Requirements: Landlords require 2 months' security deposit plus 1 month's advance rent prior to move-in.",
          "Government Utility Billing: Electricity is billed directly by the MEA (Metropolitan Electricity Authority) at government rates (~฿4.5 to ฿5 per unit).",
          "Water & Internet: Water is billed directly by the building juristic office (~฿18 to ฿20/unit). High-speed fiber internet packages start around ฿590/month.",
        ],
      },
      {
        heading: "BTS Skytrain & MRT Subway Connectivity",
        text: "Living near a mass transit station drastically cuts down daily commute times in central Bangkok. Most expats prioritize residences within 500 meters or an 8-minute walk to a BTS or MRT station.",
        list: [
          "Sukhumvit Green Line: Connects key commercial centers from Siam and Asok down to Bang Na.",
          "MRT Blue Line: Circling central Bangkok with seamless interchanges at Asok (Sukhumvit MRT) and Sala Daeng (Silom MRT).",
          "Building Shuttle Services: Many modern luxury condos provide free tuk-tuk or shuttle van rides directly to the nearest transit station.",
        ],
      },
      {
        heading: "Verified Listings & Tenant Protections with NHP",
        text: "New Homes Property verifies unit photos, floor plans, building amenities, and current market pricing before publishing. Our local multilingual agents assist expats with lease negotiation, TM30 immigration filing, and inventory check-ins free of charge.",
      },
    ],
    faq: [
      {
        question: "What documents do foreigners need to rent a condo in Bangkok?",
        answer: "Foreigners need a valid passport with an entry visa or stamp, plus a copy of their work permit or employment letter if available. No local bank account is mandatory prior to signing, though it makes monthly rent transfers easier.",
      },
      {
        question: "Who pays agent commission when renting a condo in Thailand?",
        answer: "In Thailand, the landlord pays 100% of the real estate commission. Renters and tenants receive full property search, viewing, and lease contract assistance completely free of charge.",
      },
      {
        question: "What is a TM30 form and does NHP help with it?",
        answer: "TM30 is a mandatory notification of residence for foreign visitors in Thailand. Landlords or building managers must file it within 24 hours of arrival. NHP assists all tenants in ensuring TM30 registration is completed smoothly for immigration compliance.",
      },
      {
        question: "Are pets allowed in Bangkok rental condos?",
        answer: "Most high-rise condominiums in Bangkok strictly enforce a no-pet policy. However, NHP maintains a dedicated selection of verified pet-friendly condos and apartment buildings across Sukhumvit, Sathorn, and Ari.",
      },
    ],
  },

  sale: {
    title: "Foreigner's Guide to Buying Real Estate & Condominiums in Bangkok",
    subtitle: "Understand foreign freehold quotas, legal ownership structures, transfer fees, and high-yield property investment locations.",
    badge: "Buyer & Investment Guide",
    sections: [
      {
        heading: "Understanding the Foreign Freehold Quota (49% Law)",
        text: "Under the Thailand Condominium Act B.E. 2522, foreign nationals can purchase and hold 100% direct freehold ownership of condominium units, provided that non-Thai ownership does not exceed 49% of the total aggregate floor area of all units in the building.",
        list: [
          "Direct Title Deed (Chanote): Foreign buyers receive a legal title deed issued by the Land Department registered directly in their personal name.",
          "Unrestricted Resale & Inheritance: Foreign freehold units can be freely sold, transferred, or inherited by non-Thai citizens.",
          "Full Property Rights: Owners hold proportional ownership of common property, land, and building amenities.",
        ],
      },
      {
        heading: "International Fund Transfer & FET (Foreign Exchange Transaction) Form",
        text: "To qualify for foreign freehold title registration at the Land Department, foreign buyers must transfer 100% of the purchase funds into Thailand from abroad in foreign currency.",
        list: [
          "FET Certificate: Receiving Thai banks issue a Foreign Exchange Transaction (FET) form for transfers equal to or exceeding $50,000 USD equivalent.",
          "Transfer Instructions: Wire instructions must explicitly state 'For the purchase of condominium Unit #... at [Building Name]'.",
          "Currency Flexibility: Funds can be wired in USD, EUR, GBP, SGD, AUD, HKD, or CNY.",
        ],
      },
      {
        heading: "Property Purchase Taxes & Government Transfer Fees",
        text: "Closing costs at the Thailand Land Department are low compared to European or North American real estate markets, and are typically split equally between buyer and seller.",
        list: [
          "Transfer Fee: 2% of the Land Department appraised value (often split 50/50 between buyer and seller).",
          "Specific Business Tax (SBT): 3.3% applicable if the seller has owned the property for less than 5 years (typically paid by seller).",
          "Stamp Duty: 0.5% (exempt if SBT applies; paid by seller).",
          "Withholding Tax: Progressive tax rate based on appraisal value (paid by seller).",
        ],
      },
      {
        heading: "High-Yield Investment Corridors in Central Bangkok",
        text: "Bangkok's prime rental yields average between 4.5% and 6.5% gross annually. Investors focus on transit-connected high-density commercial hubs with strong expat tenant demand.",
      },
    ],
    faq: [
      {
        question: "Can foreigners buy landed houses or villas in Thailand?",
        answer: "Thai law restricts foreign nationals from directly owning land freehold in their personal name. However, foreigners can legally purchase house structures, enter into registered 30-year land leases (renewable), or establish a Thai majority-owned company to hold landed property.",
      },
      {
        question: "Can foreigners get a mortgage from a Thai bank to buy a condo?",
        answer: "Most Thai retail banks require foreign borrowers to hold a work permit and long-term residency. However, offshore financing options are available through select Singaporean and international banks (e.g. UOB Singapore, MBK Guarantee) for qualified buyers.",
      },
      {
        question: "What is the average rental yield for Bangkok condos?",
        answer: "Gross rental yields in prime Bangkok areas range from 4.5% to 6.8%, depending on unit size, building age, and proximity to BTS/MRT stations. Compact 1-bedroom units in Sukhumvit and Rama 9 achieve the highest occupancy rates.",
      },
      {
        question: "Do foreign buyers need a Thai real estate lawyer?",
        answer: "Yes, NHP strongly recommends engaging an independent Thai real estate lawyer to conduct due diligence, title deed searches, review sales agreements, and verify foreign quota availability before placing a deposit.",
      },
    ],
  },

  short_stay: {
    title: "Guide to Short-Stay & Serviced Apartments in Bangkok",
    subtitle: "Flexible monthly and weekly luxury rentals with full hotel-style amenities for digital nomads and business travelers.",
    badge: "Flexible Stay Guide",
    sections: [
      {
        heading: "Why Choose Serviced Apartments Over Hotel Rooms?",
        text: "Serviced apartments combine the comfort and space of a residential home with the convenience of hotel housekeeping and concierge services. Ideal for month-to-month remote work stays and family relocations.",
        list: [
          "Full Kitchens & Washing Machines: Prepare meals in fully equipped kitchens with built-in washer/dryer units.",
          "Dedicated Workspaces: High-speed Wi-Fi (up to 1 Gbps), ergonomic desks, and quiet environments for remote work.",
          "Cost Efficiency: Monthly rates offer 30% to 50% savings compared to nightly hotel room bookings.",
        ],
      },
      {
        heading: "Top Neighborhoods for Remote Workers & Short Stays",
        text: "Location is critical for short stays. Stay near co-working spaces, gourmet dining, and BTS lines to maximize your time in Bangkok.",
        list: [
          "Thong Lo & Phrom Phong: Sophisticated cafes, co-working hubs, top Japanese eateries, and vibrant nightlife.",
          "Silom & Sathorn: Close to financial headquarters, Lumphini Park green space, and rooftop lounges.",
          "Asok Intersect: Unbeatable transit convenience where the BTS Skytrain and MRT subway lines meet.",
        ],
      },
      {
        heading: "Included Amenities & Services",
        text: "Serviced apartment residences include weekly or twice-weekly maid service, linen changes, water/electricity utilities, 24/7 security, rooftop pools, and state-of-the-art gym facilities.",
      },
    ],
    faq: [
      {
        question: "What is the minimum stay duration for short-stay properties?",
        answer: "Short-stay rentals on NHP range from 30 days up to 6 months with flexible extension terms. Selected serviced apartment residences accept weekly stays.",
      },
      {
        question: "Are utilities and Wi-Fi included in short-stay monthly pricing?",
        answer: "Yes, most short-stay serviced apartment packages include high-speed Wi-Fi, water, and electricity up to a generous monthly cap.",
      },
      {
        question: "Is a security deposit required for monthly stays?",
        answer: "Short-term monthly rentals typically require a 1-month security deposit or a small refundable deposit depending on stay duration.",
      },
    ],
  },

  apartments: {
    title: "Spacious Apartments for Families & Long-Term Residents in Bangkok",
    subtitle: "Discover multi-bedroom family residences, single-owner apartment buildings, and pet-friendly living options.",
    badge: "Family & Apartment Guide",
    sections: [
      {
        heading: "Difference Between Apartments and Condominiums in Thailand",
        text: "In Thailand, an 'Apartment' building is owned by a single landlord or family corporation, whereas a 'Condominium' consists of individually owned units. Apartments often offer larger living spaces, dedicated building management, and flexible terms.",
        list: [
          "Generous Square Footage: 2-bedroom to 4-bedroom layouts spanning 120 sqm to 350+ sqm.",
          "Responsive On-Site Maintenance: Single-owner management ensures swift repairs and dedicated service staff.",
          "Family Facilities: Children's play areas, basketball courts, large swimming pools, and sprawling gardens.",
        ],
      },
      {
        heading: "Proximity to International Schools in Bangkok",
        text: "Expat families prioritize homes near major international school transit routes and bus pickup points.",
        list: [
          "Sukhumvit Hub: Easy access to NIST International School, St. Andrews, ASB, and Anglo Singapore.",
          "Bangna & Srinakarin Corridor: Proximity to Bangkok Patana School and ICS.",
          "Nonthaburi & Northern Suburbs: Accessible to ISB (International School Bangkok).",
        ],
      },
      {
        heading: "Pet-Friendly Family Living",
        text: "Single-owner apartment buildings are significantly more accommodating of cats and large dogs compared to modern high-rise condominiums.",
      },
    ],
    faq: [
      {
        question: "How are utility bills handled in apartment buildings versus condos?",
        answer: "Unlike condos where electricity is paid directly to the government (MEA), single-owner apartments bill utility usage through the building office at a fixed rate per unit (~฿6 to ฿8/kWh).",
      },
      {
        question: "Can I customize or request furniture changes in an apartment?",
        answer: "Yes! Because apartment buildings have single management, landlords are frequently open to replacing sofas, adding mattresses, or painting walls for long-term tenants.",
      },
    ],
  },

  condos: {
    title: "Modern Condominium Living in Bangkok — Amenities & Lifestyle Guide",
    subtitle: "Explore high-rise skyline living, luxury amenities, energy-efficient designs, and security features.",
    badge: "Condo Living Guide",
    sections: [
      {
        heading: "World-Class Condominium Amenities",
        text: "Bangkok condominiums set global benchmarks for residential facilities. Modern developments offer resort-style amenities integrated directly into residential towers.",
        list: [
          "Rooftop Infinity Pools: Panoramic skyline views with sun decks, hydrotherapy jets, and sky lounges.",
          "Fitness & Wellness Suites: Fully equipped gyms, yoga studios, saunas, steam rooms, and private boxing rings.",
          "Co-Working & Meeting Pods: Soundproof meeting rooms, high-speed internet, and private work booths.",
          "Automated Parking: Smart mechanical parking systems and EV charging stations.",
        ],
      },
      {
        heading: "High-Rise vs Low-Rise Condos: Choosing Your Vibe",
        text: "High-rise towers (20–50+ floors) sit directly on main thoroughfares like Sukhumvit Road offering grand views. Low-rise projects (8 floors) are tucked into quiet residential sub-sois with green courtyard gardens.",
      },
      {
        heading: "Building Security & Smart Home Features",
        text: "24/7 uniformed security guards, CCTV surveillance, biometric facial recognition, touchless elevator access, and digital door locks ensure complete peace of mind.",
      },
    ],
    faq: [
      {
        question: "What is included in the condo maintenance fee (common fee)?",
        answer: "The juristic common fee covers 24/7 security, pool and gym maintenance, elevator servicing, common area electricity, and building insurance. For tenants, this fee is paid 100% by the condo landlord.",
      },
      {
        question: "Can I install my own high-speed fiber internet in a condo?",
        answer: "Yes, almost all modern condos support high-speed fiber internet installations from providers like AIS Fibre, True Online, and 3BB.",
      },
    ],
  },

  villas: {
    title: "Luxury Houses & Private Villas for Rent & Sale in Bangkok",
    subtitle: "Spacious multi-story residences, private pools, lush gardens, and secure gated compound communities (Mooban).",
    badge: "Luxury Villas Guide",
    sections: [
      {
        heading: "Private Landed Living in Central Bangkok",
        text: "For families and residents seeking expansive indoor and outdoor space, private houses and standalone villas offer unmatched privacy, private swimming pools, and dedicated maid quarters.",
        list: [
          "Substantial Floor Plans: 3-bedroom to 6-bedroom layouts with private gardens and covered multi-car garages.",
          "Gated Compound Security (Mooban): 24-hour guarded entry gates, perimeter security, and private estate roads.",
          "Pet-Friendly Freedom: Private enclosed yards and green lawns ideal for dogs and outdoor living.",
        ],
      },
      {
        heading: "Prime Neighborhoods for Luxury Villas",
        text: "Explore Sukhumvit Soi 31, 39, 55 (Thong Lo), Ekkamai Soi 10/12, Sathorn, Rama 9, and exclusive gated communities in Pattanakarn and Bangna.",
      },
      {
        heading: "Legal Ownership & Leasing Rules for Foreigners",
        text: "Foreign nationals can rent private villas without restriction or hold landed house property through long-term 30-year registered leases or corporate structures.",
      },
    ],
    faq: [
      {
        question: "Can a foreigner rent a private villa or house in Bangkok?",
        answer: "Yes! Foreign nationals can rent landed houses, townhomes, and private compound villas under standard lease agreements with zero restrictions.",
      },
      {
        question: "Who handles pool and garden maintenance for rented villas?",
        answer: "In high-end luxury villa rentals, weekly pool cleaning and landscaping services are frequently included in the monthly rental price or arranged by the landlord.",
      },
    ],
  },

  buildings: {
    title: "Comprehensive Bangkok Condo Building & Project Directory",
    subtitle: "Browse top residential developments, compare developer track records, tenant reviews, and active unit availability.",
    badge: "Building Directory Guide",
    sections: [
      {
        heading: "Top Real Estate Developers in Thailand",
        text: "Thailand's real estate market features world-renowned developers known for architectural innovation, construction quality, and top-tier juristic management.",
        list: [
          "Sansiri: Iconic luxury developments (Via, XT, Monument) renowned for high design standards and flawless property management.",
          "Ananda Development: Transit-focused high-rise towers (Ideo, Ashton) built directly adjacent to BTS/MRT stations.",
          "AP Thailand: Modern functional residences (Life, Rhythm) offering cutting-edge sky facilities.",
          "SC Asset: Premium residential projects (Saladaeng One, Beatniq, 28 Chidlom) with ultra-luxury finishes.",
        ],
      },
      {
        heading: "Evaluating Juristic Property Management Quality",
        text: "A well-managed building preserves property value, maintains pristine common facilities, and enforces noise and cleanliness rules. NHP highlights building maintenance records and tenant ratings.",
      },
      {
        heading: "Pet-Friendly Building Search",
        text: "Filter our comprehensive building directory specifically by pet-allowed projects (e.g. M Thonglor, Ashton Morph 38, Monument Thong Lo, Aguston Sukhumvit 22).",
      },
    ],
    faq: [
      {
        question: "How do I compare different condo buildings in the same neighborhood?",
        answer: "Use NHP's Building Directory to compare completion year, distance to BTS/MRT, total floors, total units, pet policies, and available rental/sale units side-by-side.",
      },
      {
        question: "Why does building age matter when choosing a condo in Bangkok?",
        answer: "Newer condos (under 5 years) offer hyper-modern facilities and energy efficiency, while older buildings (10-15+ years) typically provide 30% to 50% larger floor plans for the same price.",
      },
    ],
  },
};
