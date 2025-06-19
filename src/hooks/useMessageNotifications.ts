
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useMessageNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Get conversations for the current user
  const { data: conversations = [] } = useQuery({
    queryKey: ['user-conversations'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          last_message_at,
          participant_1_id,
          participant_2_id
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Get latest message for each conversation to check if user has seen it
  const { data: latestMessages = [] } = useQuery({
    queryKey: ['latest-messages', conversations.map(c => c.id)],
    queryFn: async () => {
      if (conversations.length === 0) return [];

      const promises = conversations.map(async (conversation) => {
        const { data, error } = await supabase
          .from('messages')
          .select('id, sender_id, created_at, conversation_id')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
      });

      const results = await Promise.all(promises);
      return results.filter(Boolean);
    },
    enabled: conversations.length > 0,
  });

  // Calculate unread count
  useEffect(() => {
    if (!user || !latestMessages.length) {
      setUnreadCount(0);
      return;
    }

    // For simplicity, we'll count messages from the last hour that aren't from the current user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentUnreadCount = latestMessages.filter(message => 
      message &&
      message.sender_id !== user.id && 
      new Date(message.created_at) > oneHourAgo
    ).length;

    setUnreadCount(recentUnreadCount);
  }, [latestMessages, user]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id.neq.${user.id}`,
        },
        (payload) => {
          // Check if this message is for a conversation the user is part of
          const conversationIds = conversations.map(c => c.id);
          if (conversationIds.includes(payload.new.conversation_id)) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversations]);

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return {
    unreadCount,
    markAsRead,
  };
};
