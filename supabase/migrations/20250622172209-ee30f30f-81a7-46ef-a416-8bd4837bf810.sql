
-- Update existing conversations to change admin support references
UPDATE public.conversations 
SET subject = REPLACE(subject, 'Admin Support', 'Support')
WHERE subject LIKE '%Admin Support%';

-- Update any other references in the subject field
UPDATE public.conversations 
SET subject = 'Support'
WHERE subject = 'Admin Support';
