-- Clear all conversations and listings
-- Delete all messages first (they reference conversations)
DELETE FROM public.messages;

-- Delete all conversations
DELETE FROM public.conversations;

-- Delete all properties
DELETE FROM public.properties;

-- Delete all property requests
DELETE FROM public.property_requests;

-- Delete all user favorites
DELETE FROM public.user_favorites;