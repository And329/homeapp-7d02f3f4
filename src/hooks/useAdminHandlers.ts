
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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

export const useAdminHandlers = (
  mutations: any,
  propertyRequests: PropertyRequest[]
) => {
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
  const { toast } = useToast();

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      if (mutations?.deleteMutation) {
        mutations.deleteMutation.mutate(id);
      }
    }
  };

  const handleApproveRequest = (request: PropertyRequest) => {
    setApprovingRequest(request);
    setIsApprovalFormOpen(true);
  };

  const handleApprovalSubmit = async (requestId: string, updatedData: any) => {
    console.log('handleApprovalSubmit called with:', { requestId, updatedData });
    
    if (!mutations?.approveRequestWithDetailsMutation) {
      console.error('approveRequestWithDetailsMutation is not available');
      toast({
        title: "Error",
        description: "Approval function is not available. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      await mutations.approveRequestWithDetailsMutation.mutateAsync({ requestId, updatedData });
      setIsApprovalFormOpen(false);
      setApprovingRequest(null);
    } catch (error) {
      console.error('Approval submission error:', error);
      // Error handling is done in the mutation itself
    }
  };

  const handleRejectRequest = (requestId: string) => {
    if (window.confirm('Are you sure you want to reject this property request?')) {
      if (mutations?.rejectRequestMutation) {
        mutations.rejectRequestMutation.mutate(requestId);
      }
    }
  };

  const handleSendReply = (requestId: string) => {
    console.log('handleSendReply called with:', requestId);
    console.log('Reply message:', replyMessage);
    
    if (!replyMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message.",
        variant: "destructive",
      });
      return;
    }
    
    const request = propertyRequests.find(req => req.id === requestId);
    if (!request?.user_id) {
      toast({
        title: "Error",
        description: "Cannot find user for this request.",
        variant: "destructive",
      });
      return;
    }
    
    if (mutations?.sendReplyMutation) {
      mutations.sendReplyMutation.mutate({ 
        requestId, 
        message: replyMessage.trim(),
        userId: request.user_id
      });
      setReplyingToRequest(null);
      setReplyMessage('');
    }
  };

  const handleSendChatMessage = () => {
    if (!selectedChat || !newMessage.trim()) return;
    if (mutations?.sendChatMessageMutation) {
      mutations.sendChatMessageMutation.mutate({ chatId: selectedChat, message: newMessage.trim() });
      setNewMessage('');
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat.id);
    setSelectedChatUserId(chat.user_id);
  };

  return {
    // State
    isFormOpen,
    setIsFormOpen,
    isBlogFormOpen,
    setIsBlogFormOpen,
    isNewsFormOpen,
    setIsNewsFormOpen,
    isApprovalFormOpen,
    setIsApprovalFormOpen,
    editingProperty,
    setEditingProperty,
    approvingRequest,
    setApprovingRequest,
    showMap,
    setShowMap,
    activeTab,
    setActiveTab,
    selectedChat,
    selectedChatUserId,
    newMessage,
    setNewMessage,
    replyingToRequest,
    setReplyingToRequest,
    replyMessage,
    setReplyMessage,
    // Handlers
    handleEdit,
    handleDelete,
    handleApproveRequest,
    handleApprovalSubmit,
    handleRejectRequest,
    handleSendReply,
    handleSendChatMessage,
    handleChatSelect,
  };
};
