
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminChatErrorProps {
  adminEmail: string;
}

const AdminChatError: React.FC<AdminChatErrorProps> = ({ adminEmail }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span>Chat with Admin</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium mb-2">Administrator Not Available</p>
          <p className="text-red-700 text-sm">
            Admin user ({adminEmail}) not found. Please make sure the administrator account exists in the system.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminChatError;
