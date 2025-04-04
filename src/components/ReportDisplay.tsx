import React, { useState, useEffect } from 'react';
import PDFViewer from './PDFViewer';

interface ReportDisplayProps {
  report: string;
  onDownload: () => void;
  isSynthesisComplete: boolean;
}

export default function ReportDisplay({ report, onDownload, isSynthesisComplete }: ReportDisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear error when new report is received
    if (report) {
      setError(null);
    }
  }, [report]);

  // Handle API errors
  useEffect(() => {
    const handleApiError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || event.message;
      if (errorMessage?.includes('502') || errorMessage?.includes('504')) {
        setError('Server timeout. Please try again with a shorter or less complex query.');
      } else if (errorMessage?.includes('Failed to analyze technology')) {
        setError('Analysis failed. Please try again with a different query or check your API configuration.');
      }
    };

    window.addEventListener('error', handleApiError);
    return () => window.removeEventListener('error', handleApiError);
  }, []);

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-red-400 font-medium">Error</h3>
          </div>
          <p className="text-red-300 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {report && (
        <PDFViewer
          title="Technology Research Report"
          content={report}
          topic="Research Report"
        />
      )}
    </div>
  );
} 