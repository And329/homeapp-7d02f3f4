
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from '@/components/PropertyForm';
import PropertyRequestApprovalForm from '@/components/PropertyRequestApprovalForm';
import BlogPostForm from '@/components/BlogPostForm';
import NewsArticleForm from '@/components/NewsArticleForm';
import MapboxTokenSettings from '@/components/MapboxTokenSettings';
import AdminTabNavigation from '@/components/admin/AdminTabNavigation';
import AdminPropertiesTab from '@/components/admin/AdminPropertiesTab';
import AdminRequestsTab from '@/components/admin/AdminRequestsTab';
import AdminContentTab from '@/components/admin/AdminContentTab';
import AdminChatsTab from '@/components/admin/AdminChatsTab';
import { PropertyRequest } from '@/types/propertyRequest';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  type: 'rent' | 'sale';
  is_hot_deal: boolean;
  description: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[] | null;
  images: string[] | null;
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

const AdminDashboard = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [isNewsFormOpen, setIsNewsFormOpen] = useState(false);
  const [isApprovalFormOpen, setIsApprovalFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [approvingRequest, setApprovingRequest] = useState<PropertyRequest | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'requests' | 'content' | 'chats'>('properties');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyingToRequest, setReplyingToRequest] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
  });

  const { data: propertyRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['property-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropertyRequest[];
    },
  });

  const { data: blogPosts = [], isLoading: blogLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: newsArticles = [], isLoading: newsLoading } = useQuery({
    queryKey: ['admin-news-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['admin-chats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Chat[];
    },
  });

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

  const { data: selectedUserRequests = [] } = useQuery({
    queryKey: ['selected-user-requests', selectedChatUserId],
    queryFn: async () => {
      if (!selectedChatUserId) return [];
      
      const { data, error } = await supabase
        .from('property_requests')
        .select('*')
        .eq('user_id', selectedChatUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropertyRequest[];
    },
    enabled: !!selectedChatUserId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast({
        title: "Property deleted",
        description: "The property has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approveRequestWithDetailsMutation = useMutation({
    mutationFn: async ({ requestId, updatedData }: { requestId: string, updatedData: any }) => {
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert([updatedData])
        .select()
        .single();

      if (propertyError) throw propertyError;

      const { error: requestError } = await supabase
        .from('property_requests')
        .update({ 
          status: 'approved', 
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      return propertyData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      setIsApprovalFormOpen(false);
      setApprovingRequest(null);
      toast({
        title: "Request Approved",
        description: "The property request has been approved and added to listings.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('property_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      toast({
        title: "Request Rejected",
        description: "The property request has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ requestId, message, userId }: { requestId: string; message: string; userId: string }) => {
      const propertyRequest = propertyRequests.find(req => req.id === requestId);
      const chatSubject = `Property Request: ${propertyRequest?.title || 'Property'}`;
      
      let chatId;
      const { data: existingChats } = await supabase
        .from('admin_chats')
        .select('id')
        .eq('user_id', userId)
        .eq('subject', chatSubject)
        .limit(1);

      if (existingChats && existingChats.length > 0) {
        chatId = existingChats[0].id;
      } else {
        const { data: newChat, error: chatError } = await supabase
          .from('admin_chats')
          .insert([{
            user_id: userId,
            subject: chatSubject,
            admin_id: profile!.id,
            status: 'open'
          }])
          .select()
          .single();

        if (chatError) throw chatError;
        chatId = newChat.id;
      }

      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          chat_id: chatId,
          sender_id: profile!.id,
          message
        }]);

      if (messageError) throw messageError;

      await supabase
        .from('admin_chats')
        .update({ 
          updated_at: new Date().toISOString(),
          admin_id: profile!.id
        })
        .eq('id', chatId);

      const { error: replyError } = await supabase
        .from('property_request_replies')
        .insert([{
          request_id: requestId,
          admin_id: profile!.id,
          message
        }]);

      if (replyError) throw replyError;

      return chatId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-chats'] });
      setReplyingToRequest(null);
      setReplyMessage('');
      toast({
        title: "Reply sent",
        description: "Your reply has been sent to the user and a chat has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendChatMessageMutation = useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          chat_id: chatId,
          sender_id: profile!.id,
          message
        }]);

      if (error) throw error;

      await supabase
        .from('admin_chats')
        .update({ 
          updated_at: new Date().toISOString(),
          admin_id: profile!.id
        })
        .eq('id', chatId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedChat] });
      queryClient.invalidateQueries({ queryKey: ['admin-chats'] });
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

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleApproveRequest = (request: PropertyRequest) => {
    setApprovingRequest(request);
    setIsApprovalFormOpen(true);
  };

  const handleApprovalSubmit = (requestId: string, updatedData: any) => {
    approveRequestWithDetailsMutation.mutate({ requestId, updatedData });
  };

  const handleRejectRequest = (requestId: string) => {
    if (window.confirm('Are you sure you want to reject this property request?')) {
      rejectRequestMutation.mutate(requestId);
    }
  };

  const handleSendReply = (requestId: string) => {
    if (!replyMessage.trim()) return;
    const request = propertyRequests.find(req => req.id === requestId);
    if (!request?.user_id) {
      toast({
        title: "Error",
        description: "Cannot find user for this request.",
        variant: "destructive",
      });
      return;
    }
    sendReplyMutation.mutate({ 
      requestId, 
      message: replyMessage.trim(),
      userId: request.user_id
    });
  };

  const handleSendChatMessage = () => {
    if (!selectedChat || !newMessage.trim()) return;
    sendChatMessageMutation.mutate({ chatId: selectedChat, message: newMessage.trim() });
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat.id);
    setSelectedChatUserId(chat.user_id);
  };

  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') {
      return `AED ${price.toLocaleString()}/month`;
    }
    return `AED ${price.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</span>;
      default:
        return null;
    }
  };

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage properties, requests, content, and user communications</p>
        </div>

        <MapboxTokenSettings />

        <AdminTabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          propertiesCount={properties.length}
          pendingRequestsCount={propertyRequests.filter(r => r.status === 'pending').length}
          openChatsCount={chats.filter(c => c.status === 'open').length}
        />

        {activeTab === 'properties' && (
          <AdminPropertiesTab
            properties={properties}
            propertiesLoading={propertiesLoading}
            showMap={showMap}
            setShowMap={setShowMap}
            onAddProperty={() => {
              setEditingProperty(null);
              setIsFormOpen(true);
            }}
            onEditProperty={handleEdit}
            onDeleteProperty={handleDelete}
          />
        )}

        {activeTab === 'requests' && (
          <AdminRequestsTab
            propertyRequests={propertyRequests}
            requestsLoading={requestsLoading}
            replyingToRequest={replyingToRequest}
            replyMessage={replyMessage}
            setReplyingToRequest={setReplyingToRequest}
            setReplyMessage={setReplyMessage}
            sendReplyMutation={sendReplyMutation}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onSendReply={handleSendReply}
          />
        )}

        {activeTab === 'content' && (
          <AdminContentTab
            blogPosts={blogPosts}
            newsArticles={newsArticles}
            blogLoading={blogLoading}
            newsLoading={newsLoading}
            onCreateBlogPost={() => setIsBlogFormOpen(true)}
            onCreateNewsArticle={() => setIsNewsFormOpen(true)}
          />
        )}

        {activeTab === 'chats' && (
          <AdminChatsTab
            chats={chats}
            chatMessages={chatMessages}
            selectedChat={selectedChat}
            selectedChatUserId={selectedChatUserId}
            selectedUserRequests={selectedUserRequests}
            newMessage={newMessage}
            profileId={profile.id}
            sendChatMessageMutation={sendChatMessageMutation}
            setNewMessage={setNewMessage}
            onChatSelect={handleChatSelect}
            onSendChatMessage={handleSendChatMessage}
          />
        )}
      </div>

      {/* Modals */}
      {isFormOpen && (
        <PropertyForm
          property={editingProperty}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProperty(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
            setIsFormOpen(false);
            setEditingProperty(null);
          }}
        />
      )}

      {isApprovalFormOpen && approvingRequest && (
        <PropertyRequestApprovalForm
          request={approvingRequest}
          onClose={() => {
            setIsApprovalFormOpen(false);
            setApprovingRequest(null);
          }}
          onApprove={handleApprovalSubmit}
        />
      )}

      {isBlogFormOpen && (
        <BlogPostForm
          onClose={() => setIsBlogFormOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
            setIsBlogFormOpen(false);
          }}
        />
      )}

      {isNewsFormOpen && (
        <NewsArticleForm
          onClose={() => setIsNewsFormOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-news-articles'] });
            setIsNewsFormOpen(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
