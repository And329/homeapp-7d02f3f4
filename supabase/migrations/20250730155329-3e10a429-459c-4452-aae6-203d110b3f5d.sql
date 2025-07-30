-- Create storage policies for chat-attachments bucket

-- Users can upload files to their own folder in chat-attachments
CREATE POLICY "Users can upload to own folder in chat-attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view files they uploaded or files in conversations they participate in
CREATE POLICY "Users can view chat attachments in their conversations" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-attachments' AND (
    -- User can see their own files
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- User can see files in conversations they participate in
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.file_url = name
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  )
);

-- Users can update files they uploaded
CREATE POLICY "Users can update their own chat attachments" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'chat-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete files they uploaded
CREATE POLICY "Users can delete their own chat attachments" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);