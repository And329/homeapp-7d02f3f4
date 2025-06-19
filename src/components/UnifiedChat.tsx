
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, useMessages } from '@/hooks/useConversations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedChatProps {
  className?: string;
}

const UnifiedChat: React.FC<UnifiedChatProps> = ({ className }) => {
  const { user } = useAuth();
  const { conversations, conversationsLoading } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const { messages, messagesLoading, sendMessage, isSendingMessage } = useMessages(selectedConversationId);

  // Get property details for conversations
  const { data: properties = [] } = useQuery({
    queryKey: ['chat-properties'],
    queryFn: async () => {
      const propertyIds = conversations
        .filter(conv => conv.property_id)
        .map(conv => conv.property_id);
      
      if (propertyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('properties')
        .select('id, title')
        .in('id', propertyIds);

      if (error) throw error;
      return data || [];
    },
    enabled: conversations.length > 0,
  });

  // Get property request details for conversations
  const { data: propertyRequests = [] } = useQuery({
    queryKey: ['chat-property-requests'],
    queryFn: async () => {
      const requestIds = conversations
        .filter(conv => conv.property_request_id)
        .map(conv => conv.property_request_id);
      
      if (requestIds.length === 0) return [];

      const { data, error } = await supabase
        .from('property_requests')
        .select('id, title')
        .in('id', requestIds);

      if (error) throw error;
      return data || [];
    },
    enabled: conversations.length > 0,
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    
    sendMessage({ content: newMessage });
    setNewMessage('');
  };

  const getConversationTitle = (conversation: any) => {
    if (conversation.property_id) {
      const property = properties.find(p => p.id === conversation.property_id); // Both are strings now
      return property ? `Property: ${property.title}` : conversation.subject;
    }
    
    if (conversation.property_request_id) {
      const request = propertyRequests.find(r => r.id === conversation.property_request_id); // Both are strings now
      return request ? `Request: ${request.title}` : conversation.subject;
    }
    
    return conversation.subject;
  };

  if (!user) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-gray-500">Please log in to view your messages.</p>
        </CardContent>
      </Card>
    );
  }

  if (conversationsLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex", className)}>
      <div className="w-1/3 border-r">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(100%-80px)]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={cn(
                  "p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                  selectedConversationId === conversation.id && "bg-blue-50 border-blue-200"
                )}
              >
                <div className="font-medium text-sm truncate">
                  {getConversationTitle(conversation)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  with {conversation.other_participant?.full_name || conversation.other_participant?.email || 'Unknown'}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(conversation.last_message_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            <CardHeader>
              <CardTitle className="text-lg">
                {conversations.find(c => c.id === selectedConversationId)?.subject}
              </CardTitle>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender_id === user.id ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] p-3 rounded-lg",
                          message.sender_id === user.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a conversation to start chatting</p>
          </CardContent>
        )}
      </div>
    </Card>
  );
};

export default UnifiedChat;
