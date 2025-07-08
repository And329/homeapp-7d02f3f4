-- Fix infinite recursion in properties table policies
-- Drop conflicting policies and keep only the essential ones

-- Drop duplicate policies that are causing recursion
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;

-- Keep the working policies
-- "Anyone can view approved properties" should remain
-- "Users can view their own properties" (the other one) should remain  
-- "Admins can view all properties" should remain
-- "Users can update their own unapproved properties" should remain
-- "Authenticated users can create properties" should remain
-- "Users can delete their own unapproved properties" should remain
-- "Admins can update any property" should remain
-- "Admins can delete any property" should remain