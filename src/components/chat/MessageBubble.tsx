import React from 'react';
import { Message } from '@/hooks/useChat';
import FileAttachment from '../FileAttachment';

interface MessageBubbleProps {
  message: Message;
  senderName: string;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  senderName,
  isOwnMessage,
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
          isOwnMessage
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <div className="font-medium text-xs mb-1 opacity-75">
          {senderName}
        </div>
        
        {/* Display file attachment if present */}
        {message.file_url && message.file_name ? (
          <div className="mb-2">
            <FileAttachment
              fileName={message.file_name}
              fileUrl={message.file_url}
              fileType={message.file_type || 'application/octet-stream'}
              fileSize={message.file_size || 0}
            />
          </div>
        ) : null}
        
        {/* Always display content if it exists */}
        {message.content && (
          <div className="leading-relaxed break-words">{message.content}</div>
        )}
        
        <div className="text-xs mt-1 opacity-60">
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  );
};