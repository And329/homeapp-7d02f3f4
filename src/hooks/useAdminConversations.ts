
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ADMIN_EMAIL = '329@riseup.net';

export const useAdminConversations = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAdminConversationMutation = useMutation({
    mutationFn: async ({ requestId, userId }: { requestId: string; userId: string }) => {
      // Only allow the specific admin email to create conversations
      if (!user || !profile?.email || profile.email !== ADMIN_EMAIL) {
        throw new Error('Only the designated admin can create conversations');
      }

      console.log('useAdminConversations: Creating admin conversation for request:', requestId, 'with user:', userId);

      // Use the new create_admin_conversation function
      const { data: conversationId, error } = await supabase.rpc('create_admin_conversation', {
        p_admin_id: user.id,
        p_user_id: userId,
        p_property_request_id: requestId,
        p_subject: 'Property Request Support'
      });

      if (error) {
        console.error('useAdminConversations: Error creating admin conversation:', error);
        throw error;
      }

      console.log('useAdminConversations: Created admin conversation:', conversationId);
      return conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
    },
    onError: (error) => {
      console.error('useAdminConversations: Failed to create admin conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    createAdminConversation: createAdminConversationMutation.mutateAsync,
    isCreating: createAdminConversationMutation.isPending,
  };
};
