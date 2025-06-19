
import React, { useState } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { useAdminUser } from '@/hooks/useAdminUser';
import { useAdminConversation } from '@/hooks/useAdminConversation';
import ChatWindow from './ChatWindow';
import AdminChatSignInPrompt from './AdminChatSignInPrompt';
import AdminChatAdminView from './AdminChatAdminView';
import AdminChatLoading from './AdminChatLoading';
import AdminChatError from './AdminChatError';
import AdminChatInterface from './AdminChatInterface';

const AdminChat: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatPartnerName, setChatPartnerName] = useState<string>('');
  const { createConversationAsync, isCreatingConversation } = useConversations();
  
  const { 
    adminUser, 
    loadingAdmin, 
    adminError, 
    isCurrentUserAdmin,
    ADMIN_EMAIL 
  } = useAdminUser();
  
  const { existingConversation } = useAdminConversation(adminUser, isCurrentUserAdmin);

  const handleStartChat = async () => {
    if (!adminUser) {
      console.error('AdminChat: Missing admin user');
      return;
    }

    try {
      console.log('AdminChat: Creating conversation with admin:', adminUser);
      
      const conversation = await createConversationAsync({
        otherUserId: adminUser.id,
        subject: 'Admin Support Chat'
      });
      
      console.log('AdminChat: Created conversation:', conversation);
      setConversationId(conversation.id);
      setChatPartnerName(adminUser.full_name || adminUser.email || 'Admin Support');
    } catch (error) {
      console.error('AdminChat: Failed to start admin chat:', error);
    }
  };

  const handleUseExistingConversation = () => {
    if (!existingConversation || !adminUser) return;

    console.log('AdminChat: Using existing conversation:', existingConversation.id);
    setConversationId(existingConversation.id);
    setChatPartnerName(adminUser.full_name || adminUser.email || 'Admin Support');
  };

  // If user is not signed in
  if (!adminUser && !loadingAdmin && !isCurrentUserAdmin) {
    return <AdminChatSignInPrompt />;
  }

  // If current user is admin
  if (isCurrentUserAdmin) {
    return <AdminChatAdminView />;
  }

  // If loading admin user
  if (loadingAdmin) {
    return <AdminChatLoading />;
  }

  // If error loading admin or admin not found
  if (adminError || !adminUser) {
    return <AdminChatError adminEmail={ADMIN_EMAIL} />;
  }

  // If chat window is active
  if (conversationId && chatPartnerName) {
    return (
      <div className="h-[70vh] min-h-[500px] max-h-[800px]">
        <ChatWindow
          conversationId={conversationId}
          otherUserName={chatPartnerName}
          onClose={() => {
            setConversationId(null);
            setChatPartnerName('');
          }}
        />
      </div>
    );
  }

  // Default chat interface
  return (
    <AdminChatInterface
      adminUser={adminUser}
      existingConversation={existingConversation}
      onStartChat={handleStartChat}
      onUseExistingConversation={handleUseExistingConversation}
      isCreatingConversation={isCreatingConversation}
    />
  );
};

export default AdminChat;
