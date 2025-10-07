
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
    <div className={`bg-gradient-to-br from-background to-muted/20 border border-border rounded-xl p-6 my-8 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <FileText className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title || 'PDF Document'}</h3>
            <p className="text-sm text-muted-foreground">View or download the document</p>
          </div>
        </div>
        <a 
          href={pdfUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-md"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="text-sm font-medium">Open in New Tab</span>
        </a>
      </div>
      
      <div className="w-full h-[600px] border-2 border-border rounded-lg bg-background shadow-inner overflow-hidden">
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
          width="100%"
          height="100%"
          className="rounded-lg"
          title={title || 'PDF Document'}
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
};

export default PDFViewer;
