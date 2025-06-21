
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useMessageNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTime, setLastReadTime] = useState<Date>(new Date());

  // Get conversations for the current user
  const { data: conversations = [] } = useQuery({
    queryKey: ['user-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select('id, last_message_at, participant_1_id, participant_2_id')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('useMessageNotifications: Error fetching conversations:', error);
        return [];
      }

      console.log('useMessageNotifications: Found conversations:', data?.length || 0);
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
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('useMessageNotifications: Error fetching latest message:', error);
          return null;
        }
        return data;
      });

      const results = await Promise.all(promises);
      const validResults = results.filter(Boolean);
      console.log('useMessageNotifications: Latest messages:', validResults.length);
      return validResults;
    },
    enabled: conversations.length > 0,
  });

  // Calculate unread count based on messages after last read time
  useEffect(() => {
    if (!user || !latestMessages.length) {
      setUnreadCount(0);
      return;
    }

    // Count messages from others that are newer than last read time
    const newUnreadCount = latestMessages.filter(message => 
      message &&
      message.sender_id !== user.id && 
      new Date(message.created_at) > lastReadTime
    ).length;

    console.log('useMessageNotifications: Unread count:', newUnreadCount);
    setUnreadCount(newUnreadCount);
  }, [latestMessages, user, lastReadTime]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    console.log('useMessageNotifications: Setting up real-time subscription');

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
          console.log('useMessageNotifications: New message received:', payload);
          // Check if this message is for a conversation the user is part of
          const conversationIds = conversations.map(c => c.id);
          if (conversationIds.includes(payload.new.conversation_id)) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('useMessageNotifications: Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, conversations]);

  const markAsRead = () => {
    console.log('useMessageNotifications: Marking messages as read');
    setLastReadTime(new Date());
    setUnreadCount(0);
  };

  return {
    unreadCount,
    markAsRead,
  };
};
