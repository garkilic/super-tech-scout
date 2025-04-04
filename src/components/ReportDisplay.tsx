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

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {report && (
        <PDFViewer
          title="Technology Research Report"
          content={report}
          topic="Research Report"
        />
      )}

      {error && (
        <div className="text-red-400 text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
} 