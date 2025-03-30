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
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are an expert technology research assistant. Analyze the following topic and generate a structured, in-depth report that includes the following sections:

1. Overview and Current Landscape
Provide a concise explanation of the technology, its core functionality, and the current state of development. Mention key players, recent advancements, and notable trends.

2. Key Applications and Use Cases
List the most relevant and emerging applications across industries. Include specific examples where appropriate to illustrate practical impact.

3. Technical Challenges and Limitations
Identify known bottlenecks, constraints, and areas where the technology faces performance, scalability, security, or interoperability issues.

4. Future Outlook and Emerging Trends
Describe likely future developments, ongoing research areas, and promising directions over the next 3 to 5 years.

5. Market Impact and Industry Adoption
Summarize how the technology is being adopted across sectors. Include insights on market dynamics, investment activity, regulatory considerations, and competitive positioning.

Please analyze the technology topic: ${topic}

Instructions:
- Use clear section headings.
- Be factual and concise.
- Use bullet points or short paragraphs for clarity.
- Avoid speculation not grounded in current data or observable trends.`
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