import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReportDisplayProps {
  report: string;
  onDownload: () => void;
}

export default function ReportDisplay({ report, onDownload }: ReportDisplayProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!reportRef.current) {
      setError('PDF generation failed: Target element is null');
      return;
    }

    // Reset states
    setError(null);
    setIsGenerating(true);

    try {
      // Temporarily make the element visible for PDF generation
      reportRef.current.style.display = 'block';
      
      // Create canvas from HTML
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add first page
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save('research-report.pdf');
      
      // Hide the element again after PDF generation
      reportRef.current.style.display = 'none';
      
      onDownload();
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
      // Ensure element is hidden even if there's an error
      if (reportRef.current) {
        reportRef.current.style.display = 'none';
      }
      setIsGenerating(false);
    }
  };

  // Create formatted HTML content for PDF
  const formattedContent = report.split('\n').map(line => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) return '';
    
    // Handle main title
    if (trimmedLine.startsWith('RESEARCH REPORT:')) {
      return `<h1 class="text-3xl font-bold mb-6">${trimmedLine}</h1>`;
    }
    
    // Handle section headers
    if (trimmedLine === 'INTRODUCTION' || 
        trimmedLine === 'CURRENT STATE AND TECHNICAL OVERVIEW' ||
        trimmedLine === 'MARKET LANDSCAPE AND INDUSTRY IMPACT' ||
        trimmedLine === 'FUTURE OUTLOOK AND DEVELOPMENTS' ||
        trimmedLine === 'SUMMARY AND RECOMMENDATIONS') {
      return `<h2 class="text-2xl font-semibold mb-4">${trimmedLine}</h2>`;
    }
    
    // Handle footer
    if (trimmedLine.startsWith('---')) {
      return `<div class="mt-8 pt-4 border-t border-gray-300">`;
    }
    
    // Handle regular content
    return `<p class="mb-4 leading-relaxed">${trimmedLine}</p>`;
  }).join('');

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
        
        {/* Hidden div for PDF generation */}
        <div ref={reportRef} style={{ display: 'none' }}>
          <div className="p-8 bg-white text-black">
            <div className="max-w-3xl mx-auto">
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
          </div>
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