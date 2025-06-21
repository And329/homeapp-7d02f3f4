
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PropertyRequest } from '@/types/propertyRequest';
import { Property } from '@/types/property';
import { usePropertyDeletion } from '@/hooks/usePropertyDeletion';

export const useAdminHandlers = (
  queryClient: any,
  sendReplyMutation: any,
  sendChatMessageMutation: any,
  deleteMutation: any,
  state: any
) => {
  const { toast } = useToast();
  const { approveDeletion } = usePropertyDeletion();

  const handleApproveRequest = async (request: PropertyRequest) => {
    console.log('useAdminHandlers: Approving request:', request.id);
    console.log('useAdminHandlers: Original requester user_id:', request.user_id);
    
    try {
      const { data, error } = await supabase.rpc('approve_property_request', {
        request_id: request.id
      });

      if (error) {
        console.error('useAdminHandlers: Error approving request:', error);
        throw error;
      }

      console.log('useAdminHandlers: Request approved successfully, created property ID:', data);

      toast({
        title: "Request approved",
        description: "The property request has been approved and the property has been created.",
      });

      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    } catch (error: any) {
      console.error('useAdminHandlers: Failed to approve request:', error);
      toast({
        title: "Error",
        description: `Failed to approve request: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    console.log('useAdminHandlers: Rejecting request:', requestId);
    
    try {
      const { error } = await supabase
        .from('property_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        console.error('useAdminHandlers: Error rejecting request:', error);
        throw error;
      }

      console.log('useAdminHandlers: Request rejected successfully');

      toast({
        title: "Request rejected",
        description: "The property request has been rejected.",
      });

      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
    } catch (error: any) {
      console.error('useAdminHandlers: Failed to reject request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendReply = async (requestId: string) => {
    console.log('useAdminHandlers: Sending reply for request:', requestId);
    console.log('useAdminHandlers: Reply message:', state.replyMessage);
    
    if (!state.replyMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First create/get the conversation
      console.log('useAdminHandlers: Creating conversation...');
      const conversationId = await sendReplyMutation.mutateAsync({ requestId });
      console.log('useAdminHandlers: Got conversation ID:', conversationId);
      
      // Then send the message immediately
      if (conversationId && state.replyMessage.trim()) {
        console.log('useAdminHandlers: Sending message to conversation:', conversationId);
        await sendChatMessageMutation.mutateAsync({
          conversationId,
          message: state.replyMessage.trim()
        });
        console.log('useAdminHandlers: Message sent successfully');
        
        // Clear the form
        state.setReplyingToRequest(null);
        state.setReplyMessage('');
        
        toast({
          title: "Reply sent",
          description: "Your reply has been sent successfully.",
        });
      }
    } catch (error: any) {
      console.error('useAdminHandlers: Failed to send reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveDeletion = async (requestId: string) => {
    console.log('useAdminHandlers: Approving deletion for request:', requestId);
    
    try {
      await approveDeletion(requestId);
    } catch (error: any) {
      console.error('useAdminHandlers: Failed to approve deletion:', error);
    }
  };

  const handleEdit = (property: Property) => {
    state.setEditingProperty(property);
    state.setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    console.log('useAdminHandlers: Attempting to delete property with ID:', id);
    
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        console.log('useAdminHandlers: Confirmed deletion, calling mutation...');
        await deleteMutation.mutateAsync(id);
        console.log('useAdminHandlers: Property deleted successfully');
      } catch (error: any) {
        console.error('useAdminHandlers: Error deleting property:', error);
        toast({
          title: "Error",
          description: `Failed to delete property: ${error.message || 'Please try again.'}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleApprovalSubmit = async (requestId: string, updatedData: any) => {
    console.log('Handling approval submit:', { requestId, updatedData });
  };

  const handleReviewRequest = (request: PropertyRequest) => {
    state.setApprovingRequest(request);
    state.setIsApprovalFormOpen(true);
  };

  const handleSendChatMessage = async () => {
    if (!state.newMessage.trim() || !state.selectedConversation) return;
    
    try {
      await sendChatMessageMutation.mutateAsync({
        conversationId: state.selectedConversation,
        message: state.newMessage
      });
      state.setNewMessage('');
    } catch (error) {
      console.error('Failed to send chat message:', error);
    }
  };

  const handleConversationSelect = (conversation: any) => {
    state.setSelectedConversation(conversation.id);
    state.setSelectedChatUserId(
      conversation.participant_1_id === state.profile?.id 
        ? conversation.participant_2_id 
        : conversation.participant_1_id
    );
  };

  return {
    handleApproveRequest,
    handleRejectRequest,
    handleSendReply,
    handleApproveDeletion,
    handleEdit,
    handleDelete,
    handleApprovalSubmit,
    handleReviewRequest,
    handleSendChatMessage,
    handleConversationSelect,
  };
};
