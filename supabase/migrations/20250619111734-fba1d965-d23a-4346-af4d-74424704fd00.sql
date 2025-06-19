
-- Add approval status and creator tracking to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update existing properties to be approved (for backward compatibility)
UPDATE public.properties SET is_approved = true WHERE is_approved IS NULL OR is_approved = false;

-- Create index for better performance on approval status queries
CREATE INDEX IF NOT EXISTS idx_properties_is_approved ON public.properties(is_approved);
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON public.properties(created_by);
