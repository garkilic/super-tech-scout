import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../../config/api';

const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 30000; // 30 seconds
const MAX_TIMEOUT = 120000; // 120 seconds

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function POST(request: Request) {
  let lastError = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const body = await request.json();
      
      // Validate input
      if (!body.topic || typeof body.topic !== 'string' || body.topic.trim().length === 0) {
        return NextResponse.json(
          { error: 'Topic is required and must be a non-empty string' },
          { status: 400 }
        );
      }

      // Check if API key is available
      if (!API_CONFIG.CLAUDE_API_KEY) {
        return NextResponse.json(
          { error: 'Claude API key is not configured' },
          { status: 500 }
        );
      }

      // Calculate timeout for this attempt
      const timeout = Math.min(INITIAL_TIMEOUT * Math.pow(2, attempt), MAX_TIMEOUT);

      const response = await fetchWithTimeout(
        'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_CONFIG.CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 2000, // Reduced from 4000 to prevent timeouts
            messages: [{
              role: 'user',
              content: `You are an expert technology research analyst with deep expertise in technical architecture, implementation, and industry trends. Please provide a focused analysis of the technology topic "${body.topic}". Your analysis should cover:

1. Technical Architecture (Core components, system design, data flow)
2. Implementation Details (Development stack, deployment, best practices)
3. Security Considerations (Security architecture, data protection, compliance)
4. Integration Patterns (API design, data exchange, error handling)
5. Industry Landscape (Market position, trends, challenges)

Format your response in clear markdown with concise sections. Focus on key insights and practical details.`
            }],
          }),
        },
        timeout
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        lastError = `Claude API error: ${response.statusText}${errorData.error ? ` - ${errorData.error.message}` : ''}`;
        
        // If we get a rate limit error, wait before retrying
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(lastError);
      }

      const data = await response.json();
      return NextResponse.json({ content: data.content[0].text });
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Failed to process request';
      
      // If this is not the last attempt, continue to next retry
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        continue;
      }
    }
  }

  // If we've exhausted all retries, return the last error
  return NextResponse.json(
    { error: lastError || 'Failed to process request after multiple attempts' },
    { status: 500 }
  );
} 