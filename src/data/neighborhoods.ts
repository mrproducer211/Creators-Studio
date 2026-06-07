export interface Neighborhood {
  id: number;
  name: string;
  slug: string;
  description: string;
  lat: number;
  lng: number;
  personality: string;
  scores: {
    remoteWork: number; // 1-10
    petFriendly: number;
    familyFriendly: number;
    nightlife: number;
    cafeCulture: number;
    walkability: number;
    luxury: number;
    expatCommunity: number;
    japaneseCommunity: number;
    chineseCommunity: number;
    studentSuitability: number;
  };
  avoidanceStats: {
    traffic: number;       // 1-10 (higher means worse / more of it)
    noise: number;         // 1-10
    touristCrowds: number; // 1-10
    density: number;       // 1-10 (higher means high-rise / concrete jungle)
    busyness: number;      // 1-10
  };
  commuteMinutes: Record<string, number>; // Commute from this neighborhood to workplace keys (in mins)
  averageRentMin: number;
  averageRentMax: number;
  nearestTransit: string;
  heroImage: string;
  residentTypes: string[];
  cafes: string[];
  coworkingSpaces: string[];
  malls: string[];
  parks: string[];
  dayItinerary: {
    time: string;
    title: string;
    activity: string;
  }[];
  reviews: {
    author: string;
    role: string;
    quote: string;
  }[];
}

export interface Destination {
  name: string;
  lat: number;
  lng: number;
}

