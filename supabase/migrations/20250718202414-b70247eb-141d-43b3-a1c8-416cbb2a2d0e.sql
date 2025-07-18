-- Auto-approve properties created by admins
UPDATE public.properties 
SET is_approved = true 
WHERE owner_id IN (SELECT id FROM profiles WHERE role = 'admin') 
  AND is_approved = false;

-- Create a trigger to auto-approve admin-created properties
CREATE OR REPLACE FUNCTION public.auto_approve_admin_properties()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the owner is an admin
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.owner_id AND role = 'admin') THEN
    NEW.is_approved = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-approval
DROP TRIGGER IF EXISTS auto_approve_admin_properties_trigger ON public.properties;
CREATE TRIGGER auto_approve_admin_properties_trigger
  BEFORE INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_admin_properties();