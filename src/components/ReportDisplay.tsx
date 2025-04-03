import React, { useState } from 'react';
import PDFViewer from './PDFViewer';

interface ReportDisplayProps {
  report: string;
  onDownload: () => void;
  isSynthesisComplete: boolean;
}

export default function ReportDisplay({ report, onDownload, isSynthesisComplete }: ReportDisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: report }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'research-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Reset state after successful download
      setTimeout(() => {
        setIsGenerating(false);
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {pdfUrl ? (
        <PDFViewer
          pdfUrl={pdfUrl}
          onDownload={handleDownload}
          isGenerating={isGenerating}
        />
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={handleDownload}
            disabled={isGenerating || !isSynthesisComplete}
            className={`px-8 py-4 rounded-lg font-medium transition-all duration-200 text-lg ${
              isGenerating || !isSynthesisComplete
                ? 'bg-blue-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Research Report</span>
              </div>
            ) : (
              'Download Research Report'
            )}
          </button>

          {error && (
            <div className="text-red-400 text-sm">
              Error: {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 