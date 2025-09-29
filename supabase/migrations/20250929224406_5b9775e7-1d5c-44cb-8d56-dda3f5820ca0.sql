-- Create a simple trigger function to log property requests
-- Note: For webhook integration, use Supabase Database Webhooks UI instead
-- This creates a notification that admins should configure webhooks manually

CREATE OR REPLACE FUNCTION public.log_new_property_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Simply log that a new request was created
  -- Admins need to configure Database Webhooks in Supabase Dashboard:
  -- 1. Go to Database > Webhooks
  -- 2. Create new webhook for property_requests table
  -- 3. Set event to INSERT
  -- 4. Set URL to: https://jwrzpawuvdqjintyhzkm.supabase.co/functions/v1/notify-telegram
  -- 5. Add Authorization header with service role key
  
  RAISE NOTICE 'New property request created: %', NEW.id;
  
  RETURN NEW;
END;
$function$;

-- Create trigger on property_requests table
DROP TRIGGER IF EXISTS log_property_request_created ON public.property_requests;

CREATE TRIGGER log_property_request_created
  AFTER INSERT ON public.property_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_new_property_request();