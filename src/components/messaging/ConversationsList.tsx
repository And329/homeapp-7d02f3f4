
import React, { useEffect, useState } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string, otherUserId: string, otherUserName: string) => void;
  selectedConversationId?: string;
}

interface ConversationWithDetails {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  subject: string;
  is_admin_support: boolean;
  last_message_at: string;
  created_at: string;
  other_participant: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    profile_picture?: string | null;
  };
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  onSelectConversation,
  selectedConversationId
}) => {
  const { user } = useAuth();
  const { conversations, conversationsLoading } = useConversations();
  const [conversationsWithDetails, setConversationsWithDetails] = useState<ConversationWithDetails[]>([]);

  // Fetch detailed conversation information including participant profiles
  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!user || !conversations || conversations.length === 0) {
        setConversationsWithDetails([]);
        return;
      }

      console.log('ConversationsList: Fetching details for conversations:', conversations.length);

      try {
        const conversationsWithProfiles = await Promise.all(
          conversations.map(async (conversation) => {
            const otherParticipantId = conversation.participant_1_id === user.id 
              ? conversation.participant_2_id 
              : conversation.participant_1_id;

            console.log('ConversationsList: Fetching profile for participant:', otherParticipantId);

            // Fetch the other participant's profile
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('id, full_name, email, role, profile_picture')
              .eq('id', otherParticipantId)
              .single();

            if (error) {
              console.error('ConversationsList: Error fetching profile for:', otherParticipantId, error);
              // Return conversation with fallback data
              return {
                ...conversation,
                other_participant: {
                  id: otherParticipantId,
                  full_name: null,
                  email: null,
                  role: null,
                  profile_picture: null,
                }
              };
            }

            console.log('ConversationsList: Got profile:', profile);

            return {
              ...conversation,
              other_participant: profile
            };
          })
        );

        console.log('ConversationsList: All conversations with details:', conversationsWithProfiles);
        setConversationsWithDetails(conversationsWithProfiles);
      } catch (error) {
        console.error('ConversationsList: Error fetching conversation details:', error);
        setConversationsWithDetails([]);
      }
    };

    fetchConversationDetails();
  }, [conversations, user]);

  const getDisplayName = (participant: ConversationWithDetails['other_participant']) => {
    // For admin users, always show "Administrator"
    if (participant.role === 'admin') {
      return 'Administrator';
    }
    
    // For regular users, show full name, email, or fallback
    if (participant.full_name) {
      return participant.full_name;
    }
    
    if (participant.email) {
      return participant.email;
    }
    
    return 'User';
  };

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

  if (conversationsWithDetails.length === 0) {
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
          <span>Conversations ({conversationsWithDetails.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversationsWithDetails.map((conversation) => {
          const otherParticipant = conversation.other_participant;
          const displayName = getDisplayName(otherParticipant);
          const isSelected = selectedConversationId === conversation.id;
          
          return (
            <Button
              key={conversation.id}
              variant={isSelected ? "default" : "ghost"}
              className={`w-full p-3 h-auto text-left justify-start ${
                isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectConversation(conversation.id, otherParticipant.id, displayName)}
            >
              <div className="flex items-center space-x-3 w-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParticipant.profile_picture || undefined} />
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
