
import React, { useState, useEffect } from 'react';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MessagingInterface: React.FC = () => {
  const { user, profile } = useAuth();
  const { conversations } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [conversationTitles, setConversationTitles] = useState<Record<string, string>>({});

  // Fetch conversation titles and other participant info
  useEffect(() => {
    const fetchConversationTitles = async () => {
      if (!conversations.length || !user) return;
      
      const titles: Record<string, string> = {};
      
      for (const conversation of conversations) {
        try {
          // Determine the other participant
          const otherParticipantId = conversation.participant_1_id === user.id 
            ? conversation.participant_2_id 
            : conversation.participant_1_id;

          // Get the other participant's profile
          const { data: otherProfile, error } = await supabase
            .from('profiles')
            .select('full_name, email, role')
            .eq('id', otherParticipantId)
            .single();

          if (error) {
            console.error('Error fetching participant profile:', error);
            titles[conversation.id] = conversation.subject || 'Support';
            continue;
          }

          // Set display name based on role and profile info
          if (otherProfile?.role === 'admin') {
            titles[conversation.id] = 'Support';
          } else if (profile?.role === 'admin') {
            // Admin viewing user conversation - show user info and subject
            const userName = otherProfile?.full_name || otherProfile?.email || 'User';
            titles[conversation.id] = `${userName}`;
          } else {
            // Regular user viewing admin conversation
            titles[conversation.id] = 'Support';
          }
        } catch (error) {
          console.error('Error processing conversation:', error);
          titles[conversation.id] = conversation.subject || 'Support';
        }
      }
      
      setConversationTitles(titles);
    };

    fetchConversationTitles();
  }, [conversations, user, profile]);

  const handleConversationSelect = (conversation: any) => {
    setSelectedConversation(conversation.id);
    setSelectedChatUserId(
      conversation.participant_1_id === user?.id 
        ? conversation.participant_2_id 
        : conversation.participant_1_id
    );
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const otherUserName = selectedConversationData 
    ? conversationTitles[selectedConversationData.id] || 'Support'
    : '';

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[70vh] min-h-[500px] max-h-[800px]">
      {/* Conversations List */}
      <div className="w-full lg:w-1/3 flex-shrink-0">
        <ConversationsList
          conversations={conversations.map(conv => ({
            ...conv,
            displayTitle: conversationTitles[conv.id] || conv.subject || 'Support'
          }))}
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
          currentUserId={user?.id || ''}
        />
      </div>
      
      {/* Chat Window */}
      <div className="w-full lg:w-2/3 flex-grow">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation}
            otherUserName={otherUserName}
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
