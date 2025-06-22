
-- Add qr_code column to property_requests table
ALTER TABLE public.property_requests 
ADD COLUMN qr_code TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN public.property_requests.qr_code IS 'URL or base64 encoded QR code image for property legal information';
