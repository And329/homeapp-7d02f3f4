
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PropertyRequest } from '@/types/propertyRequest';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  type: 'rent' | 'sale';
  is_hot_deal: boolean;
  description: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[] | null;
  images: string[] | null;
}

export const useAdminHandlers = (
  queryClient: any,
  sendReplyMutation: any,
  sendChatMessageMutation: any,
  deleteMutation: any,
  state: any
) => {
  const { toast } = useToast();

  const handleApproveRequest = async (request: PropertyRequest) => {
    console.log('useAdminHandlers: Approving request:', request.id);
    console.log('useAdminHandlers: Original requester user_id:', request.user_id);
    
    try {
      // Use the database function to approve the request
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
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    } catch (error) {
      console.error('useAdminHandlers: Failed to approve request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
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
    } catch (error) {
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
    
    try {
      await sendReplyMutation.mutateAsync({ requestId });
      state.setReplyingToRequest(null);
      state.setReplyMessage('');
    } catch (error) {
      console.error('useAdminHandlers: Failed to send reply:', error);
    }
  };

  const handleEdit = (property: Property) => {
    state.setEditingProperty(property);
    state.setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleApprovalSubmit = async (requestId: string, updatedData: any) => {
    console.log('Handling approval submit:', { requestId, updatedData });
    // Implementation for approval submit if needed
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
    handleEdit,
    handleDelete,
    handleApprovalSubmit,
    handleSendChatMessage,
    handleConversationSelect,
  };
};
