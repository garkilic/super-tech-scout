import { API_CONFIG } from '../config/api';

interface ChatGPTResponse {
  content: string;
  error?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function analyzeTechnology(topic: string): Promise<ChatGPTResponse> {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (response.status === 429) {
        retries++;
        if (retries < MAX_RETRIES) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY * retries;
          console.log(`Rate limited. Retrying in ${delay/1000} seconds... (Attempt ${retries + 1}/${MAX_RETRIES})`);
          await sleep(delay);
          continue;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze technology');
      }

      const data = await response.json();
      return {
        content: data.content,
      };
    } catch (error) {
      if (retries < MAX_RETRIES - 1) {
        retries++;
        console.log(`Error occurred. Retrying in ${RETRY_DELAY/1000} seconds... (Attempt ${retries + 1}/${MAX_RETRIES})`);
        await sleep(RETRY_DELAY);
        continue;
      }
      console.error('ChatGPT API error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Failed to analyze technology',
      };
    }
  }

  return {
    content: '',
    error: 'Maximum retry attempts reached. Please try again later.',
  };
} 