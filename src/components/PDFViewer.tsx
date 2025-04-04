import React from 'react';
import { BlobProvider } from '@react-pdf/renderer';
import PDFDocument from './PDFDocument';

interface PDFViewerProps {
  title: string;
  content: string;
  topic: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ title, content, topic }) => {
  return (
    <div className="mt-8 flex justify-center">
      <BlobProvider document={<PDFDocument title={title} content={content} topic={topic} />}>
        {({ url, loading }) => (
          <a
            href={url || '#'}
            download={`${topic.replace(/\s+/g, '-').toLowerCase()}-research-report.pdf`}
            className={`px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            style={{ textDecoration: 'none' }}
          >
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Preparing PDF</span>
              </div>
            ) : (
              'Download Research Report'
            )}
          </a>
        )}
      </BlobProvider>
    </div>
  );
};

export default PDFViewer; 