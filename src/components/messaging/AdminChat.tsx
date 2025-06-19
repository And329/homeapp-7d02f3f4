
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminConversations } from '@/hooks/useAdminConversations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import ChatWindow from './ChatWindow';

const ADMIN_EMAIL = '329@riseup.net';

const AdminChat: React.FC = () => {
  const { user, profile } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { createAdminConversation, isCreating } = useAdminConversations();

  // Simple admin check
  const isCurrentUserAdmin = profile?.email === ADMIN_EMAIL || profile?.role === 'admin';

  const handleStartAdminChat = async () => {
    if (!user) return;
    
    try {
      console.log('AdminChat: Starting admin support conversation');
      const conversation = await createAdminConversation();
      console.log('AdminChat: Created conversation:', conversation);
      setConversationId(conversation.id);
    } catch (error) {
      console.error('AdminChat: Failed to start admin chat:', error);
    }
  };

  // If user is not signed in
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Admin Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Please sign in to contact admin support.</p>
        </CardContent>
      </Card>
    );
  }

  // If current user is admin
  if (isCurrentUserAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Admin Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium mb-2">You are an Administrator</p>
            <p className="text-blue-700 text-sm">
              As an admin, you can view and respond to user conversations through the main messaging interface.
              Users can contact you through this admin support feature.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If chat window is active
  if (conversationId) {
    return (
      <div className="h-[70vh] min-h-[500px] max-h-[800px]">
        <ChatWindow
          conversationId={conversationId}
          otherUserName="Admin Support"
          onClose={() => setConversationId(null)}
        />
      </div>
    );
  }

  // Default admin chat interface
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span>Admin Support</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-gray-700">
            Need help? Contact our admin support team for assistance with your account or any issues.
          </p>
        </div>

        <Button
          onClick={handleStartAdminChat}
          disabled={isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Starting chat...
            </>
          ) : (
            <>
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Admin Support
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminChat;
