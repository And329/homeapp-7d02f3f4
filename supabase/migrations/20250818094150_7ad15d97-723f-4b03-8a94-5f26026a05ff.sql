-- SECURITY FIX 1: Prevent privilege escalation - create role protection trigger
-- First, create a trigger function to prevent unauthorized role changes
CREATE OR REPLACE FUNCTION public.protect_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If role is being changed and user is not admin, prevent the change
  IF OLD.role != NEW.role THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
      -- Revert role change
      NEW.role := OLD.role;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to protect role changes
DROP TRIGGER IF EXISTS protect_role_changes_trigger ON public.profiles;
CREATE TRIGGER protect_role_changes_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_role_changes();

-- SECURITY FIX 2: Make chat-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'chat-attachments';

-- SECURITY FIX 3: Restrict settings table to admin-only writes
DROP POLICY IF EXISTS "Authenticated users can modify settings" ON public.settings;

-- Only admins can modify settings
CREATE POLICY "Only admins can modify settings" 
ON public.settings 
FOR INSERT, UPDATE, DELETE
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SECURITY FIX 4: Fix function search path security
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_setting(setting_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT value INTO result 
  FROM public.settings 
  WHERE key = setting_key;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_setting(setting_key text, setting_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.settings (key, value, updated_at)
  VALUES (setting_key, setting_value, now())
  ON CONFLICT (key) 
  DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_setting(setting_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.settings WHERE key = setting_key;
END;
$$;