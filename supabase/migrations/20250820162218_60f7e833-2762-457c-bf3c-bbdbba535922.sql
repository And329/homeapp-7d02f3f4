-- Create enhanced deletion request function that handles both property requests and approved properties
CREATE OR REPLACE FUNCTION public.request_property_deletion_enhanced(
  property_request_id_param uuid DEFAULT NULL,
  property_id_param uuid DEFAULT NULL,
  reason_param text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deletion_request_id uuid;
  target_property_request_id uuid;
BEGIN
  -- Validate that exactly one ID is provided
  IF (property_request_id_param IS NULL AND property_id_param IS NULL) OR 
     (property_request_id_param IS NOT NULL AND property_id_param IS NOT NULL) THEN
    RAISE EXCEPTION 'Must provide exactly one of property_request_id or property_id';
  END IF;

  -- Handle property request deletion
  IF property_request_id_param IS NOT NULL THEN
    -- Check if user owns this property request
    IF NOT EXISTS (
      SELECT 1 FROM public.property_requests 
      WHERE id = property_request_id_param AND user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'You can only request deletion of your own properties';
    END IF;
    
    target_property_request_id := property_request_id_param;
  END IF;

  -- Handle approved property deletion
  IF property_id_param IS NOT NULL THEN
    -- Check if user owns this approved property
    IF NOT EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id_param AND owner_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'You can only request deletion of your own properties';
    END IF;
    
    -- For approved properties, we'll store the property_id in the reason field temporarily
    -- and use a special marker for property_request_id
    target_property_request_id := property_id_param;
  END IF;

  -- Check if deletion request already exists
  IF EXISTS (
    SELECT 1 FROM public.property_deletion_requests 
    WHERE property_request_id = target_property_request_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'A deletion request for this property already exists';
  END IF;

  -- Create deletion request
  INSERT INTO public.property_deletion_requests (
    property_request_id,
    user_id,
    reason
  ) VALUES (
    target_property_request_id,
    auth.uid(),
    CASE 
      WHEN property_id_param IS NOT NULL THEN 
        'APPROVED_PROPERTY:' || property_id_param::text || ':' || COALESCE(reason_param, '')
      ELSE 
        reason_param
    END
  ) RETURNING id INTO deletion_request_id;

  RETURN deletion_request_id;
END;
$$;