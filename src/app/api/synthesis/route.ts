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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an expert technology research analyst. Your task is to synthesize insights from three different AI analyses of the technology topic "${body.topic}" into a cohesive, well-structured research report.

The analyses are from GPT-4, Gemini, and Claude. Your goal is to create a unified report that:
1. Eliminates redundancy
2. Resolves any contradictions
3. Maintains a consistent tone and style
4. Presents information in a clear, logical flow

Please structure your response as a markdown document with the following sections:

# Research Report: ${body.topic}

## Executive Summary
[2-3 paragraphs providing a high-level overview]

## Technology Overview
[2-3 paragraphs about core components and architecture]

## Technical Analysis
[3-4 paragraphs about implementation details and performance]

## Market Analysis
[3-4 paragraphs about market trends, adoption, and investment]

## Security and Compliance
[2-3 paragraphs about security features and regulatory considerations]

## Integration and Implementation
[2-3 paragraphs about practical implementation considerations]

## Future Outlook
[3-4 paragraphs about emerging trends and potential developments]

## Strategic Recommendations
[2-3 paragraphs with actionable insights]

## Risk Assessment
[2-3 paragraphs about technical, business, and security risks]

## Conclusion
[2-3 paragraphs summarizing key takeaways]

Guidelines:
- Use clear, professional language
- Keep paragraphs concise (2-4 sentences)
- Use bullet points sparingly and only when needed
- Maintain a consistent technical depth throughout
- Include specific examples and data points where available
- Cite which AI model provided key insights when relevant

Here are the three analyses to synthesize:

GPT-4 Analysis:
${body.gpt4Analysis}

Gemini Analysis:
${body.geminiAnalysis}

Claude Analysis:
${body.claudeAnalysis}`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `OpenAI API error: ${response.statusText}${errorData.error ? ` - ${errorData.error.message}` : ''}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const synthesizedReport = data.choices[0].message.content;

    // Add metadata and disclaimer
    const finalReport = `${synthesizedReport}

---
This report was generated using Super Tech Scout, combining insights from GPT-4, Gemini, and Claude AI models. The analysis represents a synthesis of current market data, technical specifications, and industry trends. While every effort has been made to ensure accuracy, organizations should conduct their own due diligence before making strategic decisions.

Generated on: ${new Date().toLocaleDateString()}`;

    return NextResponse.json({ content: finalReport });
  } catch (error) {
    console.error('Synthesis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
} 