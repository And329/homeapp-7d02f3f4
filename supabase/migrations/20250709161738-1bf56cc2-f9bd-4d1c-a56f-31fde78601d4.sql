-- Add contact information fields to properties table
ALTER TABLE public.properties ADD COLUMN contact_name text;
ALTER TABLE public.properties ADD COLUMN contact_email text;
ALTER TABLE public.properties ADD COLUMN contact_phone text;