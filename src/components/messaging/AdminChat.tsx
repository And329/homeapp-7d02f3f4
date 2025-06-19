
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import ChatWindow from './ChatWindow';

const AdminChat: React.FC = () => {
  const [chatStarted, setChatStarted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { createConversationAsync, isCreatingConversation } = useConversations();

  // Get admin users
  const { data: adminUsers = [], isLoading: loadingAdmins } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'admin');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const availableAdmin = profile?.role === 'admin' 
    ? adminUsers.find(admin => admin.id !== user?.id)
    : adminUsers[0];

  const handleStartChat = async () => {
    if (!availableAdmin || !user) return;

    try {
      const conversation = await createConversationAsync({
        otherUserId: availableAdmin.id,
        subject: 'Admin Support Chat'
      });
      
      setConversationId(conversation.id);
      setChatStarted(true);
    } catch (error) {
      console.error('Failed to start admin chat:', error);
    }
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

  if (loadingAdmins) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  if (!availableAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Chat with Admin</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No admin users are currently available.</p>
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded mt-4">
            <p>Found {adminUsers.length} admin users total</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chatStarted && conversationId) {
    return (
      <div className="max-w-4xl mx-auto">
        <ChatWindow
          conversationId={conversationId}
          otherUserName={availableAdmin.full_name || availableAdmin.email || 'Admin'}
          onClose={() => setChatStarted(false)}
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
              Start Chat with {availableAdmin.full_name || availableAdmin.email}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminChat;
