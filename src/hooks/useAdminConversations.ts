
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAdminConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAdminConversationMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('useAdminConversations: Creating admin support conversation for user:', user.id);

      // Find admin user ID - try multiple approaches
      let adminUserId = null;
      
      // First try to find by email
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', '329@riseup.net')
        .maybeSingle();

      if (adminProfile) {
        adminUserId = adminProfile.id;
      } else {
        // Fallback: find by role
        const { data: adminByRole } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .maybeSingle();
        
        if (adminByRole) {
          adminUserId = adminByRole.id;
        }
      }

      if (!adminUserId) {
        console.error('useAdminConversations: No admin profile found');
        throw new Error('Admin support is currently unavailable');
      }

      console.log('useAdminConversations: Found admin user ID:', adminUserId);

      // Create admin support conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: user.id,
          participant_2_id: adminUserId,
          subject: `Admin Support - ${user.email || 'User'}`,
          is_admin_support: true
        })
        .select()
        .single();

      if (error) {
        console.error('useAdminConversations: Error creating admin conversation:', error);
        throw error;
      }

      console.log('useAdminConversations: Created admin conversation:', conversation);
      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('useAdminConversations: Failed to create admin conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start admin chat. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    createAdminConversation: createAdminConversationMutation.mutateAsync,
    isCreating: createAdminConversationMutation.isPending,
  };
};
