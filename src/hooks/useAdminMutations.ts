
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PropertyRequest } from '@/types/propertyRequest';
import { deleteProperty } from '@/api/properties';

export const useAdminMutations = (profile: any, propertyRequests: PropertyRequest[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
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
          is_hot_deal: false,
          is_approved: true,
          created_by: profile?.id,
          owner_id: propertyRequests.find(r => r.id === requestId)?.user_id
        }])
        .select()
        .single();

      if (propertyError) {
        console.error('Property creation error:', propertyError);
        throw propertyError;
      }

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
    mutationFn: async ({ requestId }: { requestId: string }) => {
      console.log('sendReplyMutation called with:', { requestId, profileId: profile?.id });
      
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }
      
      const propertyRequest = propertyRequests.find(req => req.id === requestId);
      if (!propertyRequest || !propertyRequest.user_id) {
        throw new Error('Property request not found or missing user ID');
      }
      
      const userId = propertyRequest.user_id;
      const chatSubject = `Property Request: ${propertyRequest.title || 'Property'}`;
      
      console.log('Creating conversation with:', { 
        participant_1_id: profile.id, 
        participant_2_id: userId,
        requestId 
      });
      
      let conversationId;
      const { data: existingConversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('property_request_id', requestId)
        .or(`and(participant_1_id.eq.${userId},participant_2_id.eq.${profile.id}),and(participant_1_id.eq.${profile.id},participant_2_id.eq.${userId})`)
        .limit(1);

      if (existingConversations && existingConversations.length > 0) {
        conversationId = existingConversations[0].id;
      } else {
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert([{
            participant_1_id: profile.id,
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

      return conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Conversation created",
        description: "A conversation has been created. You can now send your message.",
      });
    },
    onError: (error) => {
      console.error('Send reply error:', error);
      toast({
        title: "Error",
        description: `Failed to create conversation: ${error.message}`,
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

      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (conversationError || !conversation) {
        console.error('Conversation not found:', conversationError);
        throw new Error('Conversation not found');
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
