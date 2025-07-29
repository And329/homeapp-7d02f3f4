import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

// Phone validation schema
export const phoneSchema = z.string()
  .min(1, 'Phone number is required')
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number');

// Name validation schema
export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'Name must contain only letters and spaces');

// Message validation schema
export const messageSchema = z.string()
  .min(10, 'Message must be at least 10 characters')
  .max(2000, 'Message must be less than 2000 characters');

// Title validation schema
export const titleSchema = z.string()
  .min(1, 'Title is required')
  .max(200, 'Title must be less than 200 characters');

// Content validation schema
export const contentSchema = z.string()
  .min(1, 'Content is required')
  .max(50000, 'Content must be less than 50,000 characters');

// URL validation schema
export const urlSchema = z.string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

// Price validation schema
export const priceSchema = z.number()
  .min(0, 'Price must be positive')
  .max(999999999, 'Price is too high');

// Contact form validation schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  inquiry_type: z.string().min(1, 'Please select an inquiry type'),
  message: messageSchema,
});

// Blog post validation schema
export const blogPostSchema = z.object({
  title: titleSchema,
  content: contentSchema,
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  featured_image: urlSchema,
  tags: z.array(z.string()).optional(),
  meta_description: z.string().max(160, 'Meta description must be less than 160 characters').optional(),
  status: z.enum(['draft', 'published']),
});

// Property validation schema
export const propertySchema = z.object({
  title: titleSchema,
  description: contentSchema,
  price: priceSchema,
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  type: z.enum(['for_sale', 'for_rent']),
  property_type: z.string().min(1, 'Property type is required'),
  emirate: z.string().min(1, 'Emirate is required'),
  area: z.string().min(1, 'Area is required'),
  year_built: z.number().min(1800).max(new Date().getFullYear() + 5).optional(),
  parking: z.number().min(0).max(50).optional(),
  contact_name: nameSchema,
  contact_email: emailSchema,
  contact_phone: phoneSchema,
  location: z.string().min(1, 'Location is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  amenities: z.array(z.string()).optional(),
});

// File upload validation
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// Image file validation
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSizeMB = 10;

  if (!validateFileType(file, allowedTypes)) {
    return { isValid: false, error: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)' };
  }

  if (!validateFileSize(file, maxSizeMB)) {
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { isValid: true };
};

// Document file validation
export const validateDocumentFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSizeMB = 25;

  if (!validateFileType(file, allowedTypes)) {
    return { isValid: false, error: 'Please upload a valid document file (PDF, DOC, or DOCX)' };
  }

  if (!validateFileSize(file, maxSizeMB)) {
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { isValid: true };
};

// XSS prevention for user input
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/data:(?!image\/)/gi, '')
    .trim();
};