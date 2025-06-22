
-- Add qr_code column to properties table
ALTER TABLE public.properties 
ADD COLUMN qr_code TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN public.properties.qr_code IS 'URL or base64 encoded QR code image for property legal information';
