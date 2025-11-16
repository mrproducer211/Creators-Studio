import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { checkVideoOperation } from '../../services/geminiService';
import { Operation } from '@google/genai';

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
    const { operation } = body;

    if (!operation) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Operation is required' }),
      };
    }

    const updatedOperation = await checkVideoOperation(operation as Operation);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation: updatedOperation }),
    };
  } catch (error: any) {
    console.error('Error checking video operation:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message || 'Failed to check video operation',
      }),
    };
  }
};

