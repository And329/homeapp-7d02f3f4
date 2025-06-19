
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminConversation = (adminUser: any, isCurrentUserAdmin: boolean) => {
  const { user } = useAuth();

  // Check if user already has a conversation with admin
  const { data: existingConversation } = useQuery({
    queryKey: ['existing-admin-conversation', user?.id, adminUser?.id],
    queryFn: async () => {
      if (!user || !adminUser) return null;

      console.log('useAdminConversation: Checking for existing conversation between:', user.id, 'and', adminUser.id);

      const { data, error } = await supabase
        .from('conversations')
        .select('id, subject')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .or(`participant_1_id.eq.${adminUser.id},participant_2_id.eq.${adminUser.id}`)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('useAdminConversation: Error fetching existing conversation:', error);
        return null;
      }

      console.log('useAdminConversation: Existing conversation:', data);
      return data;
    },
    enabled: !!user && !!adminUser && !isCurrentUserAdmin,
  });

  return { existingConversation };
};
