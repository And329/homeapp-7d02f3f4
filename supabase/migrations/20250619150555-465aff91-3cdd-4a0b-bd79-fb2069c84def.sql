
-- Add emirate column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS emirate TEXT;

-- Add emirate column to property_requests table  
ALTER TABLE public.property_requests 
ADD COLUMN IF NOT EXISTS emirate TEXT;
