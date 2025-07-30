-- Make the chat-attachments bucket public so images can be displayed in chat
UPDATE storage.buckets 
SET public = true 
WHERE id = 'chat-attachments';