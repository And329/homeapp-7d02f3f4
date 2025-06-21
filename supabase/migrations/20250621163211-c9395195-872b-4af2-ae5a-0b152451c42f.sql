
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate the policies with correct names
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Use the security definer function for admin policies to avoid recursion
CREATE POLICY "Admins can view all profiles new" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles new" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');
