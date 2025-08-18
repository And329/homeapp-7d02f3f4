-- SECURITY FIX 6: Recreate views without security definer issues
-- Drop and recreate conversation_details view
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
    p1.full_name AS participant_1_name,
    p1.email AS participant_1_email,
    p1.role AS participant_1_role,
    p2.full_name AS participant_2_name,
    p2.email AS participant_2_email,
    p2.role AS participant_2_role
FROM conversations c
LEFT JOIN profiles p1 ON c.participant_1_id = p1.id
LEFT JOIN profiles p2 ON c.participant_2_id = p2.id;

-- Enable RLS on the view
ALTER VIEW public.conversation_details SET (security_invoker = on);

-- Drop and recreate conversation_participants view  
DROP VIEW IF EXISTS public.conversation_participants;
CREATE VIEW public.conversation_participants AS
SELECT 
    c.id,
    c.property_request_id,
    c.participant_1_id,
    c.participant_2_id,
    c.subject,
    c.last_message_at,
    c.created_at,
    c.is_admin_support,
    'Admin Support' AS participant_1_name,
    COALESCE(p2.full_name, p2.email, 'User') AS participant_2_name
FROM conversations c
LEFT JOIN profiles p2 ON c.participant_2_id = p2.id
WHERE c.is_admin_support = true;

-- Enable RLS on the view
ALTER VIEW public.conversation_participants SET (security_invoker = on);