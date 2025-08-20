CREATE OR REPLACE FUNCTION public.approve_property_deletion_new(deletion_request_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  request_record RECORD;
  property_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve property deletions';
  END IF;

  -- Get the deletion request details
  SELECT * INTO request_record 
  FROM public.property_deletion_requests
  WHERE id = deletion_request_id_param AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deletion request not found or already processed';
  END IF;

  -- Handle property request deletion
  IF request_record.property_request_id IS NOT NULL THEN
    -- Get property request details
    SELECT * INTO property_record 
    FROM public.property_requests 
    WHERE id = request_record.property_request_id;
    
    -- Delete the approved property from properties table if it exists
    DELETE FROM public.properties 
    WHERE owner_id = property_record.user_id 
    AND title = property_record.title 
    AND price = property_record.price;

    -- Delete the property request
    DELETE FROM public.property_requests WHERE id = request_record.property_request_id;
  END IF;

  -- Handle live property deletion
  IF request_record.property_id IS NOT NULL THEN
    -- First update the deletion request status to avoid foreign key constraint issues
    UPDATE public.property_deletion_requests 
    SET status = 'approved', 
        approved_by = auth.uid(), 
        approved_at = now(),
        updated_at = now()
    WHERE id = deletion_request_id_param;
    
    -- Then delete the live property
    DELETE FROM public.properties WHERE id = request_record.property_id;
    
    -- Exit early since we already updated the deletion request
    RETURN;
  END IF;

  -- Update deletion request status (only needed for property request deletions)
  UPDATE public.property_deletion_requests 
  SET status = 'approved', 
      approved_by = auth.uid(), 
      approved_at = now(),
      updated_at = now()
  WHERE id = deletion_request_id_param;
END;
$function$