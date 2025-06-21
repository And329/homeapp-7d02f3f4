
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePropertyDeletion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const requestDeletionMutation = useMutation({
    mutationFn: async (propertyRequestId: string) => {
      console.log('usePropertyDeletion: Requesting deletion for property request:', propertyRequestId);
      
      const { error } = await supabase.rpc('request_property_deletion', {
        property_request_id: propertyRequestId
      });

      if (error) {
        console.error('usePropertyDeletion: Error requesting deletion:', error);
        throw error;
      }

      console.log('usePropertyDeletion: Deletion request successful');
    },
    onSuccess: () => {
      toast({
        title: "Deletion requested",
        description: "Your deletion request has been submitted for admin review.",
      });
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user-property-requests'] });
    },
    onError: (error: any) => {
      console.error('usePropertyDeletion: Failed to request deletion:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to request deletion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approveDeletionMutation = useMutation({
    mutationFn: async (propertyRequestId: string) => {
      console.log('usePropertyDeletion: Approving deletion for property request:', propertyRequestId);
      
      const { error } = await supabase.rpc('approve_property_deletion', {
        property_request_id: propertyRequestId
      });

      if (error) {
        console.error('usePropertyDeletion: Error approving deletion:', error);
        throw error;
      }

      console.log('usePropertyDeletion: Deletion approval successful');
    },
    onSuccess: () => {
      toast({
        title: "Property deleted",
        description: "The property has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error: any) => {
      console.error('usePropertyDeletion: Failed to approve deletion:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve deletion. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    requestDeletion: requestDeletionMutation.mutateAsync,
    approveDeletion: approveDeletionMutation.mutateAsync,
    isRequestingDeletion: requestDeletionMutation.isPending,
    isApprovingDeletion: approveDeletionMutation.isPending,
  };
};
