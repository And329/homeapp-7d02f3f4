
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, useMessages } from '@/hooks/useConversations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Shield, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedChatProps {
  className?: string;
  propertyId?: string;
  propertyRequestId?: string;
  otherUserId?: string;
  propertyTitle?: string;
  onClose?: () => void;
}

const UnifiedChat: React.FC<UnifiedChatProps> = ({ 
  className,
  propertyId,
  propertyRequestId,
  otherUserId,
  propertyTitle,
  onClose
}) => {
  const { user } = useAuth();
  const { conversations, conversationsLoading, createConversationAsync } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const { messages, messagesLoading, sendMessage, isSendingMessage } = useMessages(selectedConversationId);

  // Determine if this is a specific property conversation (hide sidebar)
  const isPropertySpecificChat = !!(otherUserId && propertyTitle);

  // If specific conversation parameters are provided, create or find the conversation
  React.useEffect(() => {
    if (otherUserId && propertyTitle && user) {
      const initializeConversation = async () => {
        try {
          const conversation = await createConversationAsync({
            otherUserId,
            propertyId,
            propertyRequestId,
            subject: propertyTitle
          });
          setSelectedConversationId(conversation.id);
        } catch (error) {
          console.error('Failed to initialize conversation:', error);
        }
      };
      
      initializeConversation();
    }
  }, [otherUserId, propertyId, propertyRequestId, propertyTitle, user, createConversationAsync]);

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
    enabled: conversations.length > 0 && !isPropertySpecificChat,
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
    enabled: conversations.length > 0 && !isPropertySpecificChat,
  });

  // Get participant profiles to check for admin status and names
  const { data: participantProfiles = [] } = useQuery({
    queryKey: ['chat-participant-profiles'],
    queryFn: async () => {
      let participantIds: string[] = [];

      if (isPropertySpecificChat && otherUserId) {
        participantIds = [otherUserId];
      } else {
        participantIds = conversations
          .map(conv => conv.other_participant?.id)
          .filter(Boolean) as string[];
      }
      
      if (participantIds.length === 0) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, profile_picture')
        .in('id', participantIds);

      if (error) throw error;
      return data || [];
    },
    enabled: (conversations.length > 0 && !isPropertySpecificChat) || (isPropertySpecificChat && !!otherUserId),
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    
    sendMessage({ content: newMessage });
    setNewMessage('');
  };

  const getConversationTitle = (conversation: any) => {
    if (conversation.property_id) {
      const property = properties.find(p => p.id === conversation.property_id);
      return property ? `Property: ${property.title}` : conversation.subject;
    }
    
    if (conversation.property_request_id) {
      const request = propertyRequests.find(r => r.id === conversation.property_request_id);
      return request ? `Request: ${request.title}` : conversation.subject;
    }
    
    return conversation.subject;
  };

  const getParticipantProfile = (participantId: string) => {
    return participantProfiles.find(p => p.id === participantId);
  };

  const isParticipantAdmin = (participantId: string) => {
    const profile = getParticipantProfile(participantId);
    return profile?.role === 'admin';
  };

  const getParticipantName = (participantId: string, fallbackName?: string) => {
    const profile = getParticipantProfile(participantId);
    return profile?.full_name || fallbackName || 'User';
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherParticipant = selectedConversation?.other_participant || (isPropertySpecificChat && otherUserId ? { id: otherUserId } : null);
  const isAdminChat = otherParticipant && isParticipantAdmin(otherParticipant.id);
  const otherProfile = otherParticipant ? getParticipantProfile(otherParticipant.id) : null;
  const otherParticipantName = otherParticipant ? getParticipantName(otherParticipant.id, 'full_name' in otherParticipant ? otherParticipant.full_name : undefined) : 'Unknown';

  if (!user) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Please log in to view your messages.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (conversationsLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex shadow-lg", className)}>
      {/* Conversations Sidebar - Hidden for property-specific chats */}
      {!isPropertySpecificChat && (
        <div className="w-full sm:w-1/3 border-r bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between bg-white border-b p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="hidden sm:inline">Messages</span>
              <span className="sm:hidden">Chat</span>
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </CardHeader>
          <ScrollArea className="h-[calc(100%-60px)] sm:h-[calc(100%-80px)]">
            {conversations.length === 0 ? (
              <div className="p-4 sm:p-6 text-center">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-gray-400" />
                <p className="text-gray-500 text-xs sm:text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">Start by contacting a property owner</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const isAdmin = conversation.other_participant && isParticipantAdmin(conversation.other_participant.id);
                const profile = conversation.other_participant ? getParticipantProfile(conversation.other_participant.id) : null;
                const participantName = conversation.other_participant ? getParticipantName(conversation.other_participant.id, conversation.other_participant.full_name) : 'Unknown';
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={cn(
                      "p-3 sm:p-4 border-b cursor-pointer hover:bg-white transition-colors relative",
                      selectedConversationId === conversation.id && "bg-white border-l-4 border-l-primary shadow-sm"
                    )}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="relative">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {profile?.profile_picture ? (
                            <img 
                              src={profile.profile_picture} 
                              alt={participantName} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          )}
                        </div>
                        {isAdmin && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 sm:p-1">
                            <Shield className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          <div className="font-medium text-xs sm:text-sm truncate">
                            {participantName}
                          </div>
                          {isAdmin && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 px-1 py-0">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 truncate mb-1">
                          {getConversationTitle(conversation)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(conversation.last_message_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>
        </div>
      )}

      {/* Chat Area - Full width for property-specific chats */}
      <div className={cn("flex-1 flex flex-col bg-white", isPropertySpecificChat && "w-full")}>
        {selectedConversationId ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b bg-gray-50 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {otherProfile?.profile_picture ? (
                        <img 
                          src={otherProfile.profile_picture} 
                          alt={otherParticipantName} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                      )}
                    </div>
                    {isAdminChat && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 sm:p-1">
                        <Shield className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <CardTitle className="text-sm sm:text-lg truncate">
                        {otherParticipantName}
                      </CardTitle>
                      {isAdminChat && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          <Shield className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                          <span className="hidden sm:inline">Trusted Admin</span>
                          <span className="sm:hidden">Admin</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{propertyTitle || selectedConversation?.subject}</p>
                  </div>
                </div>
                {isPropertySpecificChat && onClose && (
                  <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-3 sm:p-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-2 text-sm sm:text-base">No messages yet</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Start the conversation by sending a message below</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((message, index) => {
                    const isFromCurrentUser = message.sender_id === user.id;
                    const isFromAdmin = !isFromCurrentUser && isAdminChat;
                    
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isFromCurrentUser ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "flex items-end gap-1 sm:gap-2 max-w-[85%] sm:max-w-[75%]",
                          isFromCurrentUser ? "flex-row-reverse" : "flex-row"
                        )}>
                          {!isFromCurrentUser && (
                            <div className="relative">
                              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {otherProfile?.profile_picture ? (
                                  <img 
                                    src={otherProfile.profile_picture} 
                                    alt="Profile" 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <User className="h-2 w-2 sm:h-3 sm:w-3 text-gray-500" />
                                )}
                              </div>
                              {isFromAdmin && (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                  <Shield className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div
                            className={cn(
                              "px-3 py-2 sm:px-4 sm:py-2 rounded-2xl shadow-sm",
                              isFromCurrentUser
                                ? "bg-primary text-white"
                                : isFromAdmin
                                ? "bg-green-50 text-green-900 border border-green-200"
                                : "bg-gray-100 text-gray-900"
                            )}
                          >
                            <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              isFromCurrentUser ? "text-white/70" : "text-gray-500"
                            )}>
                              {new Date(message.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t bg-gray-50">
              <div className="flex gap-2 sm:gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isAdminChat ? "Message trusted admin..." : "Type your message..."}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1 text-sm sm:text-base"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSendingMessage}
                  size="sm"
                  className="px-3 sm:px-4"
                >
                  {isSendingMessage ? (
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2 text-sm sm:text-base">
                {isPropertySpecificChat ? "Starting conversation..." : "Select a conversation"}
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                {isPropertySpecificChat 
                  ? "Setting up your chat about this property" 
                  : "Choose a conversation from the sidebar to start chatting"
                }
              </p>
            </div>
          </CardContent>
        )}
      </div>
    </Card>
  );
};

export default UnifiedChat;
