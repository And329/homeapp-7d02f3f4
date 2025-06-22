
-- Add submitter_type column to property_requests table
ALTER TABLE public.property_requests 
ADD COLUMN IF NOT EXISTS submitter_type TEXT DEFAULT 'owner' CHECK (submitter_type IN ('owner', 'broker', 'referral'));

-- Update existing records to have the default value
UPDATE public.property_requests 
SET submitter_type = 'owner' 
WHERE submitter_type IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE public.property_requests 
ALTER COLUMN submitter_type SET NOT NULL;
