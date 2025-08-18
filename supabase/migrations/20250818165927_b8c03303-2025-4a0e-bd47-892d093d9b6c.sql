-- Create trigger to auto-approve properties created by admins
CREATE TRIGGER trigger_auto_approve_admin_properties
  BEFORE INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_admin_properties();