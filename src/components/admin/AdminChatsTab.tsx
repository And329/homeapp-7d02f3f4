
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { useAdminHandlers } from '@/hooks/useAdminHandlers';
import { useAdminMutations } from '@/hooks/useAdminMutations';

const AdminChatsTab: React.FC = () => {
  const { profile } = useAuth();
  const mutations = useAdminMutations(profile, []);
  
  const {
    selectedConversation,
    selectedChatUserId,
    newMessage,
    setNewMessage,
    handleConversationSelect,
    handleSendChatMessage,
  } = useAdminHandlers(mutations, []);

  const {
    conversations,
    messages,
  } = useAdminQueries(selectedConversation, selectedChatUserId);

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Conversations</CardTitle>
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
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id 
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
                            {conversation.subject}
                          </p>
                          <p className="text-xs text-gray-500">
                            Participants: {conversation.participant_1_id.slice(0, 8)}... & {conversation.participant_2_id.slice(0, 8)}...
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
                  <div className="border-b pb-2 mb-4">
                    <h3 className="font-medium">
                      {selectedConv ? selectedConv.subject : 'Conversation'}
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2 border rounded-lg bg-gray-50">
                    {messages.length === 0 ? (
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
                            <p className="text-sm">{message.content}</p>
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
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendChatMessage}
                      disabled={!newMessage.trim()}
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
