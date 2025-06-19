
-- Update existing properties to have a default owner_id
-- We'll set all existing properties to be owned by the first admin user
-- You can change this later to assign specific owners

UPDATE public.properties 
SET owner_id = (
  SELECT id FROM public.profiles 
  WHERE role = 'admin' 
  LIMIT 1
)
WHERE owner_id IS NULL;

-- If no admin exists, we'll create a default admin user profile
-- (This is just a fallback - you may want to assign real owners)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  gen_random_uuid(),
  'admin@example.com',
  'Default Admin',
  'admin'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin')
AND EXISTS (SELECT 1 FROM public.properties WHERE owner_id IS NULL);

-- Update properties with the newly created admin if needed
UPDATE public.properties 
SET owner_id = (
  SELECT id FROM public.profiles 
  WHERE email = 'admin@example.com'
  LIMIT 1
)
WHERE owner_id IS NULL;
