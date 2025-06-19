
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UnifiedChat from './UnifiedChat';
import { useAuth } from '@/contexts/AuthContext';

const AdminChat: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const { user } = useAuth();

  // Admin user ID - you should replace this with the actual admin user ID
  const ADMIN_USER_ID = 'dc68b306-bb81-43ba-9793-e6b4643ed2b3';

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Chat with Admin</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Please sign in to start a conversation with our admin team.
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In to Chat
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showChat) {
    return (
      <div className="max-w-4xl mx-auto">
        <UnifiedChat
          otherUserId={ADMIN_USER_ID}
          propertyTitle="General Support"
          onClose={() => setShowChat(false)}
          className="h-[600px]"
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
          <p className="text-gray-700 leading-relaxed">
            Need help with HomeApp? Start a conversation with our admin team 
            for instant support with properties, account issues, or general questions.
          </p>
        </div>

        <Button
          onClick={() => setShowChat(true)}
          className="w-full flex items-center justify-center space-x-2 h-11 text-base font-medium"
          size="lg"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Start Chat with Admin</span>
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Our admin team typically responds within a few minutes during business hours
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminChat;
