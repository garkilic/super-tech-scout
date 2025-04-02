import { API_CONFIG } from '../config/api';

interface ChatGPTResponse {
  content: string;
  error?: string;
}

export async function analyzeTechnology(topic: string): Promise<ChatGPTResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: API_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert technology research analyst specializing in comprehensive technology analysis. Your task is to analyze "${topic}" with a focus on:

1. Executive Summary
- Core technology overview
- Key differentiators
- Current market position

2. Technical Analysis
- Architecture and components
- Key features and capabilities
- Technical requirements

3. Market Analysis
- Industry adoption
- Competitive landscape
- Market trends

4. Future Outlook
- Emerging developments
- Potential challenges
- Growth opportunities

Format your response in clear sections with markdown headers. Use bullet points for key points and include specific examples where relevant.`
          }
        ],
        temperature: API_CONFIG.OPENAI_TEMPERATURE,
        max_tokens: API_CONFIG.OPENAI_MAX_TOKENS,
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

    return {
      content: data.choices[0].message.content,
    };
  } catch (error) {
    console.error('ChatGPT API error:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Failed to analyze technology',
    };
  }
} 