export type IconName = 'image' | 'edit' | 'movie' | 'analyze' | 'chat' | 'sparkles' | 'logout';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
export type VideoAspectRatio = "16:9" | "9:16";
export type VideoResolution = "720p" | "1080p" | "4K";
export type ImageResolution = "480p" | "720p" | "1080p" | "2K" | "4K" | "8K";
export type ImageStyle = 'Photographic' | 'Anime' | 'Painting' | 'Fantasy' | 'Sci-Fi' | 'Cartoon' | 'Minimalist' | 'Abstract' | '3D Render' | 'Realistic';

export type ConcreteImageModel = 'imagen-4.0-generate-001' | 'gemini-2.5-flash-image';
export type ImageModel = 'auto' | ConcreteImageModel;

export interface ImageModelDefinition {
  id: ConcreteImageModel;
  name: string;
  description: string;
}

export interface ImageGenerationHistoryEntry {
  id: string;
  prompt: string;
  model: ConcreteImageModel;
  aspectRatio: AspectRatio;
  resolution: ImageResolution;
  styles: ImageStyle[];
  numberOfImages: number;
  imageUrls: string[];
  timestamp: string;
}


declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // FIX: Made the 'aistudio' property optional to resolve a declaration conflict.
    aistudio?: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}