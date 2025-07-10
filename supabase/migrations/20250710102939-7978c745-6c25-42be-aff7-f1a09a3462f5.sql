-- Create a test property request from a different user for testing replies
INSERT INTO public.property_requests (
  id, user_id, title, description, price, location, bedrooms, bathrooms, 
  type, contact_name, contact_email, status, submitter_type, created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '0195057f-d1e4-4843-b0a2-5e19c4056031',  -- Andrey's user ID
  'Test Property for Reply Testing',
  'This is a test property request to test the reply functionality',
  100000,
  'Test Location, Dubai',
  2,
  2,
  'rent',
  'Andrey Piskulov',
  'andreypiskulov@gmail.com',
  'pending',
  'owner',
  now()
) ON CONFLICT (id) DO NOTHING;