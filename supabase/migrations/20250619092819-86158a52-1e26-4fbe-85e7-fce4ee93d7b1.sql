
-- Drop existing chat tables to start fresh
DROP TABLE IF EXISTS public.user_chat_messages;
DROP TABLE IF EXISTS public.user_chats;
DROP TABLE IF EXISTS public.chat_messages;
DROP TABLE IF EXISTS public.admin_chats;
DROP TABLE IF EXISTS public.property_request_replies;

-- Create unified conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
  property_request_id UUID REFERENCES public.property_requests(id) ON DELETE CASCADE,
  participant_1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id),
  CONSTRAINT unique_conversation UNIQUE (property_id, participant_1_id, participant_2_id)
);

-- Create unified messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

CREATE POLICY "Users can create conversations they participate in" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

-- RLS policies for messages
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

CREATE POLICY "Users can send messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX idx_conversations_participants ON public.conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_conversations_property ON public.conversations(property_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);

-- Create function to update last_message_at when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update conversation timestamp
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();
