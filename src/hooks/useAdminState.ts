
import { useState } from 'react';
import { PropertyRequest } from '@/types/propertyRequest';
import { Property } from '@/types/property';

export const useAdminState = () => {
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [isNewsFormOpen, setIsNewsFormOpen] = useState(false);
  const [isApprovalFormOpen, setIsApprovalFormOpen] = useState(false);
  
  // Property states
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [approvingRequest, setApprovingRequest] = useState<PropertyRequest | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<'properties' | 'requests' | 'content' | 'chats'>('properties');
  
  // Chat states
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Request reply states
  const [replyingToRequest, setReplyingToRequest] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  return {
    // Form states
    isFormOpen,
    setIsFormOpen,
    isBlogFormOpen,
    setIsBlogFormOpen,
    isNewsFormOpen,
    setIsNewsFormOpen,
    isApprovalFormOpen,
    setIsApprovalFormOpen,
    
    // Property states
    editingProperty,
    setEditingProperty,
    approvingRequest,
    setApprovingRequest,
    showMap,
    setShowMap,
    
    // Navigation state
    activeTab,
    setActiveTab,
    
    // Chat states
    selectedConversation,
    setSelectedConversation,
    selectedChatUserId,
    setSelectedChatUserId,
    newMessage,
    setNewMessage,
    
    // Request reply states
    replyingToRequest,
    setReplyingToRequest,
    replyMessage,
    setReplyMessage,
  };
};
