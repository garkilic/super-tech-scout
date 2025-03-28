import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer';

interface ReportDisplayProps {
  report: string;
  onDownload: () => void;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  container: {
    maxWidth: 700,
    margin: '0 auto',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 24,
    color: '#000000',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 16,
    color: '#000000',
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 16,
    color: '#000000',
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTop: '1px solid #e5e7eb',
  },
});

export default function ReportDisplay({ report, onDownload }: ReportDisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create formatted content for PDF
  const formattedContent = report.split('\n').map(line => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) return null;
    
    // Handle main title
    if (trimmedLine.startsWith('RESEARCH REPORT:')) {
      return <Text style={styles.title}>{trimmedLine}</Text>;
    }
    
    // Handle section headers
    if (trimmedLine === 'INTRODUCTION' || 
        trimmedLine === 'CURRENT STATE AND TECHNICAL OVERVIEW' ||
        trimmedLine === 'MARKET LANDSCAPE AND INDUSTRY IMPACT' ||
        trimmedLine === 'FUTURE OUTLOOK AND DEVELOPMENTS' ||
        trimmedLine === 'SUMMARY AND RECOMMENDATIONS') {
      return <Text style={styles.sectionHeader}>{trimmedLine}</Text>;
    }
    
    // Handle footer
    if (trimmedLine.startsWith('---')) {
      return <View style={styles.footer} />;
    }
    
    // Handle regular content
    return <Text style={styles.paragraph}>{trimmedLine}</Text>;
  }).filter(Boolean);

  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {formattedContent}
        </View>
      </Page>
    </Document>
  );

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Generate PDF blob
      const blob = await pdf(<MyDocument />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'research-report.pdf';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onDownload();
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Research Report
          </h2>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg 
              ${isGenerating 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-blue-600 hover:to-purple-700'
              } 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 
              transition-all duration-200 flex items-center gap-2`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              'Download PDF'
            )}
          </button>
        </div>

        {/* Status messages */}
        <div className="prose prose-invert max-w-none">
          {error ? (
            <div className="text-red-400 bg-red-900/20 p-4 rounded-lg">
              {error}
            </div>
          ) : isGenerating ? (
            <div className="text-blue-400 bg-blue-900/20 p-4 rounded-lg">
              Generating your PDF report... This may take a few moments.
            </div>
          ) : (
            <div className="text-gray-400 italic">
              Click the "Download PDF" button to generate and download the report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 