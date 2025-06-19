
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PropertyRequest } from '@/types/propertyRequest';
import { deleteProperty } from '@/api/properties';

export const useAdminMutations = (profile: any, propertyRequests: PropertyRequest[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Delete mutation called for property ID:', id);
      await deleteProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: "Property deleted",
        description: "The property has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approveRequestWithDetailsMutation = useMutation({
    mutationFn: async ({ requestId, updatedData }: { requestId: string, updatedData: any }) => {
      console.log('Approving request with details:', { requestId, updatedData });
      
      // First insert the property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert([{
          title: updatedData.title,
          description: updatedData.description,
          price: updatedData.price,
          location: updatedData.location,
          latitude: updatedData.latitude,
          longitude: updatedData.longitude,
          bedrooms: updatedData.bedrooms,
          bathrooms: updatedData.bathrooms,
          type: updatedData.type,
          amenities: updatedData.amenities,
          images: updatedData.images,
          is_hot_deal: false
        }])
        .select()
        .single();

      if (propertyError) {
        console.error('Property creation error:', propertyError);
        throw propertyError;
      }

      // Then update the request status
      const { error: requestError } = await supabase
        .from('property_requests')
        .update({ 
          status: 'approved', 
          approved_by: profile?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (requestError) {
        console.error('Request update error:', requestError);
        throw requestError;
      }

      return propertyData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: "Request Approved",
        description: "The property request has been approved and added to listings.",
      });
    },
    onError: (error) => {
      console.error('Approval mutation error:', error);
      toast({
        title: "Error",
        description: `Failed to approve request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('property_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      toast({
        title: "Request Rejected",
        description: "The property request has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ requestId, message, userId }: { requestId: string; message: string; userId: string }) => {
      console.log('sendReplyMutation called with:', { requestId, message, userId });
      
      const propertyRequest = propertyRequests.find(req => req.id === requestId);
      const chatSubject = `Property Request: ${propertyRequest?.title || 'Property'}`;
      
      // Check if conversation already exists
      let conversationId;
      const { data: existingConversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('property_request_id', requestId)
        .or(`and(participant_1_id.eq.${userId},participant_2_id.eq.${profile!.id}),and(participant_1_id.eq.${profile!.id},participant_2_id.eq.${userId})`)
        .limit(1);

      if (existingConversations && existingConversations.length > 0) {
        conversationId = existingConversations[0].id;
      } else {
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert([{
            participant_1_id: profile!.id,
            participant_2_id: userId,
            property_request_id: requestId,
            subject: chatSubject
          }])
          .select()
          .single();

        if (conversationError) {
          console.error('Conversation creation error:', conversationError);
          throw conversationError;
        }
        conversationId = newConversation.id;
      }

      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: profile!.id,
          content: message
        }]);

      if (messageError) {
        console.error('Message creation error:', messageError);
        throw messageError;
      }

      return conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Reply sent",
        description: "Your reply has been sent to the user and a conversation has been created.",
      });
    },
    onError: (error) => {
      console.error('Send reply error:', error);
      toast({
        title: "Error",
        description: `Failed to send reply: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const sendChatMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      console.log('sendChatMessageMutation called with:', { conversationId, message, profileId: profile?.id });
      
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: profile.id,
          content: message
        }]);

      if (error) {
        console.error('Message insertion error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      console.error('Send chat message error:', error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    deleteMutation,
    approveRequestWithDetailsMutation,
    rejectRequestMutation,
    sendReplyMutation,
    sendChatMessageMutation,
  };
};
