import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../../config/api';

export async function POST(request: Request) {
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
      console.error('Claude API key is missing');
      return NextResponse.json(
        { error: 'Claude API key is not configured' },
        { status: 500 }
      );
    }

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: API_CONFIG.CLAUDE_MODEL,
          max_tokens: API_CONFIG.CLAUDE_MAX_TOKENS,
          messages: [{
            role: 'user',
            content: `You are an expert technology research analyst specializing in technical architecture and implementation details. Please provide a detailed analysis of the technology topic "${body.topic}". Include information about:

1. Technical Architecture and Components
2. Implementation Considerations
3. Performance Characteristics and Scalability
4. Security Considerations and Best Practices
5. Integration Patterns and Technical Dependencies

Format your response in clear, well-structured paragraphs with appropriate markdown formatting.`
          }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Claude API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        // Handle specific error cases
        if (response.status === 502) {
          return NextResponse.json(
            { error: 'Unable to connect to Claude API. Please try again later.' },
            { status: 502 }
          );
        }

        return NextResponse.json(
          { error: `Claude API error: ${response.statusText}${errorData.error ? ` - ${errorData.error.message}` : ''}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
        console.error('Unexpected Claude API response format:', data);
        return NextResponse.json(
          { error: 'Unexpected response format from Claude API' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ content: data.content[0].text });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Claude API request timed out');
        return NextResponse.json(
          { error: 'Request to Claude API timed out. Please try again.' },
          { status: 504 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
} 