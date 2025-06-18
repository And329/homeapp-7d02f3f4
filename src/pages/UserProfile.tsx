
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Clock, CheckCircle, XCircle, Send, Plus, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PropertyRequest } from '@/types/propertyRequest';
import PropertyCard from '@/components/PropertyCard';

interface AdminReply {
  id: string;
  request_id: string;
  admin_id: string;
  message: string;
  created_at: string;
}

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

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newChatSubject, setNewChatSubject] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user's property requests
  const { data: userRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['user-property-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('property_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(request => {
        const type = (request.type === 'rent' || request.type === 'sale') ? request.type : 'rent';
        
        return {
          ...request,
          type: type as 'rent' | 'sale',
          images: Array.isArray(request.images) ? request.images.filter((img): img is string => typeof img === 'string') : [],
          videos: Array.isArray(request.videos) ? request.videos.filter((video): video is string => typeof video === 'string') : [],
          amenities: Array.isArray(request.amenities) ? request.amenities.filter((amenity): amenity is string => typeof amenity === 'string') : null,
        } as PropertyRequest;
      });
    },
    enabled: !!user,
  });

  // Fetch admin replies for rejected requests
  const { data: adminReplies = [] } = useQuery({
    queryKey: ['admin-replies', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('property_request_replies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminReply[];
    },
    enabled: !!user,
  });

  // Fetch user's chats
  const { data: chats = [] } = useQuery({
    queryKey: ['user-chats', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('admin_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Chat[];
    },
    enabled: !!user,
  });

  // Fetch messages for selected chat
  const { data: chatMessages = [] } = useQuery({
    queryKey: ['chat-messages', selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', selectedChat)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!selectedChat,
  });

  // Create new chat
  const createChatMutation = useMutation({
    mutationFn: async (subject: string) => {
      const { data, error } = await supabase
        .from('admin_chats')
        .insert([{ user_id: user!.id, subject }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-chats'] });
      setNewChatSubject('');
      setShowNewChatForm(false);
      toast({
        title: "Chat created",
        description: "Your chat with admin has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create chat. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{ chat_id: chatId, sender_id: user!.id, message }]);

      if (error) throw error;

      // Update chat's updated_at timestamp
      await supabase
        .from('admin_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedChat] });
      queryClient.invalidateQueries({ queryKey: ['user-chats'] });
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

  // Auto-scroll to bottom when messages change or when a chat is selected
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [chatMessages, selectedChat]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { icon: CheckCircle, className: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { icon: XCircle, className: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleSendMessage = () => {
    if (!selectedChat || !newMessage.trim()) return;
    sendMessageMutation.mutate({ chatId: selectedChat, message: newMessage.trim() });
  };

  const handleCreateChat = () => {
    if (!newChatSubject.trim()) return;
    createChatMutation.mutate(newChatSubject.trim());
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">Please log in to view your profile.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your property listings and communicate with admin</p>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="chat">Admin Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your listings...</p>
                  </div>
                ) : userRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You haven't submitted any property listings yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userRequests.map((request) => {
                      const replies = adminReplies.filter(reply => reply.request_id === request.id);
                      
                      // Transform PropertyRequest to match what PropertyCard expects
                      const transformedProperty = {
                        id: request.id,
                        title: request.title,
                        price: request.price,
                        location: request.location,
                        bedrooms: request.bedrooms,
                        bathrooms: request.bathrooms,
                        area: 1000, // Default area since it's not in PropertyRequest
                        image: Array.isArray(request.images) && request.images.length > 0 
                          ? request.images[0] 
                          : '/placeholder.svg',
                        type: request.type,
                        isHotDeal: false,
                        description: request.description,
                        amenities: Array.isArray(request.amenities) ? request.amenities : []
                      };
                      
                      return (
                        <div key={request.id} className="relative">
                          <PropertyCard property={transformedProperty} />
                          <div className="absolute top-4 right-4 z-10">
                            {getStatusBadge(request.status)}
                          </div>
                          
                          {request.status === 'rejected' && replies.length > 0 && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                              <h4 className="font-medium text-red-800 mb-2">Admin Reply:</h4>
                              {replies.map((reply) => (
                                <div key={reply.id} className="text-red-700 text-sm">
                                  <p>{reply.message}</p>
                                  <p className="text-xs text-red-600 mt-1">
                                    {new Date(reply.created_at).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Chats</CardTitle>
                    <Button
                      onClick={() => setShowNewChatForm(true)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Chat
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {showNewChatForm && (
                      <div className="p-3 border rounded-lg space-y-2">
                        <Input
                          placeholder="Chat subject..."
                          value={newChatSubject}
                          onChange={(e) => setNewChatSubject(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCreateChat}
                            disabled={!newChatSubject.trim() || createChatMutation.isPending}
                            size="sm"
                          >
                            Create
                          </Button>
                          <Button
                            onClick={() => {
                              setShowNewChatForm(false);
                              setNewChatSubject('');
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {chats.length === 0 ? (
                      <p className="text-gray-500 text-sm">No chats yet. Start a conversation with admin!</p>
                    ) : (
                      chats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => setSelectedChat(chat.id)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedChat === chat.id ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{chat.subject}</h4>
                            <Badge variant={chat.status === 'open' ? 'default' : 'secondary'}>
                              {chat.status}
                            </Badge>
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
                <Card className="h-96 flex flex-col">
                  <CardHeader>
                    <CardTitle>
                      {selectedChat ? 
                        chats.find(c => c.id === selectedChat)?.subject || 'Chat' : 
                        'Select a chat'
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 min-h-0">
                    {selectedChat ? (
                      <>
                        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                          {chatMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                                  message.sender_id === user.id
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
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
