import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { generatePromptOptions } from '../../services/geminiService';

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
    const { context, promptForOptions } = body;

    if (!context || !promptForOptions) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Context and prompt are required' }),
      };
    }

    const options = await generatePromptOptions(context, promptForOptions);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ options }),
    };
  } catch (error: any) {
    console.error('Error generating prompt options:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message || 'Failed to generate options',
      }),
    };
  }
};

