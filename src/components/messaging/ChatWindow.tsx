
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useConversations';
import { supabase } from '@/integrations/supabase/client';

interface ChatWindowProps {
  conversationId: string;
  otherUserName: string;
  onClose?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  otherUserName,
  onClose
}) => {
  const { user, profile } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [conversationOtherUser, setConversationOtherUser] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const { messages, messagesLoading, sendMessage, isSendingMessage } = useMessages(conversationId);

  // Fetch conversation details and other participant info
  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!conversationId || !user) return;
      
      console.log('ChatWindow: Fetching conversation details for:', conversationId);
      
      try {
        const { data: conversation, error } = await supabase
          .from('conversations')
          .select('participant_1_id, participant_2_id')
          .eq('id', conversationId)
          .single();

        if (error) {
          console.error('ChatWindow: Error fetching conversation:', error);
          return;
        }

        // Determine the other participant
        const otherParticipantId = conversation.participant_1_id === user.id 
          ? conversation.participant_2_id 
          : conversation.participant_1_id;

        console.log('ChatWindow: Other participant ID:', otherParticipantId);

        // Fetch the other participant's profile
        const { data: otherProfile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', otherParticipantId)
          .single();

        if (profileError) {
          console.error('ChatWindow: Error fetching other participant profile:', profileError);
          return;
        }

        console.log('ChatWindow: Other participant profile:', otherProfile);

        // Set the display name based on role and available info
        let displayName = 'Unknown User';
        if (otherProfile) {
          if (otherProfile.role === 'admin') {
            displayName = 'Admin Support';
          } else {
            displayName = otherProfile.full_name || otherProfile.email || 'User';
          }
        }

        setConversationOtherUser(displayName);
        console.log('ChatWindow: Set conversation other user to:', displayName);

      } catch (error) {
        console.error('ChatWindow: Error in fetchConversationDetails:', error);
      }
    };
    
    fetchConversationDetails();
  }, [conversationId, user]);

  // Fetch user names for message senders
  useEffect(() => {
    const fetchUserNames = async () => {
      if (messages.length === 0) return;
      
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const namesMap: Record<string, string> = {};
      
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .in('id', senderIds);
        
        if (profiles) {
          profiles.forEach(profile => {
            if (profile.role === 'admin') {
              namesMap[profile.id] = 'Admin Support';
            } else {
              namesMap[profile.id] = profile.full_name || profile.email || 'User';
            }
          });
        }
        
        setUserNames(namesMap);
      } catch (error) {
        console.error('ChatWindow: Error fetching user names:', error);
      }
    };
    
    fetchUserNames();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Handle initial scroll and new messages
  useEffect(() => {
    if (!messagesLoading && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, messagesLoading]);

  // Reset scroll when conversation changes
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [conversationId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage({ content: newMessage.trim() });
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserDisplayName = (senderId: string) => {
    if (senderId === user?.id) {
      return profile?.full_name || profile?.email || 'You';
    }
    
    // Use fetched user names first, then fallback to the conversation other user name
    return userNames[senderId] || conversationOtherUser || otherUserName || 'User';
  };

  if (!conversationId) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 py-3 px-4 border-b">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{conversationOtherUser || otherUserName}</span>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        {/* Messages area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
        >
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-3 text-sm text-gray-600">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-gray-300 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation by sending a message below</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="font-medium text-xs mb-1 opacity-75">
                    {getUserDisplayName(message.sender_id)}
                  </div>
                  <div className="leading-relaxed break-words">{message.content}</div>
                  <div className="text-xs mt-1 opacity-60">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={handleKeyPress}
              disabled={isSendingMessage}
              className="text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSendingMessage}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
