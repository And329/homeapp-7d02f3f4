
-- Add pdf_attachment column to admin_blog_posts table
ALTER TABLE public.admin_blog_posts 
ADD COLUMN pdf_attachment text;

-- Also add to blog_posts table for consistency
ALTER TABLE public.blog_posts 
ADD COLUMN pdf_attachment text;
