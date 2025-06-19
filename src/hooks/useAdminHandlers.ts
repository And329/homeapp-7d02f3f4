
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

interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  subject: string;
  created_at: string;
  last_message_at: string;
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
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
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
    if (!selectedConversation || !newMessage.trim()) return;
    if (mutations?.sendChatMessageMutation) {
      mutations.sendChatMessageMutation.mutate({ conversationId: selectedConversation, message: newMessage.trim() });
      setNewMessage('');
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation.id);
    // Determine the other participant ID
    setSelectedChatUserId(conversation.participant_1_id);
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
    selectedConversation,
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
    handleConversationSelect,
  };
};
