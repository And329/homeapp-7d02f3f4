import React, { useState, useEffect, useRef } from 'react';
import { Send, User, X, Paperclip, Photo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useConversations';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedChatWindowProps {
  conversationId: string;
  otherUserName: string;
  onClose?: () => void;
}

const EnhancedChatWindow: React.FC<EnhancedChatWindowProps> = ({
  conversationId,
  otherUserName,
  onClose
}) => {
  const { user, profile } = useAuth();
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [conversationTitle, setConversationTitle] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, messagesLoading, sendMessage, isSendingMessage } = useMessages(conversationId);

  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!conversationId || !user) return;
      
      console.log('ChatWindow: Fetching conversation details for:', conversationId);
      
      try {
        // Get conversation details
        const { data: conversation, error } = await supabase
          .from('conversations')
          .select('participant_1_id, participant_2_id, is_admin_support, subject')
          .eq('id', conversationId)
          .single();

        if (error) {
          console.error('ChatWindow: Error fetching conversation:', error);
          return;
        }

        console.log('ChatWindow: Conversation details:', conversation);

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
          setConversationTitle('Administrator');
          return;
        }

        console.log('ChatWindow: Other participant profile:', otherProfile);

        // Set the display name - Always show "Administrator" for admin users when viewed by regular users
        let displayName = 'Administrator';
        if (otherProfile) {
          if (otherProfile.role === 'admin') {
            // Always show "Administrator" for admin users, regardless of who's viewing
            displayName = 'Administrator';
          } else if (otherProfile.full_name) {
            displayName = otherProfile.full_name;
          } else if (otherProfile.email) {
            displayName = otherProfile.email;
          } else {
            displayName = 'User';
          }
        }

        setConversationTitle(displayName);
        console.log('ChatWindow: Set conversation title to:', displayName);

      } catch (error) {
        console.error('ChatWindow: Error in fetchConversationDetails:', error);
        setConversationTitle('Administrator');
      }
    };
    
    fetchConversationDetails();
  }, [conversationId, user, profile]);

  // Fetch user names for message senders
  useEffect(() => {
    const fetchUserNames = async () => {
      if (messages.length === 0) return;
      
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const namesMap: Record<string, string> = {};
      
      try {
        console.log('ChatWindow: Fetching user names for sender IDs:', senderIds);
        
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .in('id', senderIds);
        
        if (error) {
          console.error('ChatWindow: Error fetching user profiles:', error);
          return;
        }

        console.log('ChatWindow: Fetched profiles:', profiles);
        
        if (profiles) {
          profiles.forEach(profileData => {
            if (profileData.role === 'admin') {
              // Always show "Administrator" for admin users
              namesMap[profileData.id] = 'Administrator';
            } else if (profileData.full_name) {
              namesMap[profileData.id] = profileData.full_name;
            } else if (profileData.email) {
              namesMap[profileData.id] = profileData.email;
            } else {
              namesMap[profileData.id] = 'User';
            }
          });
        }
        
        console.log('ChatWindow: Names map:', namesMap);
        setUserNames(namesMap);
      } catch (error) {
        console.error('ChatWindow: Error fetching user names:', error);
      }
    };
    
    fetchUserNames();
  }, [messages, profile]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!messagesLoading && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, messagesLoading]);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, just send a message indicating a file was shared
      sendMessage({ content: `📎 Shared a file: ${file.name}` });
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, just send a message indicating a photo was shared
      sendMessage({ content: `📷 Shared a photo: ${file.name}` });
    }
  };

  const getUserDisplayName = (senderId: string) => {
    if (senderId === user?.id) {
      return 'You';
    }
    
    return userNames[senderId] || 'Administrator';
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
            <span>Administrator</span>
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

        {/* Message input with file upload */}
        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
          <div className="flex gap-2 items-end">
            <div className="flex gap-1">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => photoInputRef.current?.click()}
                className="p-2"
              >
                <Photo className="h-4 w-4" />
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="p-2"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={handleKeyPress}
              disabled={isSendingMessage}
              className="text-sm flex-1"
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

export default EnhancedChatWindow;
