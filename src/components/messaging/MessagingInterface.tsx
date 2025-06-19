
import React, { useState } from 'react';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';

const MessagingInterface: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    otherUserId: string;
    otherUserName: string;
  } | null>(null);

  const handleSelectConversation = (conversationId: string, otherUserId: string, otherUserName: string) => {
    setSelectedConversation({
      id: conversationId,
      otherUserId,
      otherUserName
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      <div className="lg:col-span-1">
        <ConversationsList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.id}
        />
      </div>
      <div className="lg:col-span-2">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation.id}
            otherUserName={selectedConversation.otherUserName}
          />
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingInterface;
