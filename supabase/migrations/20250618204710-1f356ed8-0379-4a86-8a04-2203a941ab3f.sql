
-- Add images and videos columns to property_requests table
ALTER TABLE public.property_requests 
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS videos TEXT[];

-- Add delete capability by ensuring we can track property ownership
-- (This should already exist, but let's make sure the structure supports deletion)
