
-- Add phone number to property requests
ALTER TABLE public.property_requests 
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add profile picture to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Create user-to-user chat tables
CREATE TABLE IF NOT EXISTS public.user_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
  property_request_id UUID REFERENCES public.property_requests(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user chat messages table
CREATE TABLE IF NOT EXISTS public.user_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.user_chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add PDF attachment to blog posts (it already exists in admin_blog_posts)
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS pdf_attachment TEXT;

-- Enable RLS on new tables
ALTER TABLE public.user_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_chats
CREATE POLICY "Users can view chats they're part of" 
  ON public.user_chats 
  FOR SELECT 
  USING (requester_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Users can create chats as requester" 
  ON public.user_chats 
  FOR INSERT 
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own chats" 
  ON public.user_chats 
  FOR UPDATE 
  USING (requester_id = auth.uid() OR owner_id = auth.uid());

-- RLS policies for user_chat_messages
CREATE POLICY "Users can view messages in their chats" 
  ON public.user_chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_chats 
      WHERE id = chat_id AND (requester_id = auth.uid() OR owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their chats" 
  ON public.user_chat_messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_chats 
      WHERE id = chat_id AND (requester_id = auth.uid() OR owner_id = auth.uid())
    )
  );
