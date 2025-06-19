
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface UnifiedChatProps {
  otherUserId?: string;
  propertyTitle?: string;
  propertyId?: string;
  propertyRequestId?: string;
  onClose?: () => void;
  className?: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  conversation_id: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

const UnifiedChat: React.FC<UnifiedChatProps> = ({
  otherUserId,
  propertyTitle = 'Property Chat',
  propertyId,
  propertyRequestId,
  onClose,
  className = '',
}) => {
  const { user, profile } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch other user's profile
  const { data: otherUserProfile } = useQuery({
    queryKey: ['user-profile', otherUserId],
    queryFn: async () => {
      if (!otherUserId) return null;
      
      console.log('UnifiedChat: Fetching profile for user:', otherUserId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', otherUserId)
        .maybeSingle();

      if (error) {
        console.error('UnifiedChat: Error fetching user profile:', error);
        return null;
      }
      
      console.log('UnifiedChat: Other user profile:', data);
      return data as Profile;
    },
    enabled: !!otherUserId,
  });

  // Find or create conversation using the database function
  const { data: conversation, isLoading: loadingConversation, error: conversationError } = useQuery({
    queryKey: ['conversation', user?.id, otherUserId, propertyId, propertyRequestId],
    queryFn: async () => {
      if (!user || !otherUserId) {
        throw new Error('Missing user information');
      }

      if (user.id === otherUserId) {
        throw new Error('Cannot create conversation with yourself');
      }

      console.log('UnifiedChat: Creating/finding conversation between:', user.id, 'and', otherUserId);

      // Use the database function to create or find conversation
      const { data, error } = await supabase.rpc('create_conversation', {
        p_participant_1_id: user.id,
        p_participant_2_id: otherUserId,
        p_subject: propertyTitle || 'Chat',
        p_property_id: propertyId || null,
        p_property_request_id: propertyRequestId || null
      });

      if (error) {
        console.error('UnifiedChat: Error with conversation function:', error);
        throw error;
      }

      console.log('UnifiedChat: Conversation ID:', data);

      // Now fetch the full conversation details
      const { data: conversationData, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) {
        console.error('UnifiedChat: Error fetching conversation:', fetchError);
        throw fetchError;
      }

      console.log('UnifiedChat: Conversation details:', conversationData);
      return conversationData;
    },
    enabled: !!user && !!otherUserId,
    retry: 1,
  });

  // Update conversationId when conversation data changes
  useEffect(() => {
    if (conversation) {
      console.log('UnifiedChat: Setting conversation ID:', conversation.id);
      setConversationId(conversation.id);
    }
  }, [conversation]);

  // Fetch messages for the conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      console.log('UnifiedChat: Fetching messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('UnifiedChat: Error fetching messages:', error);
        return [];
      }

      console.log('UnifiedChat: Fetched messages:', data?.length || 0);
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user || !conversationId || !newMessage.trim()) {
        throw new Error('Missing required data for sending message');
      }

      console.log('UnifiedChat: Sending message');

      const { error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim(),
        }]);

      if (error) {
        console.error('UnifiedChat: Error sending message:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      setNewMessage('');
      scrollToBottom();
    },
    onError: (error: any) => {
      console.error('UnifiedChat: Send message error:', error);
      toast({
        title: 'Error sending message',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const getUserDisplayName = (userId: string) => {
    if (userId === user?.id) {
      return profile?.full_name || profile?.email || 'You';
    } else {
      return otherUserProfile?.full_name || otherUserProfile?.email || 'User';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && conversationId) {
      sendMessageMutation.mutate();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!otherUserId) {
    return (
      <Card className={`flex flex-col ${className}`}>
        <CardHeader className="flex-shrink-0 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold">
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a conversation to start messaging</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadingConversation) {
    return (
      <Card className={`flex flex-col ${className}`}>
        <CardHeader className="flex-shrink-0 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold">
            Loading Chat...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>Setting up conversation...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (conversationError) {
    return (
      <Card className={`flex flex-col ${className}`}>
        <CardHeader className="flex-shrink-0 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold">
            Chat Error
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-red-600">
            <p className="mb-2">Failed to load conversation</p>
            <p className="text-sm">{conversationError.message}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['conversation'] })}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="flex-shrink-0 pb-2 sm:pb-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg font-semibold truncate">
              Chat with {getUserDisplayName(otherUserId)}
            </CardTitle>
            {propertyTitle && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                Re: {propertyTitle}
              </p>
            )}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0 ml-2 h-6 w-6 sm:h-8 sm:w-8 p-0"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-2 sm:p-6 pt-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 space-y-2 sm:space-y-3 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-xs lg:max-w-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="font-medium text-[10px] sm:text-xs mb-1 opacity-75">
                  {getUserDisplayName(message.sender_id)}
                </div>
                <div className="leading-relaxed break-words">{message.content}</div>
                <div className="text-[9px] sm:text-[10px] mt-1 opacity-60">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="flex-shrink-0 flex gap-1 sm:gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={sendMessageMutation.isPending || !conversationId}
            className="text-xs sm:text-sm h-8 sm:h-10"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending || !conversationId}
            size="sm"
            className="h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedChat;
