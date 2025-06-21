
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('useConversations: Fetching conversations for user:', user.id);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('useConversations: Error fetching conversations:', error);
        throw error;
      }

      console.log('useConversations: Found conversations:', data?.length || 0);
      return data || [];
    },
    enabled: !!user,
  });

  return {
    conversations: conversationsQuery.data || [],
    conversationsLoading: conversationsQuery.isLoading,
    conversationsError: conversationsQuery.error,
  };
};

export const useMessages = (conversationId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
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

      console.log('useMessages: Found messages:', data?.length || 0);
      return data || [];
    },
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, file_url, file_name, file_type, file_size }: { 
      content: string;
      file_url?: string;
      file_name?: string;
      file_type?: string;
      file_size?: number;
    }) => {
      if (!user || !conversationId) {
        throw new Error('User not authenticated or conversation not selected');
      }

      console.log('useMessages: Sending message to conversation:', conversationId);
      
      const messageData: any = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim()
      };

      // Add file metadata if present
      if (file_url) {
        messageData.file_url = file_url;
        messageData.file_name = file_name;
        messageData.file_type = file_type;
        messageData.file_size = file_size;
      }

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

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
    onError: (error: any) => {
      console.error('useMessages: Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    messages: messagesQuery.data || [],
    messagesLoading: messagesQuery.isLoading,
    messagesError: messagesQuery.error,
    sendMessage: sendMessageMutation.mutateAsync,
    isSendingMessage: sendMessageMutation.isPending,
  };
};
