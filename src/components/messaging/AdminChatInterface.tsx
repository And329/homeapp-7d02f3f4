
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminChatInterfaceProps {
  adminUser: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
  existingConversation: {
    id: string;
    subject: string;
  } | null;
  onStartChat: () => void;
  onUseExistingConversation: () => void;
  isCreatingConversation: boolean;
}

const AdminChatInterface: React.FC<AdminChatInterfaceProps> = ({
  adminUser,
  existingConversation,
  onStartChat,
  onUseExistingConversation,
  isCreatingConversation
}) => {
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
              onClick={onUseExistingConversation}
              variant="outline"
              className="mr-2"
            >
              Continue Existing Chat
            </Button>
          </div>
        )}

        <Button
          onClick={onStartChat}
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

export default AdminChatInterface;
