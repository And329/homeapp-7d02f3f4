-- Create separate table for property deletion requests
CREATE TABLE public.property_deletion_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_request_id uuid NOT NULL REFERENCES public.property_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_by uuid,
  approved_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.property_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own deletion requests" 
ON public.property_deletion_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deletion requests" 
ON public.property_deletion_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all deletion requests" 
ON public.property_deletion_requests 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update deletion requests" 
ON public.property_deletion_requests 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create function for requesting deletion
CREATE OR REPLACE FUNCTION public.request_property_deletion_new(property_request_id_param uuid, reason_param text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deletion_request_id uuid;
BEGIN
  -- Check if user owns this property request
  IF NOT EXISTS (
    SELECT 1 FROM public.property_requests 
    WHERE id = property_request_id_param AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You can only request deletion of your own properties';
  END IF;

  -- Check if deletion request already exists
  IF EXISTS (
    SELECT 1 FROM public.property_deletion_requests 
    WHERE property_request_id = property_request_id_param AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'A deletion request for this property already exists';
  END IF;

  -- Create deletion request
  INSERT INTO public.property_deletion_requests (
    property_request_id,
    user_id,
    reason
  ) VALUES (
    property_request_id_param,
    auth.uid(),
    reason_param
  ) RETURNING id INTO deletion_request_id;

  RETURN deletion_request_id;
END;
$$;

-- Create function for approving deletion
CREATE OR REPLACE FUNCTION public.approve_property_deletion_new(deletion_request_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve property deletions';
  END IF;

  -- Get the deletion request details
  SELECT pdr.*, pr.* INTO request_record 
  FROM public.property_deletion_requests pdr
  JOIN public.property_requests pr ON pdr.property_request_id = pr.id
  WHERE pdr.id = deletion_request_id_param AND pdr.status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deletion request not found or already processed';
  END IF;

  -- Delete the approved property from properties table if it exists
  DELETE FROM public.properties 
  WHERE owner_id = request_record.user_id 
  AND title = request_record.title 
  AND price = request_record.price;

  -- Delete the property request
  DELETE FROM public.property_requests WHERE id = request_record.property_request_id;

  -- Update deletion request status
  UPDATE public.property_deletion_requests 
  SET status = 'approved', 
      approved_by = auth.uid(), 
      approved_at = now(),
      updated_at = now()
  WHERE id = deletion_request_id_param;
END;
$$;