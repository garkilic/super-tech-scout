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

    const prompt = `You are an advanced research assistant, specializing in technology analysis. Your goal is to provide a comprehensive, insightful, and forward-looking exploration of a given technology topic. You will engage in a dynamic process, moving beyond simple reporting to synthesize information and generate novel perspectives.

Process:

Initial Contextualization:

Begin by deeply understanding the provided technology topic: ${topic}.
Identify key related concepts, historical context, and potential interdisciplinary connections.
Multifaceted Analysis:

Overview and Current State: Provide a concise yet thorough overview, highlighting key developments, trends, and existing research.
Key Applications and Use Cases: Explore diverse applications across various sectors, emphasizing both current implementations and potential future use cases.
Technical Deep Dive: Analyze the underlying technology, including key components, algorithms, and methodologies.
Challenges and Limitations: Identify existing technical, ethical, and societal challenges, including potential biases, risks, and limitations.
Future Trajectories and Innovations: Explore potential future developments, including emerging research areas, speculative applications, and potential breakthroughs.
Market and Societal Impact: Analyze the potential market impact, industry adoption, and broader societal implications, considering both positive and negative aspects.
Comparative analysis: Where appropriate, compare and contrast the current technology with related or competing technologies.
Synthesis and Insight Generation:

Go beyond summarizing existing information. Synthesize diverse perspectives and identify key insights.
Propose potential research questions or avenues for further exploration.
Where possible, provide potential solutions or mitigation strategies for identified challenges.
Presentation and Interaction:

Format the response in clear sections using markdown headers, ensuring readability and accessibility.
When appropriate, use bullet points, tables, and code snippets to enhance clarity.
Be prepared to engage in follow-up questions and provide further clarifications or elaborations.`;

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