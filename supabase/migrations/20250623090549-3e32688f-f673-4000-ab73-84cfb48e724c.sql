
-- Add phone column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add videos column to properties table  
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS videos JSON;

-- Add area column to properties table (also missing)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS area INTEGER;

-- Add property_type column to properties table (also missing)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_type TEXT DEFAULT 'Apartment';

-- Add year_built column to properties table (also missing)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS year_built INTEGER;

-- Add parking column to properties table (also missing)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS parking INTEGER;
