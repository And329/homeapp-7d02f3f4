
-- Create contact inquiries table
CREATE TABLE public.contact_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  inquiry_type text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to contact inquiries
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy that allows everyone to insert contact inquiries (public contact form)
CREATE POLICY "Anyone can submit contact inquiries" 
  ON public.contact_inquiries 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows only admins to view contact inquiries
CREATE POLICY "Admins can view all contact inquiries" 
  ON public.contact_inquiries 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy that allows only admins to update contact inquiries
CREATE POLICY "Admins can update contact inquiries" 
  ON public.contact_inquiries 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Extend messages table for file attachments
ALTER TABLE public.messages ADD COLUMN file_url text;
ALTER TABLE public.messages ADD COLUMN file_name text;
ALTER TABLE public.messages ADD COLUMN file_type text;
ALTER TABLE public.messages ADD COLUMN file_size bigint;

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', false);

-- Create storage policies for chat attachments
CREATE POLICY "Users can upload chat attachments" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view chat attachments" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'chat-attachments');

CREATE POLICY "Users can update their chat attachments" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their chat attachments" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
