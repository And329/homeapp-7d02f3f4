-- Add property_id field to handle approved property deletions
ALTER TABLE public.property_deletion_requests 
ADD COLUMN property_id uuid REFERENCES public.properties(id);

-- Make property_request_id nullable since we'll use either property_request_id OR property_id
ALTER TABLE public.property_deletion_requests 
ALTER COLUMN property_request_id DROP NOT NULL;

-- Create updated deletion request function
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

    -- Check if deletion request already exists
    IF EXISTS (
      SELECT 1 FROM public.property_deletion_requests 
      WHERE property_request_id = property_request_id_param AND status = 'pending'
    ) THEN
      RAISE EXCEPTION 'A deletion request for this property already exists';
    END IF;

    -- Create deletion request for property request
    INSERT INTO public.property_deletion_requests (
      property_request_id,
      user_id,
      reason
    ) VALUES (
      property_request_id_param,
      auth.uid(),
      reason_param
    ) RETURNING id INTO deletion_request_id;
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

    -- Check if deletion request already exists
    IF EXISTS (
      SELECT 1 FROM public.property_deletion_requests 
      WHERE property_id = property_id_param AND status = 'pending'
    ) THEN
      RAISE EXCEPTION 'A deletion request for this property already exists';
    END IF;

    -- Create deletion request for approved property
    INSERT INTO public.property_deletion_requests (
      property_id,
      user_id,
      reason
    ) VALUES (
      property_id_param,
      auth.uid(),
      reason_param
    ) RETURNING id INTO deletion_request_id;
  END IF;

  RETURN deletion_request_id;
END;
$$;