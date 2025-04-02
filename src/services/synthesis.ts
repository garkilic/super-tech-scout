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

The analyses come from different perspectives:
1. GPT-4 Analysis (Comprehensive Overview):
${analyses.gpt4}

2. Claude Analysis (Technical Deep Dive):
${analyses.claude}

3. Gemini Analysis (Market Trends):
${analyses.gemini}

Please create a comprehensive research report that:
1. Integrates the unique strengths of each analysis
2. Maintains a clear structure with markdown headers
3. Highlights technical details from Claude
4. Incorporates market trends from Gemini
5. Uses GPT-4's comprehensive overview as the foundation

Format the report with the following sections:
1. Executive Summary
2. Technical Analysis
3. Market Analysis
4. Future Outlook
5. Recommendations

Use bullet points for key insights and include specific examples where relevant.`;

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.statusText}${errorData.error ? ` - ${errorData.error.message}` : ''}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No content in response');
    }

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