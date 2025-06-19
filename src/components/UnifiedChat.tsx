
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
  const { user } = useAuth();
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
        .single();

      if (error) {
        console.error('UnifiedChat: Error fetching user profile:', error);
        return null;
      }
      
      console.log('UnifiedChat: Found user profile:', data);
      return data as Profile;
    },
    enabled: !!otherUserId,
  });

  // Fetch current user's profile
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('UnifiedChat: Fetching current user profile:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('UnifiedChat: Error fetching current user profile:', error);
        return null;
      }
      
      console.log('UnifiedChat: Current user profile:', data);
      return data as Profile;
    },
    enabled: !!user,
  });

  const { data: conversation, isLoading: loadingConversation } = useQuery({
    queryKey: ['conversation', user?.id, otherUserId, propertyId, propertyRequestId],
    queryFn: async () => {
      if (!user || !otherUserId) return null;

      let query = supabase
        .from('conversations')
        .select('*')
        .eq('participant_1_id', user.id)
        .eq('participant_2_id', otherUserId);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      if (propertyRequestId) {
        query = query.eq('property_request_id', propertyRequestId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error fetching conversation:', error);
        return null;
      }

      return data;
    },
    enabled: !!user && !!otherUserId,
  });

  // Update conversationId when conversation data changes
  useEffect(() => {
    if (conversation) {
      setConversationId(conversation.id);
    }
  }, [conversation]);

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data as Message[];
    },
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user || !conversationId) {
        throw new Error('User or conversation ID is missing');
      }

      const { error } = await supabase.from('messages').insert([
        {
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage,
        },
      ]);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversation', user?.id, otherUserId, propertyId, propertyRequestId] });
      setNewMessage('');
      scrollToBottom();
    },
    onError: (error: any) => {
      toast({
        title: 'Error sending message',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const getUserDisplayName = (userId: string) => {
    if (userId === user?.id) {
      return currentUserProfile?.full_name || currentUserProfile?.email || 'You';
    } else {
      return otherUserProfile?.full_name || otherUserProfile?.email || 'User';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show message if no otherUserId is provided
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
            disabled={sendMessageMutation.isPending}
            className="text-xs sm:text-sm h-8 sm:h-10"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
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
