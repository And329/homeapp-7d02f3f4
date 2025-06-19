
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import ChatWindow from './ChatWindow';

const ADMIN_EMAIL = '329@riseup.net';

// Hardcoded admin user details
const ADMIN_USER = {
  id: 'admin-static-id', // This will be replaced with actual ID when found
  email: ADMIN_EMAIL,
  full_name: 'Admin Support',
  role: 'admin'
};

const AdminChat: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatPartnerName, setChatPartnerName] = useState<string>('');
  const { user, profile } = useAuth();
  const { createConversationAsync, isCreatingConversation } = useConversations();

  // Get admin user by email but with fallback
  const { data: adminUser, isLoading: loadingAdmin } = useQuery({
    queryKey: ['admin-user'],
    queryFn: async () => {
      console.log('AdminChat: Fetching admin user with email:', ADMIN_EMAIL);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('email', ADMIN_EMAIL)
        .maybeSingle();

      if (error) {
        console.error('AdminChat: Error fetching admin user:', error);
        // Return hardcoded admin user as fallback
        return ADMIN_USER;
      }

      if (!data) {
        console.log('AdminChat: No admin user found in database, using hardcoded admin');
        // Return hardcoded admin user as fallback
        return ADMIN_USER;
      }

      console.log('AdminChat: Found admin user:', data);
      return data;
    },
    enabled: !!user,
  });

  // Check if user already has a conversation with admin
  const { data: existingConversation } = useQuery({
    queryKey: ['existing-admin-conversation', user?.id, adminUser?.id],
    queryFn: async () => {
      if (!user || !adminUser) return null;

      console.log('AdminChat: Checking for existing conversation between:', user.id, 'and', adminUser.id);

      const { data, error } = await supabase
        .from('conversations')
        .select('id, subject')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .or(`participant_1_id.eq.${adminUser.id},participant_2_id.eq.${adminUser.id}`)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('AdminChat: Error fetching existing conversation:', error);
        return null;
      }

      console.log('AdminChat: Existing conversation:', data);
      return data;
    },
    enabled: !!user && !!adminUser,
  });

  const handleStartChat = async () => {
    if (!adminUser || !user) {
      console.error('AdminChat: Missing admin user or current user');
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

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Chat with Admin</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Please sign in to chat with admin support.</p>
        </CardContent>
      </Card>
    );
  }

  if (loadingAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading admin chat...</span>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span>Chat with Admin</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-gray-700">
            Need help? Start a conversation with our admin team for support.
          </p>
        </div>

        {existingConversation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium mb-2">Existing Conversation Found</p>
            <p className="text-green-700 text-sm mb-3">
              You already have a conversation with an admin. You can continue that conversation or start a new one.
            </p>
            <Button
              onClick={handleUseExistingConversation}
              variant="outline"
              className="mr-2"
            >
              Continue Existing Chat
            </Button>
          </div>
        )}

        <Button
          onClick={handleStartChat}
          disabled={isCreatingConversation}
          className="w-full"
          size="lg"
        >
          {isCreatingConversation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Starting chat...
            </>
          ) : (
            <>
              <MessageCircle className="h-5 w-5 mr-2" />
              Start New Chat with {adminUser?.full_name || 'Admin Support'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminChat;
