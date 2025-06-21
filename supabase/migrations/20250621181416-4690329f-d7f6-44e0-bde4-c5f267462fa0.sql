
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own property requests" ON public.property_requests;
DROP POLICY IF EXISTS "Admins can view all property requests" ON public.property_requests;
DROP POLICY IF EXISTS "Users can create property requests" ON public.property_requests;
DROP POLICY IF EXISTS "Users can update their own property requests" ON public.property_requests;
DROP POLICY IF EXISTS "Admins can update property requests" ON public.property_requests;

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_requests ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can create conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can update their conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
    )
  );

-- Property requests policies
CREATE POLICY "Users can view their own property requests" 
  ON public.property_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all property requests" 
  ON public.property_requests 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create property requests" 
  ON public.property_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property requests" 
  ON public.property_requests 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update property requests" 
  ON public.property_requests 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create the conversation details view
DROP VIEW IF EXISTS public.conversation_details;
CREATE VIEW public.conversation_details AS
SELECT 
  c.id,
  c.participant_1_id,
  c.participant_2_id,
  c.subject,
  c.is_admin_support,
  c.created_at,
  c.last_message_at,
  c.property_request_id,
  p1.full_name as participant_1_name,
  p1.email as participant_1_email,
  p1.role as participant_1_role,
  p2.full_name as participant_2_name,
  p2.email as participant_2_email,
  p2.role as participant_2_role
FROM public.conversations c
LEFT JOIN public.profiles p1 ON c.participant_1_id = p1.id
LEFT JOIN public.profiles p2 ON c.participant_2_id = p2.id;

GRANT SELECT ON public.conversation_details TO authenticated;

-- Update the create_admin_conversation function
CREATE OR REPLACE FUNCTION public.create_admin_conversation(
  p_admin_id uuid, 
  p_user_id uuid, 
  p_property_request_id uuid DEFAULT NULL, 
  p_subject text DEFAULT 'Admin Support'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conversation_id uuid;
  admin_profile RECORD;
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

  -- Check if conversation already exists between these users
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE (
    (participant_1_id = p_admin_id AND participant_2_id = p_user_id) OR
    (participant_1_id = p_user_id AND participant_2_id = p_admin_id)
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
      p_user_id,
      p_property_request_id,
      p_subject,
      true
    ) RETURNING id INTO conversation_id;
  END IF;

  RETURN conversation_id;
END;
$$;

-- Create function to handle property deletion requests
CREATE OR REPLACE FUNCTION public.request_property_deletion(property_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to approve property deletion (admin only)
CREATE OR REPLACE FUNCTION public.approve_property_deletion(property_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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
