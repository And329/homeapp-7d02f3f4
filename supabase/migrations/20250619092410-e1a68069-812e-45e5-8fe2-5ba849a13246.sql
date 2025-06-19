
-- Add owner_id column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update existing properties to have a default owner (you can change this later)
-- For now, we'll leave them as NULL which means no specific owner
