import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../../config/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.topic || typeof body.topic !== 'string' || body.topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Check if API key is available
    if (!API_CONFIG.CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API key is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_CONFIG.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `You are an expert technology research analyst with deep expertise in technical architecture, implementation, and industry trends. Please provide a comprehensive, in-depth analysis of the technology topic "${body.topic}". Your analysis should be thorough and detailed, covering the following aspects:

1. Technical Architecture and Components
   - Core components and their interactions
   - System architecture and design patterns
   - Data flow and processing
   - Scalability considerations
   - Integration points and APIs

2. Implementation Details
   - Development frameworks and tools
   - Programming languages and paradigms
   - Deployment strategies
   - Configuration and setup requirements
   - Best practices and patterns

3. Performance and Scalability
   - Performance characteristics and benchmarks
   - Scalability approaches and limitations
   - Resource requirements and optimization
   - Caching and data management
   - Load balancing and distribution

4. Security Considerations
   - Security architecture and design
   - Authentication and authorization
   - Data protection and encryption
   - Common vulnerabilities and mitigations
   - Compliance and regulatory requirements

5. Integration Patterns
   - Integration approaches and patterns
   - API design and versioning
   - Data exchange formats and protocols
   - Service discovery and orchestration
   - Error handling and recovery

6. Industry Landscape
   - Current market position and adoption
   - Competing technologies and alternatives
   - Industry trends and future outlook
   - Use cases and success stories
   - Challenges and limitations

7. Implementation Recommendations
   - Best practices for adoption
   - Migration strategies
   - Resource planning and estimation
   - Risk assessment and mitigation
   - Success criteria and metrics

Format your response in clear, well-structured markdown with appropriate headings, bullet points, and code examples where relevant. Provide specific examples, case studies, and technical details to support your analysis.`
        }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Claude API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ content: data.content[0].text });
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 