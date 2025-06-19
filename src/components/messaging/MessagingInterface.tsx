
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
    <div className="flex flex-col lg:flex-row gap-4 h-[70vh] min-h-[500px] max-h-[800px]">
      {/* Conversations List */}
      <div className="w-full lg:w-1/3 flex-shrink-0">
        <ConversationsList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.id}
        />
      </div>
      
      {/* Chat Window */}
      <div className="w-full lg:w-2/3 flex-grow">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation.id}
            otherUserName={selectedConversation.otherUserName}
          />
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">Select a conversation</p>
              <p className="text-gray-400 text-sm">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingInterface;
