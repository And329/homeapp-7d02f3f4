-- Add RLS policy to allow users to view profiles of conversation participants
CREATE POLICY "Users can view conversation participant profiles" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT DISTINCT 
      CASE 
        WHEN participant_1_id = auth.uid() THEN participant_2_id
        WHEN participant_2_id = auth.uid() THEN participant_1_id
        ELSE NULL
      END
    FROM public.conversations 
    WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
  )
);