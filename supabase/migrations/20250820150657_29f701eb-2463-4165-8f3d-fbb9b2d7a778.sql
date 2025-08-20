-- Add user_message field to property_requests table for users to leave messages for admins
ALTER TABLE public.property_requests 
ADD COLUMN user_message text;