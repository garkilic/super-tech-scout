import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_CONFIG } from '../config/api';

interface GeminiResponse {
  content: string;
  error?: string;
}

export async function analyzeTechnology(topic: string): Promise<GeminiResponse> {
  try {
    const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: API_CONFIG.GEMINI_MODEL });

    const prompt = `You are a technology research expert. Analyze the following technology topic and provide a comprehensive report including:
    1. Overview and current state
    2. Key applications and use cases
    3. Technical challenges and limitations
    4. Future potential and developments
    5. Market impact and industry adoption
    
    Format the response in clear sections with markdown headers.
    
    Please analyze the technology topic: ${topic}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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