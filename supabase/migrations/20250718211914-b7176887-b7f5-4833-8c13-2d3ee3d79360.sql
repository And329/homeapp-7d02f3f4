-- Add policy to allow admins to create properties for any user
CREATE POLICY "Admins can create properties for any user" 
  ON public.properties 
  FOR INSERT 
  WITH CHECK (get_current_user_role() = 'admin');