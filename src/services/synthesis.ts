interface SynthesisInput {
  topic: string;
  gpt4Analysis: string;
  geminiAnalysis: string;
  claudeAnalysis: string;
}

interface SynthesisSection {
  title: string;
  summary: string;
  keyPoints: string[];
}

async function synthesizeWithGPT4(topic: string, analyses: { gpt4: string; gemini: string; claude: string }): Promise<string> {
  const prompt = `You are an expert technology research analyst. Your task is to synthesize insights from three different AI analyses of the technology topic "${topic}" into a cohesive, well-structured research report.

The analyses are from GPT-4, Gemini, and Claude. Your goal is to create a unified report that:
1. Eliminates redundancy
2. Resolves any contradictions
3. Maintains a consistent tone and style
4. Presents information in a clear, logical flow

Please structure your response as a markdown document with the following sections:

# Research Report: ${topic}

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
${analyses.gpt4}

Gemini Analysis:
${analyses.gemini}

Claude Analysis:
${analyses.claude}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
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
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Synthesis error:', error);
    throw new Error('Failed to synthesize report');
  }
}

export async function synthesizeReport({ topic, gpt4Analysis, geminiAnalysis, claudeAnalysis }: SynthesisInput): Promise<string> {
  try {
    const synthesizedReport = await synthesizeWithGPT4(topic, {
      gpt4: gpt4Analysis,
      gemini: geminiAnalysis,
      claude: claudeAnalysis,
    });

    // Add metadata and disclaimer
    const finalReport = `${synthesizedReport}

---
This report was generated using Super Tech Scout, combining insights from GPT-4, Gemini, and Claude AI models. The analysis represents a synthesis of current market data, technical specifications, and industry trends. While every effort has been made to ensure accuracy, organizations should conduct their own due diligence before making strategic decisions.

Generated on: ${new Date().toLocaleDateString()}`;

    return finalReport;
  } catch (error) {
    console.error('Report synthesis failed:', error);
    throw error;
  }
} 