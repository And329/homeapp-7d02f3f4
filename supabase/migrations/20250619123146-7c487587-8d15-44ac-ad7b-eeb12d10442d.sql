
-- First, let's check what RLS policies exist on the properties table
-- and create proper ones to allow viewing approved properties

-- Drop any existing restrictive policies that might be blocking property visibility
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can only see approved properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can view approved properties" ON public.properties;

-- Create a policy that allows everyone to view approved properties
CREATE POLICY "Anyone can view approved properties" 
  ON public.properties 
  FOR SELECT 
  USING (is_approved = true);

-- Allow property owners to view their own properties (approved or not)
CREATE POLICY "Users can view their own properties" 
  ON public.properties 
  FOR SELECT 
  USING (auth.uid() = owner_id);

-- Allow admins to view all properties
CREATE POLICY "Admins can view all properties" 
  ON public.properties 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Allow authenticated users to insert properties (they will need approval)
CREATE POLICY "Authenticated users can create properties" 
  ON public.properties 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id AND is_approved = false);

-- Allow users to update their own properties (if not yet approved)
CREATE POLICY "Users can update their own unapproved properties" 
  ON public.properties 
  FOR UPDATE 
  USING (auth.uid() = owner_id AND is_approved = false);

-- Allow admins to update any property
CREATE POLICY "Admins can update any property" 
  ON public.properties 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Allow users to delete their own unapproved properties
CREATE POLICY "Users can delete their own unapproved properties" 
  ON public.properties 
  FOR DELETE 
  USING (auth.uid() = owner_id AND is_approved = false);

-- Allow admins to delete any property
CREATE POLICY "Admins can delete any property" 
  ON public.properties 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));
