-- SECURITY FIX 1: Prevent privilege escalation - users cannot change their own role
-- Drop the existing policies that allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new policy that allows users to update their profile EXCEPT the role field
-- We'll use a different approach since OLD/NEW is only available in triggers
CREATE POLICY "Users can update own profile except role" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Only admins can change roles
  (
    CASE 
      WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') 
      THEN true 
      ELSE role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    END
  )
);

-- SECURITY FIX 2: Make chat-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'chat-attachments';

-- Create proper RLS policies for chat-attachments bucket
DROP POLICY IF EXISTS "Users can upload chat attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view chat attachments" ON storage.objects;

-- Policy for uploading chat attachments - only authenticated users in their own folder
CREATE POLICY "Users can upload chat attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for viewing chat attachments - only if user is participant in related conversation
CREATE POLICY "Users can view their chat attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-attachments' AND 
  (
    -- User can access their own uploads
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- User can access attachments from conversations they participate in
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.messages m ON m.conversation_id = c.id
      WHERE (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
        AND m.file_url LIKE '%' || name || '%'
    )
  )
);

-- Policy for updating chat attachments - only own files
CREATE POLICY "Users can update their chat attachments" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'chat-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for deleting chat attachments - only own files
CREATE POLICY "Users can delete their chat attachments" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- SECURITY FIX 3: Restrict settings table to admin-only writes
DROP POLICY IF EXISTS "Authenticated users can modify settings" ON public.settings;

-- Only admins can modify settings
CREATE POLICY "Only admins can modify settings" 
ON public.settings 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SECURITY FIX 4: Fix function search path security
-- Update get_current_user_role function to have immutable search path
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

-- Update other functions to have secure search paths
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

-- Fix other functions with search path issues
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