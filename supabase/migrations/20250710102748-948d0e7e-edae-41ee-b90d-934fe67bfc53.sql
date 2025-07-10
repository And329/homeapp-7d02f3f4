-- Create a test user profile and property request for testing replies
INSERT INTO public.profiles (id, email, full_name, role) 
VALUES ('11111111-1111-1111-1111-111111111111', 'testuser@example.com', 'Test User', 'user')
ON CONFLICT (id) DO NOTHING;

-- Create a test property request from this user  
INSERT INTO public.property_requests (
  id, user_id, title, description, price, location, bedrooms, bathrooms, 
  type, contact_name, contact_email, status, submitter_type, created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Test Property for Reply Testing',
  'This is a test property request to test the reply functionality',
  100000,
  'Test Location, Dubai',
  2,
  2,
  'rent',
  'Test User',
  'testuser@example.com',
  'pending',
  'owner',
  now()
) ON CONFLICT (id) DO NOTHING;