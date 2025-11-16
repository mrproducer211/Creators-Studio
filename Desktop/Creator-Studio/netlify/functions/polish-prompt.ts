import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { polishPrompt } from '../../services/geminiService';

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
    const { promptDetails, cameraAngle } = body;

    if (!promptDetails || !cameraAngle) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt details and camera angle are required' }),
      };
    }

    const polishedPrompt = await polishPrompt(promptDetails, cameraAngle);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: polishedPrompt }),
    };
  } catch (error: any) {
    console.error('Error polishing prompt:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message || 'Failed to polish prompt',
      }),
    };
  }
};

