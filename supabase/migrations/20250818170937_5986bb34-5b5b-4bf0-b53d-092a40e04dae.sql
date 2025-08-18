-- Update existing properties created by admins to be approved
UPDATE public.properties 
SET is_approved = true 
WHERE owner_id IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
) AND is_approved = false;