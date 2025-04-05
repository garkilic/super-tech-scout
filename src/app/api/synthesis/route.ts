import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../../config/api';

const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 45000; // 45 seconds
const MAX_TIMEOUT = 180000; // 180 seconds

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

      if (!body.gpt4Analysis || typeof body.gpt4Analysis !== 'string' || body.gpt4Analysis.trim().length === 0) {
        return NextResponse.json(
          { error: 'GPT-4 analysis is required and must be a non-empty string' },
          { status: 400 }
        );
      }

      if (!body.geminiAnalysis || typeof body.geminiAnalysis !== 'string' || body.geminiAnalysis.trim().length === 0) {
        return NextResponse.json(
          { error: 'Gemini analysis is required and must be a non-empty string' },
          { status: 400 }
        );
      }

      if (!body.claudeAnalysis || typeof body.claudeAnalysis !== 'string' || body.claudeAnalysis.trim().length === 0) {
        return NextResponse.json(
          { error: 'Claude analysis is required and must be a non-empty string' },
          { status: 400 }
        );
      }

      // Calculate timeout for this attempt
      const timeout = Math.min(INITIAL_TIMEOUT * Math.pow(2, attempt), MAX_TIMEOUT);

      const response = await fetchWithTimeout(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [
              {
                role: 'system',
                content: 'You are an expert technology research analyst specializing in synthesizing complex technical information into clear, actionable insights.'
              },
              {
                role: 'user',
                content: `Synthesize these analyses of "${body.topic}" into a concise, well-structured report. Focus on key insights and eliminate redundancy.

# Research Report: ${body.topic}

## Executive Summary
[Key findings and recommendations]

## Technical Analysis
[Core architecture, implementation details, and performance considerations]

## Market & Industry Analysis
[Market trends, adoption, competition]

## Security & Integration
[Security features, compliance, integration patterns]

## Future Outlook & Recommendations
[Emerging trends and strategic recommendations]

Here are the analyses to synthesize:

GPT-4 Analysis:
${body.gpt4Analysis}

Gemini Analysis:
${body.geminiAnalysis}

Claude Analysis:
${body.claudeAnalysis}`
              }
            ],
            temperature: 0.7,
            max_tokens: 2500,
          }),
        },
        timeout
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        lastError = `OpenAI API error: ${response.statusText}${errorData.error ? ` - ${errorData.error.message}` : ''}`;
        
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
      const synthesizedReport = data.choices[0].message.content;

      return NextResponse.json({ content: synthesizedReport });
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