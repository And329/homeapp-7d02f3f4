
-- Create storage policy to allow authenticated users to upload files (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to upload chat attachments'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload chat attachments"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'chat-attachments');
    END IF;
END $$;

-- Create storage policy to allow users to view their own attachments (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow users to view chat attachments'
    ) THEN
        CREATE POLICY "Allow users to view chat attachments"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'chat-attachments');
    END IF;
END $$;
