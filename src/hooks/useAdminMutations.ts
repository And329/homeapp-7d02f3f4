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
      
      let chatId;
      const { data: existingChats } = await supabase
        .from('admin_chats')
        .select('id')
        .eq('user_id', userId)
        .eq('subject', chatSubject)
        .limit(1);

      if (existingChats && existingChats.length > 0) {
        chatId = existingChats[0].id;
      } else {
        const { data: newChat, error: chatError } = await supabase
          .from('admin_chats')
          .insert([{
            user_id: userId,
            subject: chatSubject,
            admin_id: profile!.id,
            status: 'open'
          }])
          .select()
          .single();

        if (chatError) {
          console.error('Chat creation error:', chatError);
          throw chatError;
        }
        chatId = newChat.id;
      }

      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          chat_id: chatId,
          sender_id: profile!.id,
          message
        }]);

      if (messageError) {
        console.error('Message creation error:', messageError);
        throw messageError;
      }

      await supabase
        .from('admin_chats')
        .update({ 
          updated_at: new Date().toISOString(),
          admin_id: profile!.id
        })
        .eq('id', chatId);

      const { error: replyError } = await supabase
        .from('property_request_replies')
        .insert([{
          request_id: requestId,
          admin_id: profile!.id,
          message
        }]);

      if (replyError) {
        console.error('Reply creation error:', replyError);
        throw replyError;
      }

      return chatId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-chats'] });
      toast({
        title: "Reply sent",
        description: "Your reply has been sent to the user and a chat has been created.",
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
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          chat_id: chatId,
          sender_id: profile!.id,
          message
        }]);

      if (error) throw error;

      await supabase
        .from('admin_chats')
        .update({ 
          updated_at: new Date().toISOString(),
          admin_id: profile!.id
        })
        .eq('id', chatId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-chats'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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
