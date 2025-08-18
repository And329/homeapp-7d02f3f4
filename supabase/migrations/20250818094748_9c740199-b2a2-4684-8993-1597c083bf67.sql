-- SECURITY FIX 5: Fix remaining function search path issues
-- Check and fix the approve_property_request functions
CREATE OR REPLACE FUNCTION public.approve_property_request(request_id uuid, admin_notes_param text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- Insert into properties table with ALL relevant fields including qr_code and admin_notes
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
    request_record.user_id, -- Set owner to original requester
    true, -- Approve the property immediately
    now(),
    admin_notes_param -- Use the admin_notes parameter
  ) RETURNING id INTO new_property_id;

  -- Update request status
  UPDATE public.property_requests 
  SET status = 'approved', approved_by = auth.uid(), approved_at = now()
  WHERE id = request_id;

  RETURN new_property_id;
END;
$$;

-- Fix other functions that might have mutable search paths
CREATE OR REPLACE FUNCTION public.request_property_deletion(property_request_id uuid)
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

  -- Update the status to deletion_requested
  UPDATE public.property_requests 
  SET status = 'deletion_requested', updated_at = now()
  WHERE id = property_request_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_property_deletion(property_request_id uuid)
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

  -- Get the request details
  SELECT * INTO request_record FROM public.property_requests 
  WHERE id = property_request_id AND status = 'deletion_requested';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deletion request not found or not in deletion_requested status';
  END IF;

  -- Delete the approved property from properties table if it exists
  DELETE FROM public.properties WHERE owner_id = request_record.user_id 
  AND title = request_record.title AND price = request_record.price;

  -- Delete the property request
  DELETE FROM public.property_requests WHERE id = property_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_admin_conversation(p_admin_id uuid, p_user_id uuid, p_property_request_id uuid DEFAULT NULL::uuid, p_subject text DEFAULT 'Admin Support'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conversation_id uuid;
  admin_profile RECORD;
  target_user_id uuid;
BEGIN
  -- Verify the admin_id is actually an admin
  SELECT * INTO admin_profile FROM public.profiles WHERE id = p_admin_id AND role = 'admin';
  
  IF NOT FOUND THEN
    -- If provided admin_id is not admin, find an admin by email
    SELECT * INTO admin_profile FROM public.profiles WHERE email = '329@riseup.net' AND role = 'admin' LIMIT 1;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No admin user found';
    END IF;
    
    p_admin_id := admin_profile.id;
  END IF;

  -- Handle case where admin is trying to reply to their own property request
  IF p_admin_id = p_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation: Admin cannot reply to own property requests without a valid external user.';
  ELSE
    target_user_id := p_user_id;
  END IF;

  -- Check if conversation already exists between these users
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE (
    (participant_1_id = p_admin_id AND participant_2_id = target_user_id) OR
    (participant_1_id = target_user_id AND participant_2_id = p_admin_id)
  )
  AND (p_property_request_id IS NULL OR property_request_id = p_property_request_id);

  -- If conversation doesn't exist, create it
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (
      participant_1_id,
      participant_2_id,
      property_request_id,
      subject,
      is_admin_support
    ) VALUES (
      p_admin_id,
      target_user_id,
      p_property_request_id,
      p_subject,
      true
    ) RETURNING id INTO conversation_id;
  END IF;

  RETURN conversation_id;
END;
$$;

-- Fix update timestamp functions
CREATE OR REPLACE FUNCTION public.update_team_members_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Fix auto approve function
CREATE OR REPLACE FUNCTION public.auto_approve_admin_properties()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the owner is an admin
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.owner_id AND role = 'admin') THEN
    NEW.is_approved = true;
  END IF;
  RETURN NEW;
END;
$$;