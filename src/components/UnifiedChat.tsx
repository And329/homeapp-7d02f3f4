
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useConversations, useMessages, type Conversation } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';

interface UnifiedChatProps {
  propertyId?: number;
  propertyRequestId?: string;
  otherUserId?: string;
  propertyTitle?: string;
  onClose?: () => void;
  className?: string;
}

const UnifiedChat: React.FC<UnifiedChatProps> = ({
  propertyId,
  propertyRequestId,
  otherUserId,
  propertyTitle,
  onClose,
  className = ""
}) => {
  const { user } = useAuth();
  const { conversations, conversationsLoading, createConversationAsync } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const { messages, sendMessage, isSendingMessage } = useMessages(selectedConversation);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-select conversation if starting a new chat
  useEffect(() => {
    if (otherUserId && propertyTitle && !selectedConversation) {
      const existingConv = conversations.find(conv => 
        (conv.participant_1_id === otherUserId || conv.participant_2_id === otherUserId) &&
        (propertyId ? conv.property_id === propertyId : true) &&
        (propertyRequestId ? conv.property_request_id === propertyRequestId : true)
      );

      if (existingConv) {
        setSelectedConversation(existingConv.id);
      } else {
        // Create new conversation
        createConversationAsync({
          otherUserId,
          propertyId,
          propertyRequestId,
          subject: `Inquiry about: ${propertyTitle}`
        }).then(conv => {
          setSelectedConversation(conv.id);
        });
      }
    }
  }, [otherUserId, propertyTitle, conversations, selectedConversation, createConversationAsync, propertyId, propertyRequestId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessage({ content: newMessage.trim() });
    setNewMessage('');
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Please log in to start a conversation</p>
        </CardContent>
      </Card>
    );
  }

  if (conversationsLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          {selectedConversation && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedConversation(null)}
              className="lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle>
            {selectedConv ? 
              `Chat with ${selectedConv.other_participant?.full_name || 'User'}` : 
              'Messages'
            }
          </CardTitle>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex h-96">
          {/* Conversations List */}
          <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 border-r pr-4`}>
            <div className="space-y-2 h-full overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {conversation.other_participant?.profile_picture ? (
                          <img 
                            src={conversation.other_participant.profile_picture} 
                            alt={conversation.other_participant.full_name || 'User'} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {conversation.other_participant?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.subject}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(conversation.last_message_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} w-full lg:w-2/3 lg:pl-4`}>
            {selectedConversation ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2 border rounded-lg bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Start the conversation by sending a message!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            message.sender_id === user.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 border'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSendingMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedChat;
