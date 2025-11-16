import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { generateVideo } from '../../services/geminiService';
import { VideoAspectRatio, VideoResolution } from '../../types';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
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
    const { prompt, aspectRatio, resolution, image } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    const operation = await generateVideo(
      prompt,
      aspectRatio as VideoAspectRatio,
      resolution as VideoResolution,
      image
    );

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation }),
    };
  } catch (error: any) {
    console.error('Error generating video:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message || 'Failed to generate video',
      }),
    };
  }
};

