
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

  // Fetch other user's profile with better error handling
  const { data: otherUserProfile } = useQuery({
    queryKey: ['user-profile', otherUserId],
    queryFn: async () => {
      if (!otherUserId) {
        console.log('UnifiedChat: No otherUserId provided');
        return null;
      }
      
      console.log('UnifiedChat: Fetching profile for user:', otherUserId);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', otherUserId)
          .maybeSingle();

        if (error) {
          console.error('UnifiedChat: Error fetching user profile:', error);
          return null;
        }
        
        if (!data) {
          console.warn('UnifiedChat: No profile found for user:', otherUserId);
          // Return a fallback profile
          return {
            id: otherUserId,
            full_name: null,
            email: null
          } as Profile;
        }
        
        console.log('UnifiedChat: Found user profile:', data);
        return data as Profile;
      } catch (error) {
        console.error('UnifiedChat: Exception fetching user profile:', error);
        return null;
      }
    },
    enabled: !!otherUserId,
  });

  // Fetch current user's profile with better error handling
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('UnifiedChat: No current user');
        return null;
      }
      
      console.log('UnifiedChat: Fetching current user profile:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('UnifiedChat: Error fetching current user profile:', error);
          return null;
        }
        
        if (!data) {
          console.warn('UnifiedChat: No profile found for current user:', user.id);
          // Return a fallback profile
          return {
            id: user.id,
            full_name: null,
            email: user.email || null
          } as Profile;
        }
        
        console.log('UnifiedChat: Current user profile:', data);
        return data as Profile;
      } catch (error) {
        console.error('UnifiedChat: Exception fetching current user profile:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  // Find or create conversation with comprehensive error handling
  const { data: conversation, isLoading: loadingConversation, error: conversationError } = useQuery({
    queryKey: ['conversation', user?.id, otherUserId, propertyId, propertyRequestId],
    queryFn: async () => {
      if (!user || !otherUserId) {
        console.log('UnifiedChat: Missing user or otherUserId:', { user: user?.id, otherUserId });
        throw new Error('Missing user information');
      }

      if (user.id === otherUserId) {
        console.log('UnifiedChat: Cannot create conversation with self');
        throw new Error('Cannot create conversation with yourself');
      }

      console.log('UnifiedChat: Looking for conversation between:', user.id, 'and', otherUserId);

      try {
        // Look for existing conversation between these two users
        let query = supabase
          .from('conversations')
          .select('*')
          .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`);

        if (propertyId) {
          query = query.eq('property_id', propertyId);
        }

        if (propertyRequestId) {
          query = query.eq('property_request_id', propertyRequestId);
        }

        const { data: existingConversation, error: findError } = await query.maybeSingle();

        if (findError) {
          console.error('UnifiedChat: Error finding conversation:', findError);
          throw new Error(`Failed to find conversation: ${findError.message}`);
        }

        if (existingConversation) {
          console.log('UnifiedChat: Found existing conversation:', existingConversation);
          return existingConversation;
        }

        // Create new conversation if none exists
        console.log('UnifiedChat: Creating new conversation');
        
        const conversationData = {
          participant_1_id: user.id,
          participant_2_id: otherUserId,
          property_id: propertyId || null,
          property_request_id: propertyRequestId || null,
          subject: propertyTitle || 'General Chat',
        };

        console.log('UnifiedChat: Conversation data to insert:', conversationData);

        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert(conversationData)
          .select()
          .single();

        if (createError) {
          console.error('UnifiedChat: Error creating conversation:', createError);
          throw new Error(`Failed to create conversation: ${createError.message}`);
        }

        console.log('UnifiedChat: Created new conversation:', newConversation);
        return newConversation;
        
      } catch (error) {
        console.error('UnifiedChat: Exception in conversation query:', error);
        throw error;
      }
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

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) {
        console.log('UnifiedChat: No conversation ID for messages query');
        return [];
      }

      console.log('UnifiedChat: Fetching messages for conversation:', conversationId);
      
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('UnifiedChat: Error fetching messages:', error);
          return [];
        }

        console.log('UnifiedChat: Fetched messages:', data);
        return data as Message[];
      } catch (error) {
        console.error('UnifiedChat: Exception fetching messages:', error);
        return [];
      }
    },
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!conversationId) {
        throw new Error('No conversation available');
      }
      
      if (!newMessage.trim()) {
        throw new Error('Message cannot be empty');
      }

      console.log('UnifiedChat: Sending message:', { 
        conversationId, 
        message: newMessage.substring(0, 50),
        senderId: user.id 
      });

      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage.trim(),
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) {
        console.error('UnifiedChat: Error sending message:', error);
        throw new Error(`Failed to send message: ${error.message}`);
      }
      
      console.log('UnifiedChat: Message sent successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversation', user?.id, otherUserId, propertyId, propertyRequestId] });
      setNewMessage('');
      scrollToBottom();
    },
    onError: (error: any) => {
      console.error('UnifiedChat: Send message mutation error:', error);
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

  // Show loading state
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

  // Show error state
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
              onClick={() => window.location.reload()}
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
