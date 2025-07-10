import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfiles, getDisplayName } from '@/hooks/useUserProfiles';
import { Message } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { EmptyMessages } from './EmptyMessages';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
}) => {
  const { user } = useAuth();

  // Get unique sender IDs
  const senderIds = React.useMemo(() => {
    return Array.from(new Set(messages.map(m => m.sender_id)));
  }, [messages]);

  const { data: profiles = {} } = useUserProfiles(senderIds);

  const getSenderName = (senderId: string) => {
    if (senderId === user?.id) return 'You';
    return getDisplayName(profiles[senderId]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-gray-600">Loading messages...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return <EmptyMessages />;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          senderName={getSenderName(message.sender_id)}
          isOwnMessage={message.sender_id === user?.id}
        />
      ))}
    </div>
  );
};