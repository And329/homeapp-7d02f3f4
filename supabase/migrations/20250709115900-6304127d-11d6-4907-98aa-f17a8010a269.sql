-- Fix infinite recursion by using security definer function for admin checks
-- Drop admin policies that directly query profiles table
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update any property" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete any property" ON public.properties;

-- Recreate admin policies using the security definer function to avoid recursion
CREATE POLICY "Admins can view all properties" 
  ON public.properties 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update any property" 
  ON public.properties 
  FOR UPDATE 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete any property" 
  ON public.properties 
  FOR DELETE 
  USING (get_current_user_role() = 'admin');