-- Fix the create_admin_conversation function to handle admin replying to own requests
CREATE OR REPLACE FUNCTION public.create_admin_conversation(p_admin_id uuid, p_user_id uuid, p_property_request_id uuid DEFAULT NULL::uuid, p_subject text DEFAULT 'Admin Support'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    -- Get the contact email from the property request to find the actual requester
    IF p_property_request_id IS NOT NULL THEN
      -- Use the contact_email from property request to determine the conversation participant
      -- For admin replying to own requests, we'll create a "system" conversation
      -- In this case, we'll use a special handling where admin talks to themselves
      -- but we need to satisfy the different_participants constraint
      
      -- Create a system user for this purpose
      DECLARE 
        system_user_id uuid;
      BEGIN
        -- Try to find or create a system user for internal conversations
        SELECT id INTO system_user_id FROM public.profiles WHERE email = 'system@internal.admin' LIMIT 1;
        
        IF NOT FOUND THEN
          -- We can't create auth users, so we'll use a different approach
          -- Instead, we'll not create a conversation for self-replies
          RAISE EXCEPTION 'Cannot create conversation: Admin cannot reply to own property requests. Please contact the requester directly.';
        END IF;
        
        target_user_id := system_user_id;
      END;
    ELSE
      RAISE EXCEPTION 'Cannot create conversation: Admin cannot reply to own property requests without a valid external user.';
    END IF;
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
$function$;