-- Add year_built and parking columns to property_requests table
ALTER TABLE public.property_requests 
ADD COLUMN IF NOT EXISTS year_built INTEGER,
ADD COLUMN IF NOT EXISTS parking INTEGER;

-- Update the approve_property_request function to properly handle year_built, parking, and admin_notes
CREATE OR REPLACE FUNCTION public.approve_property_request(request_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  request_record RECORD;
  new_property_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve property requests';
  END IF;

  -- Get the request details
  SELECT * INTO request_record FROM public.property_requests WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property request not found or already processed';
  END IF;

  -- Insert into properties table with ALL relevant fields including contact information, year_built, and parking
  INSERT INTO public.properties (
    title, description, price, location, latitude, longitude,
    bedrooms, bathrooms, type, property_type, emirate, area, year_built, parking,
    amenities, images, 
    contact_name, contact_email, contact_phone,
    owner_id, is_approved, created_at
  ) VALUES (
    request_record.title, request_record.description, request_record.price,
    request_record.location, request_record.latitude, request_record.longitude,
    request_record.bedrooms, request_record.bathrooms, request_record.type,
    request_record.property_type, request_record.emirate, request_record.area,
    request_record.year_built, request_record.parking,
    request_record.amenities, request_record.images,
    request_record.contact_name, request_record.contact_email, request_record.contact_phone,
    request_record.user_id, -- Set owner to original requester
    true, -- Approve the property immediately
    now()
  ) RETURNING id INTO new_property_id;

  -- Update request status
  UPDATE public.property_requests 
  SET status = 'approved', approved_by = auth.uid(), approved_at = now()
  WHERE id = request_id;

  RETURN new_property_id;
END;
$function$