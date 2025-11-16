import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { generateImage } from '../../services/geminiService';
import { AspectRatio, ImageResolution, ImageStyle, ConcreteImageModel } from '../../types';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { prompt, aspectRatio, resolution, styles, model, numberOfImages } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    const images = await generateImage(
      prompt,
      aspectRatio as AspectRatio,
      resolution as ImageResolution,
      (styles || []) as ImageStyle[],
      model as ConcreteImageModel,
      numberOfImages || 1
    );

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images }),
    };
  } catch (error: any) {
    console.error('Error generating image:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message || 'Failed to generate image',
      }),
    };
  }
};

