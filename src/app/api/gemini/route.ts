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

    const prompt = `You are an expert technology research analyst specializing in market trends and emerging technologies. Please provide a detailed analysis of the technology topic "${body.topic}". Include information about:

1. Market Landscape and Industry Trends
2. Key Players and Competitive Analysis
3. Investment Activity and Growth Metrics
4. Adoption Patterns and Use Cases
5. Future Market Projections

Format your response in clear, well-structured paragraphs with appropriate markdown formatting.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=' + API_CONFIG.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 40
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Gemini API error: ${response.statusText}${errorData.error ? ` - ${errorData.error.message}` : ''}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ content: data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
} 