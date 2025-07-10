import React from 'react';
import { Conversation } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
  conversation: Conversation;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  title,
  isActive,
  onClick,
}) => {
  const lastMessageTime = formatDistanceToNow(new Date(conversation.last_message_at), {
    addSuffix: true,
  });

  return (
    <div
      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
        isActive ? 'bg-primary/10 border-r-2 border-primary' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className={`font-medium text-sm ${isActive ? 'text-primary' : 'text-gray-900'}`}>
          {title}
        </h3>
        <span className="text-xs text-gray-500">{lastMessageTime}</span>
      </div>
      <p className="text-xs text-gray-600 truncate">{conversation.subject}</p>
    </div>
  );
};