
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminChatAdminView: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span>Admin Chat</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium mb-2">You are an Administrator</p>
          <p className="text-blue-700 text-sm">
            As an admin, you can view and respond to user conversations through the admin dashboard. 
            Users can contact you through this chat interface on other pages.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminChatAdminView;
