import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_CONFIG } from '../config/api';

interface GeminiResponse {
  content: string;
  error?: string;
}

export async function analyzeTechnology(topic: string): Promise<GeminiResponse> {
  try {
    const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: API_CONFIG.GEMINI_MODEL,
      generationConfig: {
        temperature: API_CONFIG.GEMINI_TEMPERATURE,
        maxOutputTokens: API_CONFIG.GEMINI_MAX_TOKENS,
      }
    });

    const prompt = `You are a technology trend analyst. Provide a high-level overview of "${topic}":

1. Quick Overview
- Basic concept
- Key benefits
- Main use cases

2. Current State
- Recent developments
- Industry adoption
- Notable implementations

3. Future Potential
- Growth opportunities
- Emerging trends
- Market predictions

Keep responses concise and focused on key insights.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No content in response');
    }

    return {
      content: text,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Failed to analyze technology',
    };
  }
} 