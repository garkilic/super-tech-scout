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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_CONFIG.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
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
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Claude API error: ${response.statusText}${errorData.error ? ` - ${errorData.error.message}` : ''}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ content: data.content[0].text });
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
} 