import { BeautyAnalysis } from '../types';

// Using a proxy to bypass potential regional restrictions.
const PROXY_URL = 'https://thingproxy.freeboard.io/fetch/';
const API_ENDPOINT = '/api/analyze';

export async function analyzeImageForBeauty(base64Image: string): Promise<BeautyAnalysis> {
  // We need the full URL of our own API to pass to the proxy.
  const targetUrl = new URL(API_ENDPOINT, window.location.origin).toString();
  const proxiedUrl = `${PROXY_URL}${targetUrl}`;
  
  try {
    const response = await fetch(proxiedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Use the message from the serverless function's error response, or a default.
      throw new Error(result.message || 'خطایی در ارتباط با سرور رخ داد.');
    }

    return result as BeautyAnalysis;
  } catch (error) {
    console.error("Error calling backend API via proxy:", error);
    // Re-throw the error to be caught by the UI component.
    // If it's a network error, error.message will be populated.
    // If it's an error from our API, we've already created an Error object with the message.
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('یک خطای پیش‌بینی نشده در ارتباط با سرور رخ داد.');
  }
}
