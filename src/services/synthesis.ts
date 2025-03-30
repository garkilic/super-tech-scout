interface SynthesisInput {
  topic: string;
  gpt4Analysis: string;
  geminiAnalysis: string;
  claudeAnalysis: string;
}

function cleanText(text: string): string {
  // Remove markdown formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic
    .replace(/`(.*?)`/g, '$1')       // Remove code
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Remove links
    .replace(/^\s*[-*]\s*/, '')      // Remove bullet points
    .replace(/^\s*\d+\.\s*/, '')     // Remove numbered lists
    .replace(/\n{3,}/g, '\n\n')      // Normalize multiple newlines
    .trim();
}

function extractKeyPoints(analysis: string): string[] {
  // Split the analysis into sections and extract key points
  const sections = analysis.split('\n\n');
  const keyPoints: string[] = [];
  
  sections.forEach(section => {
    const lines = section.split('\n');
    lines.forEach(line => {
      const cleanedLine = cleanText(line);
      // Look for key statements (longer lines that aren't headers)
      if (cleanedLine.length > 50 && !cleanedLine.match(/^[A-Z\s:]+$/)) {
        keyPoints.push(cleanedLine);
      }
    });
  });
  
  return keyPoints;
}

function formatPlaintextReport(topic: string, gpt4Analysis: string, geminiAnalysis: string, claudeAnalysis: string): string {
  const gpt4Points = extractKeyPoints(gpt4Analysis);
  const geminiPoints = extractKeyPoints(geminiAnalysis);
  const claudePoints = extractKeyPoints(claudeAnalysis);
  
  // Combine and deduplicate key points
  const combinedPoints = Array.from(new Set([...gpt4Points, ...geminiPoints, ...claudePoints]));
  
  // Group points into logical sections
  const technicalPoints = combinedPoints.filter(point => 
    point.toLowerCase().includes('technical') || 
    point.toLowerCase().includes('implementation') || 
    point.toLowerCase().includes('architecture') ||
    point.toLowerCase().includes('algorithm') ||
    point.toLowerCase().includes('system') ||
    point.toLowerCase().includes('framework')
  );
  
  const marketPoints = combinedPoints.filter(point => 
    point.toLowerCase().includes('market') || 
    point.toLowerCase().includes('industry') || 
    point.toLowerCase().includes('adoption') ||
    point.toLowerCase().includes('investment') ||
    point.toLowerCase().includes('revenue') ||
    point.toLowerCase().includes('growth')
  );
  
  const futurePoints = combinedPoints.filter(point => 
    point.toLowerCase().includes('future') || 
    point.toLowerCase().includes('trend') || 
    point.toLowerCase().includes('development') ||
    point.toLowerCase().includes('innovation') ||
    point.toLowerCase().includes('potential') ||
    point.toLowerCase().includes('upcoming')
  );

  const securityPoints = combinedPoints.filter(point =>
    point.toLowerCase().includes('security') ||
    point.toLowerCase().includes('privacy') ||
    point.toLowerCase().includes('compliance') ||
    point.toLowerCase().includes('regulation') ||
    point.toLowerCase().includes('protection')
  );

  const integrationPoints = combinedPoints.filter(point =>
    point.toLowerCase().includes('integration') ||
    point.toLowerCase().includes('compatibility') ||
    point.toLowerCase().includes('interoperability') ||
    point.toLowerCase().includes('api') ||
    point.toLowerCase().includes('interface')
  );

  return `RESEARCH REPORT: ${topic.toUpperCase()}

EXECUTIVE SUMMARY
This comprehensive analysis of ${topic} provides an in-depth examination of the technology's current state, market position, and future potential. The report combines insights from multiple AI models to deliver a detailed understanding of the technology's technical capabilities, market dynamics, and strategic implications for organizations considering adoption or investment.

TABLE OF CONTENTS
1. Executive Summary
2. Technology Overview
3. Technical Analysis
4. Market Analysis
5. Security and Compliance
6. Integration and Implementation
7. Future Outlook
8. Strategic Recommendations
9. Risk Assessment
10. Conclusion

TECHNOLOGY OVERVIEW
${topic} represents a significant advancement in its field, offering unique capabilities and advantages. This section provides a detailed examination of the technology's core components, architecture, and fundamental principles.

Key Components:
${technicalPoints.slice(0, 5).map(point => point).join('\n')}

Architecture and Design:
${technicalPoints.slice(5, 10).map(point => point).join('\n')}

TECHNICAL ANALYSIS
This section delves into the technical aspects of ${topic}, including its implementation details, performance characteristics, and technical requirements.

Implementation Details:
${technicalPoints.slice(10, 15).map(point => point).join('\n')}

Performance Characteristics:
${technicalPoints.slice(15, 20).map(point => point).join('\n')}

MARKET ANALYSIS
The market landscape for ${topic} is dynamic and evolving. This section examines current market trends, key players, and adoption patterns.

Market Trends:
${marketPoints.slice(0, 5).map(point => point).join('\n')}

Industry Adoption:
${marketPoints.slice(5, 10).map(point => point).join('\n')}

Investment Landscape:
${marketPoints.slice(10, 15).map(point => point).join('\n')}

SECURITY AND COMPLIANCE
Security and compliance considerations are crucial for any technology adoption. This section addresses key security features, privacy concerns, and regulatory requirements.

Security Features:
${securityPoints.slice(0, 5).map(point => point).join('\n')}

Compliance Requirements:
${securityPoints.slice(5, 10).map(point => point).join('\n')}

Privacy Considerations:
${securityPoints.slice(10, 15).map(point => point).join('\n')}

INTEGRATION AND IMPLEMENTATION
This section explores the practical aspects of implementing ${topic}, including integration requirements, compatibility considerations, and deployment strategies.

Integration Requirements:
${integrationPoints.slice(0, 5).map(point => point).join('\n')}

Implementation Considerations:
${integrationPoints.slice(5, 10).map(point => point).join('\n')}

Deployment Strategies:
${integrationPoints.slice(10, 15).map(point => point).join('\n')}

FUTURE OUTLOOK
The future of ${topic} holds significant potential for innovation and growth. This section examines emerging trends, potential developments, and future possibilities.

Emerging Trends:
${futurePoints.slice(0, 5).map(point => point).join('\n')}

Potential Developments:
${futurePoints.slice(5, 10).map(point => point).join('\n')}

Innovation Opportunities:
${futurePoints.slice(10, 15).map(point => point).join('\n')}

STRATEGIC RECOMMENDATIONS
Based on the comprehensive analysis, this section provides strategic recommendations for organizations considering ${topic}.

Key Recommendations:
1. Evaluate technical requirements and capabilities
2. Assess market timing and competitive positioning
3. Consider security and compliance implications
4. Plan for integration and implementation
5. Monitor future developments and trends

RISK ASSESSMENT
This section identifies and analyzes potential risks associated with ${topic} adoption and implementation.

Technical Risks:
Integration complexity
Performance limitations
Scalability concerns
Maintenance requirements

Business Risks:
Market volatility
Competitive pressure
Investment requirements
ROI uncertainty

Security Risks:
Data protection
Compliance challenges
Privacy concerns
Regulatory changes

CONCLUSION
${topic} represents a significant technological advancement with the potential to transform industries and create new opportunities. Organizations should carefully evaluate the technical, market, and strategic implications before making adoption decisions.

Key Takeaways:
1. Technical capabilities and limitations
2. Market position and competitive advantages
3. Security and compliance considerations
4. Integration and implementation requirements
5. Future growth potential

---
This report was generated using Super Tech Scout, combining insights from GPT-4, Gemini, and Claude AI models. The analysis represents a synthesis of current market data, technical specifications, and industry trends. While every effort has been made to ensure accuracy, organizations should conduct their own due diligence before making strategic decisions.`;
}

export async function synthesizeReport({ topic, gpt4Analysis, geminiAnalysis, claudeAnalysis }: SynthesisInput): Promise<string> {
  return formatPlaintextReport(topic, gpt4Analysis, geminiAnalysis, claudeAnalysis);
} 