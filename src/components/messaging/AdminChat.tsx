
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import MessagingInterface from './MessagingInterface';

const AdminChat: React.FC = () => {
  const { user, profile } = useAuth();

  // Check if user is admin based on role in profile
  const isCurrentUserAdmin = profile?.role === 'admin';

  // If user is not signed in
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Administrator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Please sign in to view your admin support conversations.</p>
        </CardContent>
      </Card>
    );
  }

  // If current user is admin
  if (isCurrentUserAdmin) {
    return (
      <div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <span>Admin Support Dashboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium mb-2">Administrator View</p>
              <p className="text-blue-700 text-sm">
                You can view and respond to user conversations below. Users contact you through property request replies.
              </p>
            </div>
          </CardContent>
        </Card>
        <MessagingInterface />
      </div>
    );
  }

  // Regular user view - show their conversations with admin
  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Admin Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-700">
              Your conversations with admin support. Admin may contact you regarding your property requests.
            </p>
          </div>
        </CardContent>
      </Card>
      <MessagingInterface />
    </div>
  );
};

export default AdminChat;
