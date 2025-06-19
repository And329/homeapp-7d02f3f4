
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PropertyRequest } from '@/types/propertyRequest';
import { deleteProperty as deletePropertyAPI } from '@/api/properties';

export const useAdminMutations = (profile: any, propertyRequests: PropertyRequest[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendReplyMutation = useMutation({
    mutationFn: async ({ requestId, message }: { requestId: string; message: string }) => {
      console.log('Admin: Sending reply to request:', requestId, message);
      
      const request = propertyRequests.find(r => r.id === requestId);
      if (!request?.user_id) {
        throw new Error('Request user not found');
      }

      // Create or find existing conversation
      const conversationSubject = `Property Request: ${request.title}`;
      
      let { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('property_request_id', requestId)
        .eq('participant_1_id', profile.id)
        .eq('participant_2_id', request.user_id)
        .maybeSingle();

      if (!existingConversation) {
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            participant_1_id: profile.id,
            participant_2_id: request.user_id,
            property_request_id: requestId,
            subject: conversationSubject
          })
          .select()
          .single();

        if (conversationError) throw conversationError;
        existingConversation = newConversation;
      }

      // Send the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: existingConversation.id,
          sender_id: profile.id,
          content: message
        });

      if (messageError) throw messageError;
    },
    onSuccess: () => {
      toast({
        title: "Reply sent",
        description: "Your reply has been sent to the user.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    },
    onError: (error) => {
      console.error('Failed to send reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendChatMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      console.log('Admin: Sending chat message to conversation:', conversationId, message);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content: message
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { // Changed from number to string
      console.log('Admin: Deleting property with ID:', id);
      await deletePropertyAPI(id);
    },
    onSuccess: () => {
      toast({
        title: "Property deleted",
        description: "The property has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    },
    onError: (error) => {
      console.error('Failed to delete property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    sendReplyMutation,
    sendChatMessageMutation,
    deleteMutation,
  };
};
