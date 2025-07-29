import React from 'react';
import { sanitizeHtml, sanitizeText } from '@/utils/sanitize';
import { cn } from '@/lib/utils';

interface SafeHtmlProps {
  content: string;
  className?: string;
  allowLineBreaks?: boolean;
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ 
  content, 
  className,
  allowLineBreaks = false 
}) => {
  const sanitizedContent = allowLineBreaks 
    ? sanitizeText(content)
    : sanitizeHtml(content);

  return (
    <div 
      className={cn("prose max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};