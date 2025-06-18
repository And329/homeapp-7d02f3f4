
import React from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PropertyRequest } from '@/types/propertyRequest';

interface Chat {
  id: string;
  user_id: string;
  admin_id: string | null;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface AdminChatsTabProps {
  chats: Chat[];
  chatMessages: ChatMessage[];
  selectedChat: string | null;
  selectedChatUserId: string | null;
  selectedUserRequests: PropertyRequest[];
  newMessage: string;
  profileId: string;
  sendChatMessageMutation: any;
  setNewMessage: (message: string) => void;
  onChatSelect: (chat: Chat) => void;
  onSendChatMessage: () => void;
}

const AdminChatsTab: React.FC<AdminChatsTabProps> = ({
  chats,
  chatMessages,
  selectedChat,
  selectedChatUserId,
  selectedUserRequests,
  newMessage,
  profileId,
  sendChatMessageMutation,
  setNewMessage,
  onChatSelect,
  onSendChatMessage,
}) => {
  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') {
      return `AED ${price.toLocaleString()}/month`;
    }
    return `AED ${price.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Chat List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>User Chats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {chats.length === 0 ? (
              <p className="text-gray-500 text-sm">No user chats yet.</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedChat === chat.id ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{chat.subject}</h4>
                    <div className="flex items-center gap-2">
                      {chat.admin_id && (
                        <span className="text-xs text-green-600">Assigned</span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        chat.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {chat.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(chat.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat Messages */}
      <div className="lg:col-span-2">
        <Card className="h-96">
          <CardHeader>
            <CardTitle>
              {selectedChat ? 
                chats.find(c => c.id === selectedChat)?.subject || 'Chat' : 
                'Select a chat'
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            {selectedChat ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === profileId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.sender_id === profileId
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
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
                        onSendChatMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={onSendChatMessage}
                    disabled={!newMessage.trim() || sendChatMessageMutation.isPending}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Profile & Listings */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedChatUserId ? (
              <div className="space-y-4">
                <h4 className="font-medium">Property Listings ({selectedUserRequests.length})</h4>
                {selectedUserRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm">No property requests from this user.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedUserRequests.map((request) => (
                      <div key={request.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-sm">{request.title}</h5>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-xs text-gray-600">{request.location}</p>
                        <p className="text-xs text-primary font-bold">
                          {formatPrice(request.price, request.type)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select a chat to view user profile</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminChatsTab;
