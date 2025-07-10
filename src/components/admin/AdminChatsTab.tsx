
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, MessageCircle } from 'lucide-react';
import FileAttachment from '@/components/FileAttachment';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminMutations } from '@/hooks/useAdminMutations';
import { useAdminHandlers } from '@/hooks/useAdminHandlers';
import { useAdminState } from '@/hooks/useAdminState';
import { useQueryClient } from '@tanstack/react-query';

const AdminChatsTab: React.FC = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const state = useAdminState();
  const mutations = useAdminMutations(profile, []);
  
  const handlers = useAdminHandlers(
    queryClient,
    mutations.sendReplyMutation,
    mutations.sendChatMessageMutation,
    mutations.deleteMutation,
    state
  );

  // Fetch all conversations for admin
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversation_details')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin conversations:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile?.role && profile.role === 'admin',
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-messages', state.selectedConversation],
    queryFn: async () => {
      if (!state.selectedConversation) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', state.selectedConversation)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!state.selectedConversation,
  });

  const selectedConv = conversations.find(c => c.id === state.selectedConversation);

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Loading conversations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-96">
            {/* Conversations List */}
            <div className={`${state.selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 border-r pr-4`}>
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
                      onClick={() => handlers.handleConversationSelect(conversation)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        state.selectedConversation === conversation.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {conversation.subject || 'Support'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {conversation.participant_1_role === 'admin' ? conversation.participant_2_name : conversation.participant_1_name}
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
            <div className={`${state.selectedConversation ? 'block' : 'hidden lg:block'} w-full lg:w-2/3 lg:pl-4`}>
              {state.selectedConversation ? (
                <div className="flex flex-col h-full">
                  <div className="border-b pb-2 mb-4">
                    <h3 className="font-medium">
                      {selectedConv ? selectedConv.subject : 'Conversation'}
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2 border rounded-lg bg-gray-50">
                    {messagesLoading ? (
                      <div className="text-center text-gray-500 py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p>Loading messages...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No messages in this conversation yet</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg ${
                              message.sender_id === profile?.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 border'
                            }`}
                          >
                            {/* Display file attachment if present */}
                            {message.file_url && message.file_name ? (
                              <div className="mb-2">
                                <FileAttachment
                                  fileName={message.file_name}
                                  fileUrl={message.file_url}
                                  fileType={message.file_type || 'application/octet-stream'}
                                  fileSize={message.file_size || 0}
                                />
                              </div>
                            ) : null}
                            
                            {/* Always display content if it exists */}
                            {message.content && (
                              <p className="text-sm">{message.content}</p>
                            )}
                            
                            <p className={`text-xs mt-1 ${
                              message.sender_id === profile?.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message as admin..."
                      value={state.newMessage}
                      onChange={(e) => state.setNewMessage(e.target.value)}
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlers.handleSendChatMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handlers.handleSendChatMessage}
                      disabled={!state.newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChatsTab;
