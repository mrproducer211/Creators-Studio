export interface NearbyPlace {
  name: string;
  category: "BTS/MRT" | "Cafes" | "Restaurants" | "Shopping" | "Fitness" | "Parks" | "Co-working" | "Markets" | "Hospitals";
  distance: string;
  rating: number;
  image: string;
}

export const NEARBY_PLACES_DATA: Record<string, NearbyPlace[]> = {
  "Sukhumvit": [
    { name: "EmQuartier Shopping Mall", category: "Shopping", distance: "3 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "Benjasiri Park", category: "Parks", distance: "4 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1596700447384-e40ab4a4a4a4?w=400&auto=format&q=80" },
    { name: "Phrom Phong BTS Station", category: "BTS/MRT", distance: "3 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&auto=format&q=80" },
    { name: "Holey Artisan Bakery", category: "Cafes", distance: "5 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&auto=format&q=80" },
    { name: "The Hive Phrom Phong", category: "Co-working", distance: "6 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&auto=format&q=80" },
    { name: "Roast EmQuartier", category: "Restaurants", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&q=80" },
    { name: "Samitivej Sukhumvit Hospital", category: "Hospitals", distance: "12 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "Camillian Hospital", category: "Hospitals", distance: "15 min drive", rating: 4.1, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" }
  ],
  "Sathorn": [
    { name: "Chong Nonsi BTS Station", category: "BTS/MRT", distance: "2 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1580237072617-771c4e21b910?w=400&auto=format&q=80" },
    { name: "Lumphini Park", category: "Parks", distance: "15 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1588771746270-f47225102510?w=400&auto=format&q=80" },
    { name: "Sarnies Suki", category: "Restaurants", distance: "5 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&q=80" },
    { name: "Rocket Coffeebar S.12", category: "Cafes", distance: "6 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&q=80" },
    { name: "The Hive Sathorn", category: "Co-working", distance: "4 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&q=80" },
    { name: "Fitness First Sathorn Square", category: "Fitness", distance: "8 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&q=80" },
    { name: "BNH Hospital", category: "Hospitals", distance: "8 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "Saint Louis Hospital", category: "Hospitals", distance: "12 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" }
  ],
  "Thong Lo": [
    { name: "Thong Lo BTS Station", category: "BTS/MRT", distance: "4 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?w=400&auto=format&q=80" },
    { name: "The Commons Thonglor", category: "Shopping", distance: "5 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1582298538104-ed2d6bb5ab82?w=400&auto=format&q=80" },
    { name: "Patom Organic Living", category: "Cafes", distance: "8 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&q=80" },
    { name: "Octave Rooftop Lounge", category: "Restaurants", distance: "6 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&q=80" },
    { name: "Absolute You Gym", category: "Fitness", distance: "7 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&q=80" },
    { name: "theCOMMONS Lawn", category: "Parks", distance: "5 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1596700447384-e40ab4a4a4a4?w=400&auto=format&q=80" },
    { name: "Samitivej Sukhumvit Hospital", category: "Hospitals", distance: "10 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "Camillian Hospital", category: "Hospitals", distance: "15 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" }
  ],
  "Asok": [
    { name: "Asok BTS / Sukhumvit MRT Station", category: "BTS/MRT", distance: "1 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&auto=format&q=80" },
    { name: "Terminal 21 Asok", category: "Shopping", distance: "2 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1569937728357-4971c45f974c?w=400&auto=format&q=80" },
    { name: "Benjakitti Park", category: "Parks", distance: "10 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1596700447384-e40ab4a4a4a4?w=400&auto=format&q=80" },
    { name: "Artis Coffee", category: "Cafes", distance: "3 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&q=80" },
    { name: "The Work Loft Asok", category: "Co-working", distance: "4 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&auto=format&q=80" },
    { name: "El Gaucho Steakhouse", category: "Restaurants", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&q=80" },
    { name: "Rutnin Eye Hospital", category: "Hospitals", distance: "8 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "Bumrungrad International Hospital", category: "Hospitals", distance: "10 min drive", rating: 4.7, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" }
  ],
  "Silom": [
    { name: "Sala Daeng BTS / Si Lom MRT Station", category: "BTS/MRT", distance: "2 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&auto=format&q=80" },
    { name: "Silom Complex", category: "Shopping", distance: "3 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "Lumphini Park", category: "Parks", distance: "8 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1588771746270-f47225102510?w=400&auto=format&q=80" },
    { name: "Everyday Karmakamet", category: "Cafes", distance: "4 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&q=80" },
    { name: "Sarnies Roastery", category: "Restaurants", distance: "6 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&q=80" },
    { name: "Patpong Night Market", category: "Markets", distance: "5 min walk", rating: 4.1, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&q=80" },
    { name: "Bangkok Christian Hospital", category: "Hospitals", distance: "5 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "BNH Hospital", category: "Hospitals", distance: "10 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" }
  ],
  "On Nut": [
    { name: "On Nut BTS Station", category: "BTS/MRT", distance: "2 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1580237072617-771c4e21b910?w=400&auto=format&q=80" },
    { name: "Lotus's On Nut", category: "Shopping", distance: "3 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&q=80" },
    { name: "Century Movie Plaza On Nut", category: "Shopping", distance: "2 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1569937728357-4971c45f974c?w=400&auto=format&q=80" },
    { name: "The Wood Land Cafe", category: "Cafes", distance: "6 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&q=80" },
    { name: "Habito Hub", category: "Co-working", distance: "10 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&q=80" },
    { name: "On Nut Food Court", category: "Markets", distance: "4 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&q=80" },
    { name: "Sukumvit Hospital", category: "Hospitals", distance: "7 min drive", rating: 4.2, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "Kluaynamthai Hospital", category: "Hospitals", distance: "10 min drive", rating: 3.8, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" }
  ],
  "Ekkamai": [
    { name: "Ekkamai BTS Station", category: "BTS/MRT", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?w=400&auto=format&q=80" },
    { name: "Gateway Ekkamai", category: "Shopping", distance: "3 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "Featherstone Cafe", category: "Cafes", distance: "12 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&q=80" },
    { name: "Ekkamai Beer House", category: "Restaurants", distance: "5 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&q=80" },
    { name: "The Hive Ekkamai", category: "Co-working", distance: "6 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&q=80" },
    { name: "Ekkamai Pocket Garden", category: "Parks", distance: "8 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1588771746270-f47225102510?w=400&auto=format&q=80" },
    { name: "Sukumvit Hospital", category: "Hospitals", distance: "8 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "Camillian Hospital", category: "Hospitals", distance: "8 min drive", rating: 4.1, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" }
  ],
  "Ari": [
    { name: "Ari BTS Station", category: "BTS/MRT", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&auto=format&q=80" },
    { name: "La Villa Ari", category: "Shopping", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1582298538104-ed2d6bb5ab82?w=400&auto=format&q=80" },
    { name: "Villa Market Ari", category: "Shopping", distance: "6 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&q=80" },
    { name: "Common Room x Babe", category: "Cafes", distance: "5 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&q=80" },
    { name: "The Hive Ari", category: "Co-working", distance: "7 min walk", rating: 4.8, image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&auto=format&q=80" },
    { name: "Landhaus Bakery", category: "Cafes", distance: "8 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&auto=format&q=80" },
    { name: "Gump's Ari", category: "Markets", distance: "4 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&q=80" },
    { name: "Phyathai 2 Hospital", category: "Hospitals", distance: "12 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "Vimut Hospital", category: "Hospitals", distance: "15 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" }
  ],
  "Rama 9": [
    { name: "Phra Ram 9 MRT Station", category: "BTS/MRT", distance: "2 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?w=400&auto=format&q=80" },
    { name: "Central Plaza Grand Rama 9", category: "Shopping", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "Fortune Town IT Mall", category: "Shopping", distance: "4 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1569937728357-4971c45f974c?w=400&auto=format&q=80" },
    { name: "Bellinee's G Tower", category: "Cafes", distance: "2 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&q=80" },
    { name: "Regus G Tower", category: "Co-working", distance: "3 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&q=80" },
    { name: "Jodd Fairs Rama 9", category: "Markets", distance: "6 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&q=80" },
    { name: "Praram 9 Hospital", category: "Hospitals", distance: "10 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "Piyavate Hospital", category: "Hospitals", distance: "8 min drive", rating: 4.2, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" }
  ],
  "Bang Na": [
    { name: "Bang Na BTS Station", category: "BTS/MRT", distance: "5 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1580237072617-771c4e21b910?w=400&auto=format&q=80" },
    { name: "Mega Bangna & IKEA", category: "Shopping", distance: "15 min drive", rating: 4.7, image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&auto=format&q=80" },
    { name: "Central Plaza Bangna", category: "Shopping", distance: "8 min drive", rating: 4.4, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "La Mesa Coffee Co.", category: "Cafes", distance: "6 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&q=80" },
    { name: "Rama IX Park", category: "Parks", distance: "12 min drive", rating: 4.6, image: "https://images.unsplash.com/photo-1596700447384-e40ab4a4a4a4?w=400&auto=format&q=80" },
    { name: "Bang Na Market", category: "Markets", distance: "8 min walk", rating: 4.1, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&q=80" },
    { name: "WIH International Hospital", category: "Hospitals", distance: "12 min drive", rating: 4.6, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "Sikarin Hospital", category: "Hospitals", distance: "15 min drive", rating: 4.3, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" },
    { name: "Camillian Hospital", category: "Hospitals", distance: "25 min drive", rating: 4.1, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" } // Test hospital > 20 mins, should not show!
  ],
  "Huai Khwang": [
    { name: "Huai Khwang MRT Station", category: "BTS/MRT", distance: "2 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&auto=format&q=80" },
    { name: "The Street Ratchada", category: "Shopping", distance: "10 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1569937728357-4971c45f974c?w=400&auto=format&q=80" },
    { name: "Esplanade Ratchada", category: "Shopping", distance: "12 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "Huai Khwang Night Market", category: "Markets", distance: "5 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&q=80" },
    { name: "Chuan Chuan Cafe", category: "Cafes", distance: "6 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&q=80" },
    { name: "The Street Cyberport", category: "Co-working", distance: "10 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&auto=format&q=80" },
    { name: "Bangkok Hospital", category: "Hospitals", distance: "15 min drive", rating: 4.7, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "Praram 9 Hospital", category: "Hospitals", distance: "12 min drive", rating: 4.5, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" }
  ],
  "Phaya Thai": [
    { name: "Phaya Thai BTS & ARL Station", category: "BTS/MRT", distance: "1 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&auto=format&q=80" },
    { name: "Century Movie Plaza", category: "Shopping", distance: "6 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&auto=format&q=80" },
    { name: "Factory Coffee", category: "Cafes", distance: "2 min walk", rating: 4.8, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&q=80" },
    { name: "Santiphap Park", category: "Parks", distance: "8 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1588771746270-f47225102510?w=400&auto=format&q=80" },
    { name: "Spaces Phayathai", category: "Co-working", distance: "2 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&auto=format&q=80" },
    { name: "King Power Rangnam", category: "Shopping", distance: "7 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "Phyathai 1 Hospital", category: "Hospitals", distance: "8 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" },
    { name: "Rajavithi Hospital", category: "Hospitals", distance: "12 min walk", rating: 4.1, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&q=80" }
  ]
};

const getMinutes = (distanceStr: string): number => {
  const match = distanceStr.match(/(\d+)\s*(?:min|minute)/i);
  return match ? parseInt(match[1], 10) : Infinity;
};

function getDefaultPlaces(area: string): NearbyPlace[] {
  return [
    { name: `${area} Transit Station`, category: "BTS/MRT", distance: "5 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&auto=format&q=80" },
    { name: `${area} Landmark Mall`, category: "Shopping", distance: "5 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1569937728357-4971c45f974c?w=400&auto=format&q=80" },
    { name: `${area} Local Diner`, category: "Restaurants", distance: "4 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&q=80" },
    { name: `${area} Market`, category: "Markets", distance: "7 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&q=80" },
    { name: `${area} Specialty Coffee`, category: "Cafes", distance: "3 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&q=80" },
    { name: `${area} Fitness Club`, category: "Fitness", distance: "10 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&q=80" },
    { name: `${area} Community Park`, category: "Parks", distance: "12 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1596700447384-e40ab4a4a4a4?w=400&auto=format&q=80" },
    { name: `${area} Coworking Space`, category: "Co-working", distance: "8 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&q=80" },
    { name: `${area} Community Hospital`, category: "Hospitals", distance: "10 min drive", rating: 4.3, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=400&auto=format&q=80" }
  ];
}

export function getNearbyPlaces(area: string): NearbyPlace[] {
  const rawPlaces = NEARBY_PLACES_DATA[area] || getDefaultPlaces(area);
  return rawPlaces.filter((place) => {
    if (place.category === "Hospitals") {
      const mins = getMinutes(place.distance);
      return mins <= 20;
    }
    return true;
  });
}
