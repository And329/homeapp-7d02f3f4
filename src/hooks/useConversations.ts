
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  property_id: string | null; // Changed from number | null to string | null
  property_request_id: string | null;
  participant_1_id: string;
  participant_2_id: string;
  subject: string;
  last_message_at: string;
  created_at: string;
  other_participant?: {
    id: string;
    full_name: string | null;
    email: string | null;
    profile_picture: string | null;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all conversations for the current user
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('useConversations: Fetching conversations for user:', user.id);

      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('useConversations: Error fetching conversations:', error);
        throw error;
      }

      console.log('useConversations: Fetched conversations:', conversationsData);

      // Get participant profiles
      const participantIds = new Set<string>();
      conversationsData.forEach(conv => {
        participantIds.add(conv.participant_1_id);
        participantIds.add(conv.participant_2_id);
      });
      participantIds.delete(user.id); // Remove current user

      if (participantIds.size === 0) {
        return conversationsData.map(conv => ({
          ...conv,
          other_participant: null
        })) as Conversation[];
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, profile_picture')
        .in('id', Array.from(participantIds));

      if (profilesError) {
        console.error('useConversations: Error fetching profiles:', profilesError);
        throw profilesError;
      }

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return conversationsData.map(conv => ({
        ...conv,
        other_participant: profilesMap.get(
          conv.participant_1_id === user.id ? conv.participant_2_id : conv.participant_1_id
        ) || null
      })) as Conversation[];
    },
    enabled: !!user,
  });

  // Create or find conversation
  const createConversationMutation = useMutation({
    mutationFn: async ({ 
      otherUserId, 
      propertyId, 
      propertyRequestId, 
      subject 
    }: {
      otherUserId: string;
      propertyId?: string; // Changed from number to string
      propertyRequestId?: string;
      subject: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('useConversations: Creating conversation with:', {
        currentUserId: user.id,
        otherUserId,
        propertyId,
        propertyRequestId,
        subject
      });

      // Prevent users from creating conversations with themselves
      if (user.id === otherUserId) {
        console.error('useConversations: Cannot create conversation with self');
        throw new Error('Cannot create conversation with yourself');
      }

      // Check if conversation already exists
      let query = supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      if (propertyRequestId) {
        query = query.eq('property_request_id', propertyRequestId);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        console.log('useConversations: Found existing conversation:', existing);
        return existing;
      }

      // Create new conversation
      console.log('useConversations: Creating new conversation');
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: user.id,
          participant_2_id: otherUserId,
          property_id: propertyId || null,
          property_request_id: propertyRequestId || null,
          subject
        })
        .select()
        .single();

      if (error) {
        console.error('useConversations: Error creating conversation:', error);
        throw error;
      }

      console.log('useConversations: Created new conversation:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('useConversations: Failed to create conversation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    conversations,
    conversationsLoading,
    createConversation: createConversationMutation.mutate,
    createConversationAsync: createConversationMutation.mutateAsync,
    isCreatingConversation: createConversationMutation.isPending,
  };
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get messages for a conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      console.log('useMessages: Fetching messages for conversation:', conversationId);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('useMessages: Error fetching messages:', error);
        throw error;
      }

      console.log('useMessages: Fetched messages:', data);
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!conversationId || !user) throw new Error('Invalid conversation or user');

      console.log('useMessages: Sending message:', { conversationId, content });

      const { error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content
        }]);

      if (error) {
        console.error('useMessages: Error sending message:', error);
        throw error;
      }

      console.log('useMessages: Message sent successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('useMessages: Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    messages,
    messagesLoading,
    sendMessage: sendMessageMutation.mutate,
    isSendingMessage: sendMessageMutation.isPending,
  };
};
