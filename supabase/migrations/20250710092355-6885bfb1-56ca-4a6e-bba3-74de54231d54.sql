-- Create storage bucket for team member profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('team-photos', 'team-photos', true);

-- Create storage policies for team photos
CREATE POLICY "Anyone can view team photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'team-photos');

CREATE POLICY "Admins can upload team photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'team-photos' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update team photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'team-photos' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete team photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'team-photos' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);