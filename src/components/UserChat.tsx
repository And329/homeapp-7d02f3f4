
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserChatProps {
  propertyId?: number;
  propertyRequestId?: string;
  ownerId: string;
  propertyTitle: string;
  onClose?: () => void;
}

interface UserChatData {
  id: string;
  property_id: number | null;
  property_request_id: string | null;
  requester_id: string;
  owner_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  profile_picture: string | null;
}

const UserChat: React.FC<UserChatProps> = ({
  propertyId,
  propertyRequestId,
  ownerId,
  propertyTitle,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get or create chat
  const { data: chat } = useQuery({
    queryKey: ['user-chat', propertyId, propertyRequestId, ownerId],
    queryFn: async () => {
      if (!user) return null;

      let query = supabase
        .from('user_chats')
        .select('*')
        .eq('requester_id', user.id)
        .eq('owner_id', ownerId);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      if (propertyRequestId) {
        query = query.eq('property_request_id', propertyRequestId);
      }

      const { data: existingChat } = await query.single();

      if (existingChat) {
        setChatId(existingChat.id);
        return existingChat as UserChatData;
      }

      // Create new chat
      const { data: newChat, error } = await supabase
        .from('user_chats')
        .insert([{
          property_id: propertyId || null,
          property_request_id: propertyRequestId || null,
          requester_id: user.id,
          owner_id: ownerId,
          subject: `Inquiry about: ${propertyTitle}`,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      setChatId(newChat.id);
      return newChat as UserChatData;
    },
    enabled: !!user && !!ownerId,
  });

  // Get chat messages
  const { data: messages = [] } = useQuery({
    queryKey: ['user-chat-messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];

      const { data, error } = await supabase
        .from('user_chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as UserChatMessage[];
    },
    enabled: !!chatId,
  });

  // Get owner profile
  const { data: ownerProfile } = useQuery({
    queryKey: ['profile', ownerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ownerId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!ownerId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!chatId || !user) throw new Error('Chat not initialized');

      const { error } = await supabase
        .from('user_chat_messages')
        .insert([{
          chat_id: chatId,
          sender_id: user.id,
          message
        }]);

      if (error) throw error;

      // Update chat timestamp
      await supabase
        .from('user_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-chat-messages', chatId] });
      setNewMessage('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Please log in to start a conversation</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            {ownerProfile?.profile_picture ? (
              <img 
                src={ownerProfile.profile_picture} 
                alt={ownerProfile.full_name || 'User'} 
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <CardTitle className="text-lg">
              Chat with {ownerProfile?.full_name || 'Property Owner'}
            </CardTitle>
            <p className="text-sm text-gray-600">{propertyTitle}</p>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="h-80 overflow-y-auto space-y-3 mb-4 p-2 border rounded-lg bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Start the conversation by sending a message</p>
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
                  <p className="text-sm">{message.message}</p>
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
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserChat;
