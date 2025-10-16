-- Create property edit requests table
CREATE TABLE public.property_edit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Fields that can be edited
  title TEXT,
  description TEXT,
  price BIGINT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DOUBLE PRECISION,
  emirate TEXT,
  year_built INTEGER,
  parking INTEGER,
  property_type TEXT,
  amenities JSON,
  images JSON,
  qr_code TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending',
  user_message TEXT,
  admin_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_edit_requests ENABLE ROW LEVEL SECURITY;

-- Users can create edit requests for their own properties
CREATE POLICY "Users can create edit requests for own properties"
ON public.property_edit_requests
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id AND owner_id = auth.uid()
  )
);

-- Users can view their own edit requests
CREATE POLICY "Users can view their own edit requests"
ON public.property_edit_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all edit requests
CREATE POLICY "Admins can view all edit requests"
ON public.property_edit_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update edit requests
CREATE POLICY "Admins can update edit requests"
ON public.property_edit_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to approve property edit request
CREATE OR REPLACE FUNCTION public.approve_property_edit_request(edit_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  edit_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can approve edit requests';
  END IF;

  -- Get the edit request details
  SELECT * INTO edit_record 
  FROM public.property_edit_requests 
  WHERE id = edit_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Edit request not found or already processed';
  END IF;

  -- Update the property with the edited fields
  UPDATE public.properties
  SET
    title = COALESCE(edit_record.title, title),
    description = COALESCE(edit_record.description, description),
    price = COALESCE(edit_record.price, price),
    location = COALESCE(edit_record.location, location),
    latitude = COALESCE(edit_record.latitude, latitude),
    longitude = COALESCE(edit_record.longitude, longitude),
    bedrooms = COALESCE(edit_record.bedrooms, bedrooms),
    bathrooms = COALESCE(edit_record.bathrooms, bathrooms),
    area = COALESCE(edit_record.area, area),
    emirate = COALESCE(edit_record.emirate, emirate),
    year_built = COALESCE(edit_record.year_built, year_built),
    parking = COALESCE(edit_record.parking, parking),
    property_type = COALESCE(edit_record.property_type, property_type),
    amenities = COALESCE(edit_record.amenities, amenities),
    images = COALESCE(edit_record.images, images),
    qr_code = COALESCE(edit_record.qr_code, qr_code),
    contact_name = COALESCE(edit_record.contact_name, contact_name),
    contact_email = COALESCE(edit_record.contact_email, contact_email),
    contact_phone = COALESCE(edit_record.contact_phone, contact_phone)
  WHERE id = edit_record.property_id;

  -- Update edit request status
  UPDATE public.property_edit_requests
  SET 
    status = 'approved',
    approved_by = auth.uid(),
    approved_at = now()
  WHERE id = edit_request_id;

  -- Create notification for the user
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    edit_record.user_id,
    'Property Edit Approved',
    'Your edits to the property have been approved and applied.',
    'success'
  );
END;
$$;

-- Function to reject property edit request
CREATE OR REPLACE FUNCTION public.reject_property_edit_request(edit_request_id UUID, rejection_reason TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  edit_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reject edit requests';
  END IF;

  -- Get the edit request details
  SELECT * INTO edit_record 
  FROM public.property_edit_requests 
  WHERE id = edit_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Edit request not found or already processed';
  END IF;

  -- Update edit request status
  UPDATE public.property_edit_requests
  SET 
    status = 'rejected',
    approved_by = auth.uid(),
    approved_at = now(),
    admin_notes = rejection_reason
  WHERE id = edit_request_id;

  -- Create notification for the user
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    edit_record.user_id,
    'Property Edit Rejected',
    'Your edit request has been reviewed and not approved.' || CASE WHEN rejection_reason IS NOT NULL THEN ' Reason: ' || rejection_reason ELSE '' END,
    'error'
  );
END;
$$;