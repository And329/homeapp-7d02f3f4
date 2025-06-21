
-- First, let's identify the admin user ID to preserve it
-- Delete all conversations (this will cascade to messages due to foreign keys)
DELETE FROM public.conversations;

-- Delete all property requests except those from the admin (if any)
DELETE FROM public.property_requests 
WHERE user_id != (
  SELECT id FROM public.profiles WHERE email = '329@riseup.net'
);

-- Delete all properties except those owned by admin (if any)
DELETE FROM public.properties 
WHERE owner_id != (
  SELECT id FROM public.profiles WHERE email = '329@riseup.net'
) AND owner_id IS NOT NULL;

-- Delete all user favorites except admin's
DELETE FROM public.user_favorites 
WHERE user_id != (
  SELECT id FROM public.profiles WHERE email = '329@riseup.net'
);

-- Delete all profiles except the admin profile
DELETE FROM public.profiles 
WHERE email != '329@riseup.net';

-- Note: We cannot directly delete from auth.users as it's in the auth schema
-- You'll need to delete other users manually from the Supabase Auth dashboard
-- or they will be automatically cleaned up when you delete them from the auth panel

-- Reset any blog posts or news articles to be owned by admin (if they exist)
UPDATE public.admin_blog_posts 
SET author_id = (SELECT id FROM public.profiles WHERE email = '329@riseup.net')
WHERE author_id != (SELECT id FROM public.profiles WHERE email = '329@riseup.net');

UPDATE public.admin_news_articles 
SET author_id = (SELECT id FROM public.profiles WHERE email = '329@riseup.net')
WHERE author_id != (SELECT id FROM public.profiles WHERE email = '329@riseup.net');

UPDATE public.blog_posts 
SET author_id = (SELECT id FROM public.profiles WHERE email = '329@riseup.net')
WHERE author_id != (SELECT id FROM public.profiles WHERE email = '329@riseup.net');

UPDATE public.news_articles 
SET author_id = (SELECT id FROM public.profiles WHERE email = '329@riseup.net')
WHERE author_id != (SELECT id FROM public.profiles WHERE email = '329@riseup.net');
