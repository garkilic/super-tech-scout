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
            content: `You are a technology research expert. Analyze the following technology topic and provide a comprehensive report including:
            1. Overview and current state
            2. Key applications and use cases
            3. Technical challenges and limitations
            4. Future potential and developments
            5. Market impact and industry adoption
            
            Format the response in clear sections with markdown headers.`
          },
          {
            role: 'user',
            content: `Please analyze the technology topic: ${topic}`
          }
        ],
        temperature: API_CONFIG.OPENAI_TEMPERATURE,
        max_tokens: API_CONFIG.OPENAI_MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
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