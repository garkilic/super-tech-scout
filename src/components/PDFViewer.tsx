import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

interface PDFViewerProps {
  pdfUrl: string;
  onDownload: () => void;
  isGenerating: boolean;
}

export default function PDFViewer({ pdfUrl, onDownload, isGenerating }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load PDF.js worker
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const handleDownload = async () => {
    try {
      setError(null);
      onDownload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-full bg-gray-800 rounded-lg shadow-lg p-4">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => setError(error.message)}
            loading={
              <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="mx-auto"
            />
          </Document>
          
          {numPages && (
            <div className="flex items-center justify-center mt-4 space-x-4">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
                className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-white">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages}
                className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className={`px-8 py-4 rounded-lg font-medium transition-all duration-200 text-lg ${
            isGenerating
              ? 'bg-blue-600 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating PDF</span>
            </div>
          ) : (
            'Download PDF'
          )}
        </button>

        {error && (
          <div className="text-red-400 text-sm">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
} 