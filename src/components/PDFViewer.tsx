
import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title, className = "" }) => {
  if (!pdfUrl) return null;

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-5 w-5 text-red-600" />
        <span className="font-medium text-gray-900">{title || 'PDF Document'}</span>
        <a 
          href={pdfUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-auto text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="text-sm">Open in new tab</span>
        </a>
      </div>
      
      <div className="w-full h-96 border border-gray-300 rounded">
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          width="100%"
          height="100%"
          className="rounded"
          title={title || 'PDF Document'}
        />
      </div>
    </div>
  );
};

export default PDFViewer;
