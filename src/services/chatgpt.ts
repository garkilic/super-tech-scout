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
Instructions:
- Use clear section headings.
- Be factual and concise.
- Use bullet points or short paragraphs for clarity.
- Avoid speculation not grounded in current data or observable trends.`
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