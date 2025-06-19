
-- First, let's check if we have any profiles and their roles
-- This is just for debugging - let's see what's in the database

-- Create a test admin user profile if none exists
-- (This assumes you have a user with this email - replace with your actual admin email)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  '35cf20da-12bb-49bc-8d47-a5e273553dab'::uuid,
  'admin@test.com',
  'Test Admin',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE role = 'admin'
);

-- Ensure the current logged-in user has a profile
-- You'll need to replace this UUID with your actual user ID: 7c76b358-552a-4e9d-994b-33b05fe98ff0
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '7c76b358-552a-4e9d-994b-33b05fe98ff0'::uuid,
  'andrey_p@riseup.net',
  'Andrey',
  'user'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = COALESCE(profiles.role, EXCLUDED.role);

-- Make sure we have proper indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1_id, participant_2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);

-- Add a function to safely create conversations
CREATE OR REPLACE FUNCTION public.create_conversation(
  p_participant_1_id uuid,
  p_participant_2_id uuid,
  p_subject text DEFAULT 'Chat',
  p_property_id uuid DEFAULT NULL,
  p_property_request_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conversation_id uuid;
BEGIN
  -- Check if conversation already exists
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE (
    (participant_1_id = p_participant_1_id AND participant_2_id = p_participant_2_id) OR
    (participant_1_id = p_participant_2_id AND participant_2_id = p_participant_1_id)
  )
  AND (
    (p_property_id IS NULL OR property_id = p_property_id) AND
    (p_property_request_id IS NULL OR property_request_id = p_property_request_id)
  );

  -- If conversation doesn't exist, create it
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (
      participant_1_id,
      participant_2_id,
      subject,
      property_id,
      property_request_id
    ) VALUES (
      p_participant_1_id,
      p_participant_2_id,
      p_subject,
      p_property_id,
      p_property_request_id
    ) RETURNING id INTO conversation_id;
  END IF;

  RETURN conversation_id;
END;
$$;
