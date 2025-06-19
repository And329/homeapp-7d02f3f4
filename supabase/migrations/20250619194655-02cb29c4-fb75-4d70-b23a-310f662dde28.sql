
-- Delete all existing conversations and messages to start fresh
DELETE FROM public.messages;
DELETE FROM public.conversations;

-- Add a new column to handle admin support conversations differently
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS is_admin_support BOOLEAN DEFAULT FALSE;

-- Create a view for easier querying of conversations with proper participant handling
CREATE OR REPLACE VIEW public.conversation_participants AS
SELECT 
  c.*,
  CASE 
    WHEN c.is_admin_support = TRUE THEN 'Admin Support'
    ELSE COALESCE(p1.full_name, p1.email, 'Unknown User')
  END as participant_1_name,
  CASE 
    WHEN c.is_admin_support = TRUE AND c.participant_1_id != c.participant_2_id THEN 
      COALESCE(p2.full_name, p2.email, 'Unknown User')
    WHEN c.is_admin_support = TRUE THEN 'User'
    ELSE COALESCE(p2.full_name, p2.email, 'Unknown User')
  END as participant_2_name
FROM public.conversations c
LEFT JOIN public.profiles p1 ON c.participant_1_id = p1.id
LEFT JOIN public.profiles p2 ON c.participant_2_id = p2.id;
