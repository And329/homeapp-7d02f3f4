import React from 'react';
import { useChat } from '@/hooks/useChat';
import { ConversationList } from './ConversationList';
import { MessageWindow } from './MessageWindow';
import { EmptyState } from './EmptyState';

export const ChatInterface: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversationId,
    conversationsLoading,
    messagesLoading,
    isSendingMessage,
    sendMessage,
    setActiveConversation,
  } = useChat();

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[70vh] min-h-[500px] max-h-[800px]">
      {/* Conversations List */}
      <div className="w-full lg:w-1/3 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onConversationSelect={setActiveConversation}
          isLoading={conversationsLoading}
        />
      </div>
      
      {/* Chat Window */}
      <div className="w-full lg:w-2/3 flex-grow">
        {activeConversationId ? (
          <MessageWindow
            conversationId={activeConversationId}
            messages={messages}
            isLoading={messagesLoading}
            isSending={isSendingMessage}
            onSendMessage={sendMessage}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};