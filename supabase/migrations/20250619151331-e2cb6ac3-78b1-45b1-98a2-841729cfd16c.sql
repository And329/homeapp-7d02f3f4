
-- Update the current user to be an admin (using the user ID from the console logs)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = '34a64229-ecca-42a8-80f5-52964e41595a';

-- If the above user doesn't exist in profiles, insert them as admin
INSERT INTO public.profiles (id, email, role, full_name)
VALUES ('34a64229-ecca-42a8-80f5-52964e41595a', '329@riseup.net', 'admin', 'Administrator')
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Administrator';