export const DESTINATIONS: Destination[] = [
  { name: "One Bangkok", lat: 13.7265, lng: 100.5445 },
  { name: "Sathorn", lat: 13.7242, lng: 100.5284 },
  { name: "Silom", lat: 13.7285, lng: 100.5342 },
  { name: "Asoke", lat: 13.7369, lng: 100.5604 },
  { name: "Chulalongkorn University", lat: 13.7384, lng: 100.5321 },
];

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 1,
    name: "Ari",
    slug: "ari",
    description: "A trendy residential sanctuary featuring tree-lined streets, independent cafes, and craft eateries. It is highly popular among digital nomads and creative professionals seeking a quiet but active lifestyle.",
    lat: 13.7797,
    lng: 100.5448,
    personality: "The Creative Professional",
    scores: {
      remoteWork: 10,
      petFriendly: 8,
      familyFriendly: 6,
      nightlife: 5,
      cafeCulture: 10,
      walkability: 9,
      luxury: 6,
      expatCommunity: 8,
      japaneseCommunity: 5,
      chineseCommunity: 4,
      studentSuitability: 7,
    },
    avoidanceStats: {
      traffic: 4,
      noise: 3,
      touristCrowds: 3,
      density: 3,
      busyness: 4,
    },
    commuteMinutes: {
      "Ari": 0,
      "Sukhumvit": 15,
      "Asok": 15,
      "Thong Lo": 20,
      "Ekkamai": 22,
      "Silom": 20,
      "Sathorn": 22,
      "On Nut": 28,
      "One Bangkok": 18,
      "Asoke": 15,
      "Chulalongkorn University": 18
    },
    averageRentMin: 20000,
    averageRentMax: 45000,
    nearestTransit: "Ari BTS",
    heroImage: "https://images.unsplash.com/photo-1598977123418-45f04b615e37?w=1200&auto=format&q=80",
    residentTypes: ["Digital Nomads", "Creative Professionals", "Young Expats", "Cafe Lovers"],
    cafes: ["Common Room x Babe", "Nana Coffee Roasters", "Bar Storia del Caffè", "Landhaus Bakery"],
    coworkingSpaces: ["FlySpaces Ari", "Launchpad Co-working", "AIS D.C. (nearby)"],
    malls: ["La Villa Ari", "Gump's Ari Community Space"],
    parks: ["Chatuchak Park (nearby)", "Queen Sirikit Park"],
    dayItinerary: [
      { time: "8:00 AM", title: "Morning Cold Brew", activity: "Grab an organic pour-over at Common Room x Babe." },
      { time: "10:30 AM", title: "Productive Focus", activity: "Set up your laptop at Launchpad Co-working Ari." },
      { time: "1:00 PM", title: "Teakwood Lunch", activity: "Enjoy local Thai-fusion at Bar Storia del Caffè." },
      { time: "4:30 PM", title: "Shaded Stroll", activity: "Walk along the tree-lined sub-sois of Ari Soi 4." },
      { time: "7:00 PM", title: "Local Dinner", activity: "Dine on handmade pasta at Landhaus Bakery." }
    ],
    reviews: [
      { author: "Emma K.", role: "Digital Nomad", quote: "Ari feels like a quiet village inside a massive metropolis. The low-rise buildings and cute cafe alleyways are a dream for remote workers." },
      { author: "Mark S.", role: "Freelance Designer", quote: "The community here is very close-knit. I can easily walk with my dog to local bakeries and find a quiet corner to write code." }
    ]
  },
  {
    id: 2,
    name: "Sathorn",
    slug: "sathorn",
    description: "The premier corporate office financial center. Sathorn features top-class restaurants, luxury high-rises, international schools, and leafy residential sub-sois, making it ideal for executives and families.",
    lat: 13.7242,
    lng: 100.5284,
    personality: "The Ambitious Executive",
    scores: {
      remoteWork: 7,
      petFriendly: 6,
      familyFriendly: 9,
      nightlife: 7,
      cafeCulture: 7,
      walkability: 8,
      luxury: 9,
      expatCommunity: 9,
      japaneseCommunity: 6,
      chineseCommunity: 5,
      studentSuitability: 6,
    },
    avoidanceStats: {
      traffic: 8,
      noise: 6,
      touristCrowds: 4,
      density: 8,
      busyness: 7,
    },
    commuteMinutes: {
      "Ari": 22,
      "Sukhumvit": 12,
      "Asok": 12,
      "Thong Lo": 16,
      "Ekkamai": 18,
      "Silom": 3,
      "Sathorn": 0,
      "On Nut": 24,
      "One Bangkok": 5,
      "Asoke": 12,
      "Chulalongkorn University": 8
    },
    averageRentMin: 30000,
    averageRentMax: 85000,
    nearestTransit: "Chong Nonsi BTS",
    heroImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&q=80",
    residentTypes: ["Corporate Executives", "Expat Families", "Diplomats", "Finance Professionals"],
    cafes: ["Sarnies Suki", "Koffee", "The Coffee Club", "Rocket Coffeebar"],
    coworkingSpaces: ["The Hive Sathorn", "Glowfish Sathorn", "Regus Sathorn"],
    malls: ["Silom Complex (nearby)", "Sathorn Square Retail"],
    parks: ["Lumphini Park", "Benjakitti Park (nearby)"],
    dayItinerary: [
      { time: "8:00 AM", title: "Power Breakfast", activity: "Sip an espresso at Rocket Coffeebar before the morning rush." },
      { time: "10:00 AM", title: "Corporate Strategy", activity: "Hold client meetings at Glowfish Sathorn in the square tower." },
      { time: "12:30 PM", title: "Executive Lunch", activity: "Dine with colleagues at Sarnies Suki in a restored shophouse." },
      { time: "5:30 PM", title: "Lumphini Jog", activity: "Unwind by running a 2.5km loop around Lumphini Park." },
      { time: "8:00 PM", title: "Fine Dining", activity: "Enjoy award-winning dining at one of Yen Akat's premier bistros." }
    ],
    reviews: [
      { author: "Alex D.", role: "Investment Director", quote: "Sathorn is the professional heart of the city. High-speed convenience, upscale apartments, and close to Yen Akat's quiet tree-lined lanes." },
      { author: "Sophie L.", role: "Expat Parent", quote: "We love the safety of the gated condo compounds here. Being so close to Lumphini Park makes city living easy with kids." }
    ]
  },
  {
    id: 3,
    name: "Thong Lo",
    slug: "thong-lo",
    description: "Bangkok's epicenter of style and upscale nightlife. Packed with boutique lifestyle malls, fine dining establishments, high-end cocktail bars, and premium condominiums catering to high earners.",
    lat: 13.7259,
    lng: 100.5781,
    personality: "The Luxury Socialite",
    scores: {
      remoteWork: 8,
      petFriendly: 7,
      familyFriendly: 6,
      nightlife: 10,
      cafeCulture: 9,
      walkability: 8,
      luxury: 10,
      expatCommunity: 10,
      japaneseCommunity: 10,
      chineseCommunity: 6,
      studentSuitability: 6,
    },
    avoidanceStats: {
      traffic: 9,
      noise: 8,
      touristCrowds: 6,
      density: 7,
      busyness: 9,
    },
    commuteMinutes: {
      "Ari": 20,
      "Sukhumvit": 4,
      "Asok": 4,
      "Thong Lo": 0,
      "Ekkamai": 2,
      "Silom": 15,
      "Sathorn": 16,
      "On Nut": 8,
      "One Bangkok": 12,
      "Asoke": 4,
      "Chulalongkorn University": 15
    },
    averageRentMin: 35000,
    averageRentMax: 90000,
    nearestTransit: "Thong Lo BTS",
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&q=80",
    residentTypes: ["Wealthy Locals", "Japanese Expats", "Luxury Seekers", "Socialites"],
    cafes: ["The Commons Thonglor", "Patom Organic Living", "Toby's Thonglor", "Roots Coffee"],
    coworkingSpaces: ["The Hive Thonglor", "Draft Board", "Spaces Summer Hill (nearby)"],
    malls: ["J Avenue", "Eight Thonglor", "Donki Mall Thonglor"],
    parks: ["Benjasiri Park (nearby)", "Pocket Park Thonglor"],
    dayItinerary: [
      { time: "9:00 AM", title: "Garden Brunch", activity: "Enjoy a fresh organic brunch at Patom Organic Living." },
      { time: "11:30 AM", title: "Creative Workspace", activity: "Answer emails at The Commons community courtyard." },
      { time: "2:00 PM", title: "Boutique Shopping", activity: "Browse local luxury design labels at Eight Thonglor." },
      { time: "6:30 PM", title: "Teppanyaki Dinner", activity: "Savor premium wagyu beef at a Japanese diner near J Avenue." },
      { time: "9:30 PM", title: "Mixology Experience", activity: "Sip custom cocktails at a hidden speakeasy on Soi 55." }
    ],
    reviews: [
      { author: "Koji T.", role: "Tech Entrepreneur", quote: "Thonglo has the best dining and social scene in Bangkok. You are never more than a few blocks away from Michelin-standard food and great bars." },
      { author: "Diana G.", role: "Expat Influencer", quote: "It's energetic, fashionable, and fast-paced. A true paradise for foodies and anyone who loves premium urban design." }
    ]
  },
  {
    id: 4,
    name: "Asok",
    slug: "asok",
    description: "A bustling central transit interchange node where BTS Skytrain meets MRT Subway. Extremely convenient, dense with office towers, department stores, and versatile dining options.",
    lat: 13.7369,
    lng: 100.5604,
    personality: "The Urban Professional",
    scores: {
      remoteWork: 8,
      petFriendly: 5,
      familyFriendly: 6,
      nightlife: 8,
      cafeCulture: 8,
      walkability: 10,
      luxury: 8,
      expatCommunity: 9,
      japaneseCommunity: 7,
      chineseCommunity: 8,
      studentSuitability: 7,
    },
    avoidanceStats: {
      traffic: 10,
      noise: 9,
      touristCrowds: 8,
      density: 10,
      busyness: 10,
    },
    commuteMinutes: {
      "Ari": 15,
      "Sukhumvit": 2,
      "Asok": 0,
      "Thong Lo": 4,
      "Ekkamai": 6,
      "Silom": 8,
      "Sathorn": 12,
      "On Nut": 10,
      "One Bangkok": 8,
      "Asoke": 0,
      "Chulalongkorn University": 10
    },
    averageRentMin: 25000,
    averageRentMax: 60000,
    nearestTransit: "Asok BTS / Sukhumvit MRT",
    heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&q=80",
    residentTypes: ["Young Professionals", "Multinational Employees", "Urbanites", "Commuters"],
    cafes: ["Artis Coffee", "Kuppadeli", "Chu Chocolate Cafe", "The Coffee Academics"],
    coworkingSpaces: ["The Work Loft", "Servcorp Interchange 21", "Regus Asoke"],
    malls: ["Terminal 21 Asok", "Robinson Sukhumvit"],
    parks: ["Benjakitti Park", "Lumphini Park (nearby)"],
    dayItinerary: [
      { time: "8:00 AM", title: "Commuter Brew", activity: "Grab an iced latte at Artis Coffee right by the station exit." },
      { time: "9:30 AM", title: "Co-working Hustle", activity: "Reserve a dedicated desk in the Interchange 21 tower." },
      { time: "1:00 PM", title: "World Cuisine Lunch", activity: "Eat international delicacies at Terminal 21's Pier 21 food hall." },
      { time: "5:00 PM", title: "Lake Walk", activity: "Stroll around the scenic central lake of Benjakitti Park." },
      { time: "7:30 PM", title: "Soi Cowboy Vibe", activity: "Experience the colorful street neon and dining options off Sukhumvit Soi 23." }
    ],
    reviews: [
      { author: "Liam O.", role: "IT Consultant", quote: "You live here for one reason: efficiency. Having direct walkover access to both the subway and the sky train saves me hours every week." },
      { author: "Mei Y.", role: "Global Expat", quote: "Asok is busy, loud, and incredibly convenient. Terminal 21 has everything I need, and the park is a nice escape." }
    ]
  },
  {
    id: 5,
    name: "Silom",
    slug: "silom",
    description: "A high-density business district by day and a bustling entertainment zone by night. Enjoys direct access to Lumphini Park, diverse culinary spots, and excellent transit intersections.",
    lat: 13.7285,
    lng: 100.5342,
    personality: "The Energetic City Dweller",
    scores: {
      remoteWork: 7,
      petFriendly: 5,
      familyFriendly: 7,
      nightlife: 9,
      cafeCulture: 8,
      walkability: 9,
      luxury: 8,
      expatCommunity: 9,
      japaneseCommunity: 9,
      chineseCommunity: 7,
      studentSuitability: 8,
    },
    avoidanceStats: {
      traffic: 9,
      noise: 9,
      touristCrowds: 7,
      density: 9,
      busyness: 9,
    },
    commuteMinutes: {
      "Ari": 20,
      "Sukhumvit": 10,
      "Asok": 8,
      "Thong Lo": 15,
      "Ekkamai": 17,
      "Silom": 0,
      "Sathorn": 3,
      "On Nut": 22,
      "One Bangkok": 4,
      "Asoke": 8,
      "Chulalongkorn University": 5
    },
    averageRentMin: 22000,
    averageRentMax: 55000,
    nearestTransit: "Sala Daeng BTS / Si Lom MRT",
    heroImage: "https://images.unsplash.com/photo-1590073844006-33379778ae09?w=1200&auto=format&q=80",
    residentTypes: ["LGBTQ+ Expat Community", "Business Travelers", "Japanese Executives", "Foodies"],
    cafes: ["Everyday Karmakamet", "Sarnies Roastery", "Prints 364", "Fork & Cork"],
    coworkingSpaces: ["Launchpad Coworking", "The Work Loft Silom", "WeWork T-One (nearby)"],
    malls: ["Silom Complex", "Patpong Night Market"],
    parks: ["Lumphini Park", "Chulalongkorn Centenary Park"],
    dayItinerary: [
      { time: "8:00 AM", title: "Morning Run", activity: "Jog through the misty pathways of Lumphini Park." },
      { time: "10:30 AM", title: "Art Cafe Workspace", activity: "Set up at Everyday Karmakamet for a sensory writing session." },
      { time: "1:00 PM", title: "Street Food Tour", activity: "Dine on legendary boat noodles off Silom Soi 20." },
      { time: "4:00 PM", title: "Retail Therapy", activity: "Shop air-conditioned apparel at Silom Complex mall." },
      { time: "8:30 PM", title: "Nightlife Exploration", activity: "Explore the bustling food stalls and entertainment in Patpong." }
    ],
    reviews: [
      { author: "Kenji H.", role: "Logistics Manager", quote: "Silom offers the best blend of park access and office proximity. It's vibrant, highly walkable, and has amazing Japanese ramen hubs." },
      { author: "Lucas P.", role: "Expat Designer", quote: "It has a unique, inclusive soul. The side alleys are full of hidden bars, and the park is my absolute sanctuary." }
    ]
  },
  {
    id: 6,
    name: "On Nut",
    slug: "on-nut",
    description: "A highly popular residential area for expats seeking budget-friendly housing without sacrificing Skytrain convenience. Features local markets, supermarkets, and a relaxed community feel.",
    lat: 13.7057,
    lng: 100.5999,
    personality: "The Value Nomad",
    scores: {
      remoteWork: 8,
      petFriendly: 8,
      familyFriendly: 7,
      nightlife: 5,
      cafeCulture: 7,
      walkability: 8,
      luxury: 5,
      expatCommunity: 8,
      japaneseCommunity: 4,
      chineseCommunity: 5,
      studentSuitability: 7,
    },
    avoidanceStats: {
      traffic: 5,
      noise: 4,
      touristCrowds: 2,
      density: 5,
      busyness: 5,
    },
    commuteMinutes: {
      "Ari": 28,
      "Sukhumvit": 10,
      "Asok": 10,
      "Thong Lo": 8,
      "Ekkamai": 6,
      "Silom": 22,
      "Sathorn": 24,
      "On Nut": 0,
      "One Bangkok": 18,
      "Asoke": 10,
      "Chulalongkorn University": 20
    },
    averageRentMin: 12000,
    averageRentMax: 30000,
    nearestTransit: "On Nut BTS",
    heroImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&q=80",
    residentTypes: ["Budget-conscious Expats", "English Teachers", "Local Thai Staff", "Digital Nomads"],
    cafes: ["Better Half Cafe", "Craft Cafe Onnut", "Toby's (nearby)", "The Wood Land"],
    coworkingSpaces: ["Habito Hub", "The Phyll Coworking", "Spaces Summer Hill"],
    malls: ["Tesco Lotus On Nut", "Century Plaza Movie Plaza On Nut", "Habito Mall"],
    parks: ["Benjasiri Park (nearby)", "Saeng Thip Garden"],
    dayItinerary: [
      { time: "8:30 AM", title: "Local Market Breakfast", activity: "Eat fresh Thai mango sticky rice at the local corner market." },
      { time: "10:30 AM", title: "Affordable Co-working", activity: "Work from the quiet study desks at The Phyll Coworking." },
      { time: "1:00 PM", title: "Value Lunch", activity: "Enjoy a cheap, high-quality meal at Tesco food court." },
      { time: "4:00 PM", title: "Canal Walk", activity: "Stroll along the clean waterways of Habito Mall community park." },
      { time: "7:00 PM", title: "Craft Beer Soi", activity: "Have a cold draft beer with other expats at On Nut Soi 4." }
    ],
    reviews: [
      { author: "Sarah W.", role: "English Teacher", quote: "On Nut is where your money goes the furthest. I get a modern condo with a pool for half the price of Thonglo, and it's just 3 stops away." },
      { author: "Danny V.", role: "Nomad Blogger", quote: "No tourist crowds, great local street food, and super relaxed. Habito Mall is my favorite spot to get work done." }
    ]
  },
  {
    id: 7,
    name: "Ekkamai",
    slug: "ekkamai",
    description: "An elegant neighborhood adjacent to Thong Lo, featuring premium cafes, craft beer pubs, upscale boutique shops, and a slightly quieter, more residential expat community vibe.",
    lat: 13.7196,
    lng: 100.5852,
    personality: "The Relaxed Expat",
    scores: {
      remoteWork: 9,
      petFriendly: 8,
      familyFriendly: 7,
      nightlife: 8,
      cafeCulture: 9,
      walkability: 8,
      luxury: 8,
      expatCommunity: 9,
      japaneseCommunity: 8,
      chineseCommunity: 5,
      studentSuitability: 6,
    },
    avoidanceStats: {
      traffic: 7,
      noise: 5,
      touristCrowds: 4,
      density: 4,
      busyness: 6,
    },
    commuteMinutes: {
      "Ari": 22,
      "Sukhumvit": 6,
      "Asok": 6,
      "Thong Lo": 2,
      "Ekkamai": 0,
      "Silom": 17,
      "Sathorn": 18,
      "On Nut": 6,
      "One Bangkok": 14,
      "Asoke": 6,
      "Chulalongkorn University": 16
    },
    averageRentMin: 25000,
    averageRentMax: 65000,
    nearestTransit: "Ekkamai BTS",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&q=80",
    residentTypes: ["Families", "Cafe Enthusiasts", "Young Creatives", "Expat Residents"],
    cafes: ["Ekkamai Macchiato", "Featherstone Cafe", "Ink & Lion Cafe", "Unbirthday Cafe"],
    coworkingSpaces: ["The Hive Ekkamai", "Union Space Ekkamai", "Draft Board (nearby)"],
    malls: ["Gateway Ekkamai", "Index Living Mall Ekkamai"],
    parks: ["Benjasiri Park (nearby)", "Ekkamai Pocket Garden"],
    dayItinerary: [
      { time: "9:00 AM", title: "Boutique Coffee", activity: "Drink specialty filter coffee at Ink & Lion Cafe." },
      { time: "11:00 AM", title: "Creative Workspace", activity: "Set up your laptop at The Hive Ekkamai coworking hub." },
      { time: "1:30 PM", title: "Fantasy Lunch", activity: "Dine on French-Thai culinary arts at the Featherstone Cafe." },
      { time: "4:30 PM", title: "Mall Browse", activity: "Shop Japanese cosmetics and snacks at Gateway Ekkamai." },
      { time: "8:00 PM", title: "Craft Beer Pub", activity: "Sample local craft beers at an Ekkamai Soi 10 lounge." }
    ],
    reviews: [
      { author: "Rachel B.", role: "Expat Designer", quote: "Ekkamai is Thonglo's cooler, more laid-back sibling. The cafes here are legendary, and it feels much more like a residential neighborhood." },
      { author: "Takeshi O.", role: "Bilingual Copywriter", quote: "Gateway Ekkamai makes Japanese expats feel completely at home. It is convenient, leafy, and highly pet friendly." }
    ]
  },
  {
    id: 8,
    name: "Sukhumvit",
    slug: "sukhumvit",
    description: "The core international lifestyle strip of Bangkok. Centered around Phrom Phong (EmDistrict), it is a major high-end retail, luxury dining, and premier residence enclave for global expats.",
    lat: 13.7303,
    lng: 100.5698,
    personality: "The Global Expat",
    scores: {
      remoteWork: 8,
      petFriendly: 8,
      familyFriendly: 8,
      nightlife: 7,
      cafeCulture: 9,
      walkability: 9,
      luxury: 9,
      expatCommunity: 10,
      japaneseCommunity: 8,
      chineseCommunity: 7,
      studentSuitability: 7,
    },
    avoidanceStats: {
      traffic: 8,
      noise: 7,
      touristCrowds: 8,
      density: 9,
      busyness: 8,
    },
    commuteMinutes: {
      "Ari": 17,
      "Sukhumvit": 0,
      "Asok": 2,
      "Thong Lo": 4,
      "Ekkamai": 6,
      "Silom": 10,
      "Sathorn": 12,
      "On Nut": 10,
      "One Bangkok": 10,
      "Asoke": 2,
      "Chulalongkorn University": 12
    },
    averageRentMin: 30000,
    averageRentMax: 80000,
    nearestTransit: "Phrom Phong BTS",
    heroImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&q=80",
    residentTypes: ["High Net Worth Expats", "Western Expatriates", "Families", "Shopping Enthusiasts"],
    cafes: ["Baker Gonna Bake", "Holey Artisan Bakery", "Veganerie Concept", "D'Ark EmQuartier"],
    coworkingSpaces: ["The Hive Phrom Phong", "Regus Bhiraj Tower", "Spaces EmQuartier"],
    malls: ["EmQuartier", "EmPorium", "EmSphere"],
    parks: ["Benjasiri Park", "Benjakitti Park"],
    dayItinerary: [
      { time: "9:00 AM", title: "Fresh Bakery Start", activity: "Eat fresh-baked croissants at Holey Artisan Bakery." },
      { time: "11:00 AM", title: "Luxury Retail Walk", activity: "Browse international design labels at EmQuartier." },
      { time: "1:30 PM", title: "Organic Lunch", activity: "Enjoy clean plant-based dining at Veganerie Concept." },
      { time: "4:00 PM", title: "Park Oasis", activity: "Sit under the shade tree by the lake at Benjasiri Park." },
      { time: "7:00 PM", title: "Rooftop Drinks", activity: "Sip mocktails overlooking the Sukhumvit skyline at Soi 24." }
    ],
    reviews: [
      { author: "Charlotte V.", role: "Managing Director", quote: "Phrom Phong is the ultimate expat neighborhood. It's clean, has premium shopping, and has direct access to Benjasiri Park for my morning jogs." },
      { author: "Haruto M.", role: "Expat Consultant", quote: "An incredible selection of international dining. It's lively and upscale, and you can find anything you miss from home." }
    ]
  },
];
