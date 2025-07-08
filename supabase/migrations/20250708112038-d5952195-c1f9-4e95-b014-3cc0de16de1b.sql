-- Add policy to allow users to view contact info of property owners
CREATE POLICY "Users can view property owner contact info"
ON public.profiles
FOR SELECT
USING (
  -- Allow viewing contact info if this user owns a property
  id IN (
    SELECT DISTINCT owner_id 
    FROM public.properties 
    WHERE is_approved = true 
    AND owner_id IS NOT NULL
  )
);