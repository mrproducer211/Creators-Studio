import { Feature, AspectRatio, VideoAspectRatio, VideoResolution, ImageResolution, ImageStyle, ImageModelDefinition } from './types';

export const FEATURES: Feature[] = [
  {
    id: 'generate-image',
    title: 'Generate Image',
    description: 'Create stunning visuals from a simple text description using Imagen.',
    icon: 'image',
  },
  {
    id: 'edit-image',
    title: 'Edit Image',
    description: 'Modify images with text prompts. Add objects, change styles, and more.',
    icon: 'edit',
  },
  {
    id: 'generate-video',
    title: 'Generate Video',
    description: 'Bring your ideas to life. Create dynamic videos from text or a starting image.',
    icon: 'movie',
  },
  {
    id: 'analyze-image',
    title: 'Analyze Image',
    description: 'Upload an image and ask questions to understand its content.',
    icon: 'analyze',
  },
  {
    id: 'chatbot',
    title: 'Prompt Bot',
    description: 'Refine your ideas into detailed, effective prompts for image or video generation.',
    icon: 'chat',
  },
  {
    id: 'enhance-image',
    title: 'Enhancer',
    description: 'Upscale and enhance your images to stunning high resolutions with an advanced AI engine.',
    icon: 'sparkles',
  },
];

export const IMAGE_ASPECT_RATIOS: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];
export const IMAGE_RESOLUTIONS: ImageResolution[] = ["480p", "720p", "1080p", "2K", "4K"];
export const ENHANCEMENT_RESOLUTIONS: ImageResolution[] = ["2K", "4K", "8K"];
export const VIDEO_ASPECT_RATIOS: VideoAspectRatio[] = ["16:9", "9:16"];
export const VIDEO_RESOLUTIONS: VideoResolution[] = ["720p", "1080p", "4K"];
export const IMAGE_STYLES: ImageStyle[] = ['Photographic', 'Anime', 'Painting', 'Fantasy', 'Sci-Fi', 'Cartoon', 'Minimalist', 'Abstract', '3D Render', 'Realistic'];
export const CAMERA_ANGLES: string[] = [
    'Eye-Level', 'High-Angle', 'Low-Angle', 'Dutch-Angle', "Bird's-Eye-View", "Worm's-Eye-View",
    'Point-of-View (POV)', 'Over-the-Shoulder', 'Close-Up Shot', 'Wide Shot', 'Medium Shot', 'Full Shot'
];

export const CAMERA_TYPES: string[] = [
    "shot with a DSLR camera, Canon EOS R5",
    "captured on a Sony Alpha a7 IV, cinematic look",
    "photographed with a Nikon Z7 II, professional quality",
    "Leica M11 rangefinder shot",
    "captured on film, Kodak Portra 400",
    "shot on a high-end Hasselblad X2D 100C",
    "FujiFilm GFX 100S medium format photo",
    "iPhone 15 Pro, hyperrealistic photo"
];


export const IMAGE_MODELS: ImageModelDefinition[] = [
  {
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4',
    description: 'Highest quality generation. Best for detailed, artistic, or photorealistic visuals.',
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini Flash Image',
    description: 'Fast and versatile. Good for general purpose image creation and quick iterations.',
  },
];

export const VEO_LOADING_MESSAGES = [
    "Warming up the digital director's chair...",
    "Choreographing pixels into motion...",
    "Rendering your cinematic vision...",
    "This can take a few minutes, great art needs time!",
    "Adjusting the lighting and setting the scene...",
    "The digital film is rolling...",
    "Almost ready for the premiere...",
];

export const PROMPT_BOT_QUESTIONS = [
  {
    key: 'action',
    question: (subject: string) => `Great start! What should the ${subject} be doing?`,
    prompt: (subject: string) => `Generate 5 creative, simple, easy-to-understand ideas for what a ${subject} could be doing in a picture. Each idea should be a short phrase.`,
  },
  {
    key: 'setting',
    question: (subject: string) => `And where is this scene taking place?`,
    prompt: (context: string) => `For the scene "${context}", suggest 5 different places or backgrounds. Keep the descriptions simple and clear.`,
  },
  {
    key: 'style',
    question: (subject: string) => `What artistic style are you imagining?`,
    prompt: (context: string) => `For the scene "${context}", list 5 different art styles. Use simple terms. Include common styles like 'like a real photo' and creative ones.`,
  },
  {
    key: 'mood',
    question: (subject: string) => `Finally, what's the mood or lighting?`,
    prompt: (context: string) => `Based on "${context}", suggest 5 simple options for the feeling or lighting of the scene. For example, 'dark and mysterious' or 'bright and sunny'.`,
  },
];