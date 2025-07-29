-- Fix security definer functions by adding proper search_path
-- This prevents SQL injection attacks through search_path manipulation

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$function$;

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$function$;

-- Fix get_setting function
CREATE OR REPLACE FUNCTION public.get_setting(setting_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result TEXT;
BEGIN
  SELECT value INTO result 
  FROM public.settings 
  WHERE key = setting_key;
  
  RETURN result;
END;
$function$;

-- Fix upsert_setting function
CREATE OR REPLACE FUNCTION public.upsert_setting(setting_key text, setting_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.settings (key, value, updated_at)
  VALUES (setting_key, setting_value, now())
  ON CONFLICT (key) 
  DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = now();
END;
$function$;

-- Fix delete_setting function
CREATE OR REPLACE FUNCTION public.delete_setting(setting_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.settings WHERE key = setting_key;
END;
$function$;

-- Fix request_property_deletion function
CREATE OR REPLACE FUNCTION public.request_property_deletion(property_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Check if user owns this property request
  IF NOT EXISTS (
    SELECT 1 FROM public.property_requests 
    WHERE id = property_request_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You can only request deletion of your own properties';
  END IF;

  -- Update the status to deletion_requested
  UPDATE public.property_requests 
  SET status = 'deletion_requested', updated_at = now()
  WHERE id = property_request_id AND user_id = auth.uid();
END;
$function$;

-- Fix approve_property_deletion function
CREATE OR REPLACE FUNCTION public.approve_property_deletion(property_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  request_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve property deletions';
  END IF;

  -- Get the request details
  SELECT * INTO request_record FROM public.property_requests 
  WHERE id = property_request_id AND status = 'deletion_requested';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deletion request not found or not in deletion_requested status';
  END IF;

  -- Delete the approved property from properties table if it exists
  DELETE FROM public.properties WHERE owner_id = request_record.user_id 
  AND title = request_record.title AND price = request_record.price;

  -- Delete the property request
  DELETE FROM public.property_requests WHERE id = property_request_id;
END;
$function$;

-- Fix auto_approve_admin_properties function
CREATE OR REPLACE FUNCTION public.auto_approve_admin_properties()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Check if the owner is an admin
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.owner_id AND role = 'admin') THEN
    NEW.is_approved = true;
  END IF;
  RETURN NEW;
END;
$function$;