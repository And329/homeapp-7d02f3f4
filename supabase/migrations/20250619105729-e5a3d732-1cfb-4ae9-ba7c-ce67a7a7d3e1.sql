
-- Fix the approve_property_request function to properly set owner_id
CREATE OR REPLACE FUNCTION public.approve_property_request(request_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  request_record RECORD;
  new_property_id BIGINT;
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

  -- Insert into properties table with the ORIGINAL REQUESTER as owner
  INSERT INTO public.properties (
    title, description, price, location, latitude, longitude,
    bedrooms, bathrooms, type, amenities, images, owner_id, created_at
  ) VALUES (
    request_record.title, request_record.description, request_record.price,
    request_record.location, request_record.latitude, request_record.longitude,
    request_record.bedrooms, request_record.bathrooms, request_record.type,
    request_record.amenities, request_record.images, 
    request_record.user_id, -- This is the key fix - set owner to original requester
    now()
  ) RETURNING id INTO new_property_id;

  -- Update request status
  UPDATE public.property_requests 
  SET status = 'approved', approved_by = auth.uid(), approved_at = now()
  WHERE id = request_id;

  RETURN new_property_id::UUID;
END;
$function$;

-- Also fix the existing property with NULL owner_id (Property ID 24)
-- Set it to john@riseup.net since he was the original requester
UPDATE public.properties 
SET owner_id = '35cf20da-12bb-49bc-8d47-a5e273553dab'
WHERE id = 24 AND owner_id IS NULL;
