import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { analyzeImage } from '../../services/geminiService';

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
    const { base64Image, mimeType, prompt, isDeepAnalysis } = body;

    if (!base64Image || !prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image and prompt are required' }),
      };
    }

    const analysis = await analyzeImage(
      base64Image,
      mimeType,
      prompt,
      isDeepAnalysis || false
    );

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysis }),
    };
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message || 'Failed to analyze image',
      }),
    };
  }
};

