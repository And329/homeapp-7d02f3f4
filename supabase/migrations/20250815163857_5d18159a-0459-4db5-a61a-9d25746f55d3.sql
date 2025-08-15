-- Add is_archived column to properties table
ALTER TABLE public.properties 
ADD COLUMN is_archived boolean NOT NULL DEFAULT false;

-- Create index for better performance when filtering archived properties
CREATE INDEX idx_properties_is_archived ON public.properties(is_archived);

-- Create index for combined filtering (approved and not archived)
CREATE INDEX idx_properties_approved_archived ON public.properties(is_approved, is_archived);