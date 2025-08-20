-- Add deletion_reason field to property_requests table
ALTER TABLE public.property_requests 
ADD COLUMN deletion_reason text;

-- Update the request_property_deletion function to accept deletion reason
CREATE OR REPLACE FUNCTION public.request_property_deletion(property_request_id uuid, deletion_reason_param text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user owns this property request
  IF NOT EXISTS (
    SELECT 1 FROM public.property_requests 
    WHERE id = property_request_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You can only request deletion of your own properties';
  END IF;

  -- Update the status to deletion_requested and store the reason
  UPDATE public.property_requests 
  SET status = 'deletion_requested', 
      deletion_reason = deletion_reason_param,
      updated_at = now()
  WHERE id = property_request_id AND user_id = auth.uid();
END;
$$;