
import React from 'react';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string, otherUserId: string, otherUserName: string) => void;
  selectedConversationId?: string;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  onSelectConversation,
  selectedConversationId
}) => {
  const { user } = useAuth();
  const { conversations, conversationsLoading } = useConversations();

  if (!user) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">Please sign in to view conversations</p>
        </CardContent>
      </Card>
    );
  }

  if (conversationsLoading) {
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading conversations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Conversations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No conversations yet</p>
            <p className="text-gray-400">Start chatting with property owners or admins!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 py-3 px-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <MessageCircle className="h-5 w-5" />
          <span>Conversations ({conversations.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.map((conversation) => {
          const otherUserId = conversation.participant_1_id === user.id 
            ? conversation.participant_2_id 
            : conversation.participant_1_id;
          
          const otherUser = conversation.other_participant;
          const displayName = otherUser?.full_name || otherUser?.email || 'Unknown User';
          
          const isSelected = selectedConversationId === conversation.id;
          
          return (
            <Button
              key={conversation.id}
              variant={isSelected ? "default" : "ghost"}
              className={`w-full p-3 h-auto text-left justify-start ${
                isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectConversation(conversation.id, otherUserId, displayName)}
            >
              <div className="flex items-center space-x-3 w-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherUser?.profile_picture} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">{displayName}</div>
                  <div className="text-xs opacity-75 truncate">{conversation.subject}</div>
                  <div className="text-xs opacity-50">
                    {new Date(conversation.last_message_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ConversationsList;
