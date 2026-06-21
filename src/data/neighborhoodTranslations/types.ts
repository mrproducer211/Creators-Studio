export interface NeighborhoodTranslation {
  name: string;
  personality: string;
  description: string;
  nearestTransit: string;
  district: string;
  btsCode: string;
  airportTime: string;
  vibe: string;
  bestFor: string;
  pros: string[];
  lifestyleDesc: string;
  vibeCards: { title: string; subtitle: string }[];
  guides: { heading: string; paragraphs: string[] }[];
}

export interface NeighborhoodTranslationSet {
  en: NeighborhoodTranslation;
  th: NeighborhoodTranslation;
  zh: NeighborhoodTranslation;
}
