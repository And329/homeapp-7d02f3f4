
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete any property" ON public.properties;
DROP POLICY IF EXISTS "Admins can update any property" ON public.properties;
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;

-- Add the missing status value to the property_requests table check constraint
ALTER TABLE public.property_requests DROP CONSTRAINT IF EXISTS property_requests_status_check;
ALTER TABLE public.property_requests ADD CONSTRAINT property_requests_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'deletion_requested'));

-- Enable RLS on properties table
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all properties
CREATE POLICY "Admins can view all properties" 
  ON public.properties 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Allow admins to delete any property
CREATE POLICY "Admins can delete any property" 
  ON public.properties 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Allow admins to update any property
CREATE POLICY "Admins can update any property" 
  ON public.properties 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Allow property owners to view their own properties
CREATE POLICY "Users can view their own properties" 
  ON public.properties 
  FOR SELECT 
  USING (auth.uid() = owner_id);

-- Allow property owners to update their own properties
CREATE POLICY "Users can update their own properties" 
  ON public.properties 
  FOR UPDATE 
  USING (auth.uid() = owner_id);
