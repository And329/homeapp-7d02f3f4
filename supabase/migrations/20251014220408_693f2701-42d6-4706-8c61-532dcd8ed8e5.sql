-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload to property-media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view property-media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property-media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property-media files" ON storage.objects;

-- Policy for uploading to property-media bucket
CREATE POLICY "Authenticated users can upload to property-media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-media');

-- Policy for viewing property-media files (public bucket)
CREATE POLICY "Anyone can view property-media files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-media');

-- Policy for users to update their own files
CREATE POLICY "Users can update their own property-media files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'property-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for users to delete their own files
CREATE POLICY "Users can delete their own property-media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'property-media' AND auth.uid()::text = (storage.foldername(name))[1]);