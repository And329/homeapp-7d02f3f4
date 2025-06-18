
-- Create a security definer function to safely get the current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;

-- Create new policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR ALL 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all properties" 
  ON public.properties 
  FOR ALL 
  USING (public.get_current_user_role() = 'admin');
