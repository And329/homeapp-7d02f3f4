
-- Drop the view first to remove dependency
DROP VIEW IF EXISTS public.conversation_participants;

-- Remove user-to-user conversations, keep only admin support conversations
DELETE FROM public.messages 
WHERE conversation_id IN (
  SELECT id FROM public.conversations 
  WHERE is_admin_support = false OR is_admin_support IS NULL
);

DELETE FROM public.conversations 
WHERE is_admin_support = false OR is_admin_support IS NULL;

-- Update conversations table to make admin support required
ALTER TABLE public.conversations 
ALTER COLUMN is_admin_support SET DEFAULT true,
ALTER COLUMN is_admin_support SET NOT NULL;

-- Drop the old create_conversation function as we won't need user-to-user conversations
DROP FUNCTION IF EXISTS public.create_conversation;

-- Remove property_id from conversations as we only need property_request_id
ALTER TABLE public.conversations DROP COLUMN IF EXISTS property_id;

-- Create a simpler function for admin-to-user conversations only
CREATE OR REPLACE FUNCTION public.create_admin_conversation(
  p_admin_id uuid,
  p_user_id uuid,
  p_property_request_id uuid,
  p_subject text DEFAULT 'Property Request Support'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conversation_id uuid;
BEGIN
  -- Check if conversation already exists for this property request
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE property_request_id = p_property_request_id
  AND participant_1_id = p_admin_id
  AND participant_2_id = p_user_id;

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

-- Recreate the conversation_participants view with the simplified structure
CREATE OR REPLACE VIEW public.conversation_participants AS
SELECT 
  c.*,
  'Admin Support' as participant_1_name,
  COALESCE(p2.full_name, p2.email, 'User') as participant_2_name
FROM public.conversations c
LEFT JOIN public.profiles p2 ON c.participant_2_id = p2.id
WHERE c.is_admin_support = true;
