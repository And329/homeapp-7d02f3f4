
-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true);

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Users can upload chat attachments" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to view chat attachments
CREATE POLICY "Users can view chat attachments" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');

-- Create policy to allow users to delete their own attachments
CREATE POLICY "Users can delete their own chat attachments" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
