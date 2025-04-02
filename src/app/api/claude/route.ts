import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../../config/api';

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

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
        temperature: API_CONFIG.CLAUDE_TEMPERATURE,
        messages: [
          {
            role: 'user',
            content: `You are a technical expert specializing in deep technology analysis. Focus on the technical aspects of "${topic}":

1. Technical Deep Dive
- Core architecture
- Key algorithms and methodologies
- Technical specifications

2. Implementation Considerations
- Integration requirements
- Performance considerations
- Scalability factors

3. Technical Challenges
- Known limitations
- Performance bottlenecks
- Security considerations

4. Technical Future
- Emerging technical developments
- Research directions
- Technical innovations

Provide detailed technical insights with code examples where relevant.`
          }
        ]
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
    const content = data.content?.[0]?.text || '';

    if (!content) {
      return NextResponse.json(
        { error: 'No content in response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze technology' },
      { status: 500 }
    );
  }
} 