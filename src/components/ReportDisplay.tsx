import React from 'react';

interface ReportDisplayProps {
  report: string;
  onDownload: () => void;
}

export default function ReportDisplay({ report, onDownload }: ReportDisplayProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Research Report
          </h2>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
          >
            Download PDF
          </button>
        </div>
        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-gray-300">{report}</div>
        </div>
      </div>
    </div>
  );
} 