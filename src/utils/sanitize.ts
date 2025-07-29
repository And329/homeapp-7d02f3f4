import DOMPurify from 'dompurify';

// Configure DOMPurify for safe HTML sanitization
const createSanitizer = () => {
  // Allow common formatting tags but remove scripts and other dangerous elements
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'span', 'div'
  ];
  
  const allowedAttributes = {
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'id']
  };

  return DOMPurify.sanitize.bind(DOMPurify);
};

const sanitize = createSanitizer();

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Sanitize the HTML content
  return sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'src', 'alt', 'width', 'height', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'],
  });
};

export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Convert newlines to <br> tags and sanitize
  const htmlWithBreaks = text.replace(/\n/g, '<br />');
  return sanitizeHtml(htmlWithBreaks);
};