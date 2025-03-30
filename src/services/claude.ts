import { API_CONFIG } from '../config/api';

interface ClaudeResponse {
  content: string;
  error?: string;
}

export async function analyzeTechnology(topic: string): Promise<ClaudeResponse> {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze technology');
    }

    const data = await response.json();
    
    if (!data.content) {
      throw new Error('No content in response');
    }

    return {
      content: data.content,
    };
  } catch (error) {
    console.error('Claude API error:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Failed to analyze technology',
    };
  }
} 