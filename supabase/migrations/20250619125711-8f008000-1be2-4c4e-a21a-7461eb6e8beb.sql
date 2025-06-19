
-- Add the missing area column to property_requests table
ALTER TABLE public.property_requests 
ADD COLUMN area INTEGER;
