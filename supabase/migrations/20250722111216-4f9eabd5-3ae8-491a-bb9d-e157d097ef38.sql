-- Add admin_notes field to properties table
ALTER TABLE public.properties 
ADD COLUMN admin_notes TEXT;