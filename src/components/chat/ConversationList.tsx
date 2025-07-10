import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfiles, getDisplayName } from '@/hooks/useUserProfiles';
import { Conversation } from '@/hooks/useChat';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  isLoading: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  isLoading,
}) => {
  const { user } = useAuth();

  // Get all unique user IDs from conversations
  const userIds = React.useMemo(() => {
    const ids = new Set<string>();
    conversations.forEach(conv => {
      ids.add(conv.participant_1_id);
      ids.add(conv.participant_2_id);
    });
    return Array.from(ids);
  }, [conversations]);

  const { data: profiles = {} } = useUserProfiles(userIds);

  const getOtherParticipantId = (conversation: Conversation) => {
    return conversation.participant_1_id === user?.id
      ? conversation.participant_2_id
      : conversation.participant_1_id;
  };

  const getConversationTitle = (conversation: Conversation) => {
    const otherParticipantId = getOtherParticipantId(conversation);
    const otherProfile = profiles[otherParticipantId];
    return getDisplayName(otherProfile);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Conversations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-3 text-sm text-gray-600">Loading conversations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Conversations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100%-80px)]">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="text-gray-400 mb-2">
                <MessageCircle className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-gray-400 text-sm">
                Conversations will appear here when you start chatting
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  title={getConversationTitle(conversation)}
                  isActive={conversation.id === activeConversationId}
                  onClick={() => onConversationSelect(conversation.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};