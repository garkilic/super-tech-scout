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

interface SynthesisResponse {
  content?: string;
  error?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function synthesizeWithGPT4(input: SynthesisInput): Promise<SynthesisResponse> {
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      const response = await fetch('/api/synthesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY * Math.pow(2, retryCount);
        
        // Dispatch retry event
        window.dispatchEvent(new CustomEvent('retryStatus', {
          detail: {
            stepId: 'synthesis',
            retryCount: retryCount + 1,
            status: 'retrying',
            delay
          }
        }));

        await sleep(delay);
        retryCount++;
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Failed to synthesize report' };
      }

      const data = await response.json();
      return { content: data.content };
    } catch (error) {
      // Dispatch retry event for other errors
      window.dispatchEvent(new CustomEvent('retryStatus', {
        detail: {
          stepId: 'synthesis',
          retryCount: retryCount + 1,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));

      if (retryCount < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY * Math.pow(2, retryCount));
        retryCount++;
        continue;
      }
      
      return { error: error instanceof Error ? error.message : 'Failed to synthesize report' };
    }
  }

  return { error: 'Maximum retry attempts reached' };
}

export async function synthesizeReport({ topic, gpt4Analysis, geminiAnalysis, claudeAnalysis }: SynthesisInput): Promise<string> {
  try {
    const synthesizedReport = await synthesizeWithGPT4({
      topic,
      gpt4Analysis,
      geminiAnalysis,
      claudeAnalysis,
    });

    if (synthesizedReport.error) {
      throw new Error(synthesizedReport.error);
    }

    if (!synthesizedReport.content) {
      throw new Error('No content in response');
    }

    // Add metadata and disclaimer
    const finalReport = `${synthesizedReport.content}

---
This report was generated using Super Tech Scout, combining insights from GPT-4, Gemini, and Claude AI models. The analysis represents a synthesis of current market data, technical specifications, and industry trends. While every effort has been made to ensure accuracy, organizations should conduct their own due diligence before making strategic decisions.

Generated on: ${new Date().toLocaleDateString()}`;

    return finalReport;
  } catch (error) {
    console.error('Synthesis error:', error);
    throw error;
  }
} 