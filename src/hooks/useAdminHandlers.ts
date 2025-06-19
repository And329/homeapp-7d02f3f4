
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PropertyRequest } from '@/types/propertyRequest';

export const useAdminHandlers = (
  queryClient: any,
  sendReplyMutation: any,
  setReplyingToRequest: (id: string | null) => void,
  setReplyMessage: (message: string) => void
) => {
  const { toast } = useToast();

  const handleApproveRequest = async (request: PropertyRequest) => {
    console.log('useAdminHandlers: Approving request:', request.id);
    console.log('useAdminHandlers: Original requester user_id:', request.user_id);
    
    try {
      // Use the database function to approve the request
      // This function will create the property with the correct owner_id
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

      // Refresh the requests list
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
      setReplyingToRequest(null);
      setReplyMessage('');
    } catch (error) {
      console.error('useAdminHandlers: Failed to send reply:', error);
      // Error handling is done in the mutation itself
    }
  };

  return {
    handleApproveRequest,
    handleRejectRequest,
    handleSendReply,
  };
};
