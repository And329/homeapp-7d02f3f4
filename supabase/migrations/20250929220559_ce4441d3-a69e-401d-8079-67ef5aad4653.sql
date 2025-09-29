-- Add QR code and floor plans to landing pages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS qr_code text,
ADD COLUMN IF NOT EXISTS floor_plans jsonb DEFAULT '[]'::jsonb;