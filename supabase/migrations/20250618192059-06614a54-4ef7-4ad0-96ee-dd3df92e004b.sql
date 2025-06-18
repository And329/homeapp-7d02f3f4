
-- Add latitude and longitude columns to the properties table
ALTER TABLE public.properties 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;
