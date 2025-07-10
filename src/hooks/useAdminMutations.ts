
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PropertyRequest } from '@/types/propertyRequest';

export const useAdminMutations = (profile: any, propertyRequests: PropertyRequest[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendReplyMutation = useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      // Check if user is admin
      if (!profile || profile.role !== 'admin') {
        throw new Error('Only administrators can send replies');
      }

      console.log('Admin: Creating conversation for request:', requestId);
      
      const request = propertyRequests.find(r => r.id === requestId);
      if (!request?.user_id) {
        throw new Error('Request user not found');
      }

      // Check if admin is trying to reply to their own request
      if (profile.id === request.user_id) {
        throw new Error('You cannot reply to your own property requests. The system does not support self-conversations. Please contact the requester directly using their contact information.');
      }

      // Use the create_admin_conversation function
      const { data: conversationId, error } = await supabase.rpc('create_admin_conversation', {
        p_admin_id: profile.id,
        p_user_id: request.user_id,
        p_property_request_id: requestId,
        p_subject: `Property Request: ${request.title}`
      });

      if (error) throw error;
      return conversationId;
    },
    onError: (error) => {
      console.error('Failed to create conversation:', error);
      toast({
        title: "Cannot Send Reply",
        description: error.message || "Failed to create conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendChatMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      // Check if user is admin
      if (!profile || profile.role !== 'admin') {
        throw new Error('Only administrators can send messages');
      }

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
    mutationFn: async (id: string | number) => {
      console.log('Admin: Deleting property with ID:', id, 'Type:', typeof id);
      
      // Check if user is admin
      if (!profile || profile.role !== 'admin') {
        throw new Error('Only administrators can delete properties');
      }

      // Convert to string to ensure consistency
      const propertyId = String(id);
      console.log('Admin: Using property ID as string:', propertyId);

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        console.error('Admin: Error deleting property:', error);
        throw error;
      }

      console.log('Admin: Property deleted successfully');
    },
    onSuccess: () => {
      toast({
        title: "Property deleted",
        description: "The property has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error: any) => {
      console.error('Failed to delete property:', error);
      toast({
        title: "Error",
        description: `Failed to delete property: ${error.message || 'Please try again.'}`,
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
