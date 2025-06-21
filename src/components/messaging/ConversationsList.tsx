
import React from 'react';
import { MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConversationsListProps {
  conversations: any[];
  selectedConversation: string | null;
  onConversationSelect: (conversation: any) => void;
  currentUserId: string;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  currentUserId,
}) => {
  // Fetch profiles for all conversation participants
  const { data: profiles = [] } = useQuery({
    queryKey: ['conversation-profiles'],
    queryFn: async () => {
      const participantIds = conversations.flatMap(conv => [
        conv.participant_1_id,
        conv.participant_2_id
      ]).filter(Boolean);

      if (participantIds.length === 0) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', participantIds);

      if (error) {
        console.error('Error fetching profiles:', error);
        return [];
      }

      return data || [];
    },
    enabled: conversations.length > 0,
  });

  const getOtherParticipantName = (conversation: any) => {
    const otherParticipantId = conversation.participant_1_id === currentUserId 
      ? conversation.participant_2_id 
      : conversation.participant_1_id;
    
    const profile = profiles.find(p => p.id === otherParticipantId);
    
    if (profile) {
      return profile.full_name || profile.email || 'Unknown User';
    }
    
    return 'Loading...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {conversations.map((conversation) => {
          const isSelected = selectedConversation === conversation.id;
          const otherParticipantName = getOtherParticipantName(conversation);
          
          return (
            <Button
              key={conversation.id}
              variant={isSelected ? "secondary" : "ghost"}
              className={`w-full p-3 h-auto text-left justify-start ${
                isSelected ? 'bg-primary/10 border-primary/20' : 'hover:bg-gray-50'
              }`}
              onClick={() => onConversationSelect(conversation)}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {otherParticipantName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(conversation.last_message_at)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {conversation.subject}
                  </p>
                  {conversation.is_admin_support && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-1">
                      Admin Support
                    </span>
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ConversationsList;
