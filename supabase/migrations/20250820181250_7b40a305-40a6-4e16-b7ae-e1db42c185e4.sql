-- Create notifications table for user notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can create notifications for any user
CREATE POLICY "Admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Update the approve_property_request function to send notifications
CREATE OR REPLACE FUNCTION public.approve_property_request(request_id uuid, admin_notes_param text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

  -- Insert into properties table
  INSERT INTO public.properties (
    title, description, price, location, latitude, longitude,
    bedrooms, bathrooms, type, property_type, emirate, area, year_built, parking,
    amenities, images, qr_code,
    contact_name, contact_email, contact_phone,
    owner_id, is_approved, created_at, admin_notes
  ) VALUES (
    request_record.title, request_record.description, request_record.price,
    request_record.location, request_record.latitude, request_record.longitude,
    request_record.bedrooms, request_record.bathrooms, request_record.type,
    request_record.property_type, request_record.emirate, request_record.area,
    request_record.year_built, request_record.parking,
    request_record.amenities, request_record.images, request_record.qr_code,
    request_record.contact_name, request_record.contact_email, request_record.contact_phone,
    request_record.user_id,
    true,
    now(),
    admin_notes_param
  ) RETURNING id INTO new_property_id;

  -- Update request status
  UPDATE public.property_requests 
  SET status = 'approved', approved_by = auth.uid(), approved_at = now()
  WHERE id = request_id;

  -- Create notification for the user
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    request_record.user_id,
    'Property Listing Approved',
    'Your property "' || request_record.title || '" has been approved and is now live!',
    'success'
  );

  RETURN new_property_id;
END;
$function$;

-- Update the approve_property_deletion_new function to send notifications
CREATE OR REPLACE FUNCTION public.approve_property_deletion_new(deletion_request_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  request_record RECORD;
  property_record RECORD;
  property_title TEXT;
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
    
    property_title := property_record.title;
    
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
    -- Get property title before deletion
    SELECT title INTO property_title FROM public.properties WHERE id = request_record.property_id;
    
    -- Update the deletion request: clear property_id reference and set status to approved
    UPDATE public.property_deletion_requests 
    SET property_id = NULL,
        status = 'approved', 
        approved_by = auth.uid(), 
        approved_at = now(),
        updated_at = now()
    WHERE id = deletion_request_id_param;
    
    -- Now we can safely delete the property without foreign key constraint issues
    DELETE FROM public.properties WHERE id = request_record.property_id;
    
    -- Create notification for the user
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      request_record.user_id,
      'Property Deletion Approved',
      'Your property "' || COALESCE(property_title, 'Unknown') || '" has been successfully deleted.',
      'info'
    );
    
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

  -- Create notification for property request deletion
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    request_record.user_id,
    'Property Deletion Approved',
    'Your property "' || COALESCE(property_title, 'Unknown') || '" has been successfully deleted.',
    'info'
  );
END;
$function$;