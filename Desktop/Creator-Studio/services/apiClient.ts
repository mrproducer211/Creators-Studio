import { AspectRatio, ImageResolution, ImageStyle, ConcreteImageModel } from '../types';
import { Operation } from '@google/genai';

// Use Netlify functions in production, localhost in development
const API_BASE = import.meta.env.DEV ? '' : '';

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  styles: ImageStyle[],
  model: ConcreteImageModel,
  numberOfImages: number
): Promise<string[]> => {
  const response = await fetch(`${API_BASE}/.netlify/functions/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio, resolution, styles, model, numberOfImages }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate image' }));
    throw new Error(error.error || 'Failed to generate image');
  }

  const { images } = await response.json();
  return images;
};

export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const response = await fetch(`${API_BASE}/.netlify/functions/edit-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, mimeType, prompt }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to edit image' }));
    throw new Error(error.error || 'Failed to edit image');
  }

  const { image } = await response.json();
  return image;
};

export const analyzeImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  isDeepAnalysis: boolean
): Promise<string> => {
  const response = await fetch(`${API_BASE}/.netlify/functions/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, mimeType, prompt, isDeepAnalysis }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to analyze image' }));
    throw new Error(error.error || 'Failed to analyze image');
  }

  const { analysis } = await response.json();
  return analysis;
};

export const generatePromptOptions = async (
  context: string,
  promptForOptions: string
): Promise<string[]> => {
  const response = await fetch(`${API_BASE}/.netlify/functions/generate-prompt-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context, promptForOptions }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate options' }));
    throw new Error(error.error || 'Failed to generate options');
  }

  const { options } = await response.json();
  return options;
};

export const polishPrompt = async (
  promptDetails: Record<string, string>,
  cameraAngle: string
): Promise<string> => {
  const response = await fetch(`${API_BASE}/.netlify/functions/polish-prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promptDetails, cameraAngle }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to polish prompt' }));
    throw new Error(error.error || 'Failed to polish prompt');
  }

  const { prompt } = await response.json();
  return prompt;
};

export const generateVideo = async (
  prompt: string,
  aspectRatio: string,
  resolution: string,
  image?: { data: string; mimeType: string }
): Promise<Operation> => {
  const response = await fetch(`${API_BASE}/.netlify/functions/generate-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio, resolution, image }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate video' }));
    throw new Error(error.error || 'Failed to generate video');
  }

  const { operation } = await response.json();
  return operation;
};

export const checkVideoOperation = async (operation: Operation): Promise<Operation> => {
  const response = await fetch(`${API_BASE}/.netlify/functions/check-video-operation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to check video operation' }));
    throw new Error(error.error || 'Failed to check video operation');
  }

  const { operation: updatedOperation } = await response.json();
  return updatedOperation;
};

// Keep enhanceWithESRGAN as-is since it calls an external API directly
export { enhanceWithESRGAN } from './geminiService';

