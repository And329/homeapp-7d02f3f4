
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  property_id: string | null;
  property_request_id: string | null;
  participant_1_id: string;
  participant_2_id: string;
  subject: string;
  last_message_at: string;
  created_at: string;
  is_admin_support: boolean;
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

      console.log('useConversations: Fetched conversations:', conversationsData?.length || 0);

      if (!conversationsData || conversationsData.length === 0) {
        return [];
      }

      // Get participant profiles for better name display
      const participantIds = new Set<string>();
      conversationsData.forEach(conv => {
        if (!conv.is_admin_support) {
          // Only fetch profiles for non-admin conversations
          const otherParticipantId = conv.participant_1_id === user.id 
            ? conv.participant_2_id 
            : conv.participant_1_id;
          participantIds.add(otherParticipantId);
        }
      });

      let profilesMap = new Map();
      
      if (participantIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, profile_picture')
          .in('id', Array.from(participantIds));

        if (profilesError) {
          console.error('useConversations: Error fetching profiles:', profilesError);
        } else {
          profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
        }
      }

      return conversationsData.map(conv => {
        const otherParticipantId = conv.participant_1_id === user.id 
          ? conv.participant_2_id 
          : conv.participant_1_id;
        
        let otherParticipant = null;
        
        if (conv.is_admin_support) {
          // Special handling for admin support conversations
          otherParticipant = {
            id: 'admin-support',
            full_name: 'Admin Support',
            email: '329@riseup.net',
            profile_picture: null
          };
        } else {
          otherParticipant = profilesMap.get(otherParticipantId) || {
            id: otherParticipantId,
            full_name: null,
            email: null,
            profile_picture: null
          };
        }

        return {
          ...conv,
          other_participant: otherParticipant
        };
      }) as Conversation[];
    },
    enabled: !!user,
  });

  // Create or find conversation using the database function
  const createConversationMutation = useMutation({
    mutationFn: async ({ 
      otherUserId, 
      propertyId, 
      propertyRequestId, 
      subject 
    }: {
      otherUserId: string;
      propertyId?: string;
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

      if (user.id === otherUserId) {
        throw new Error('Cannot create conversation with yourself');
      }

      // Use the database function for regular user conversations
      const { data: conversationId, error } = await supabase.rpc('create_conversation', {
        p_participant_1_id: user.id,
        p_participant_2_id: otherUserId,
        p_subject: subject,
        p_property_id: propertyId || null,
        p_property_request_id: propertyRequestId || null
      });

      if (error) {
        console.error('useConversations: Error creating conversation:', error);
        throw error;
      }

      // Fetch the conversation details
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (fetchError) {
        console.error('useConversations: Error fetching created conversation:', fetchError);
        throw fetchError;
      }

      console.log('useConversations: Created conversation:', conversation);
      return conversation;
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

      console.log('useMessages: Fetched messages:', data?.length || 0);
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!conversationId || !user) throw new Error('Invalid conversation or user');

      console.log('useMessages: Sending message');

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
