
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UnifiedChat from '@/components/UnifiedChat';

const AdminChatsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Monitor and view all user conversations. As an admin, you can see all conversations but cannot participate directly.
          </p>
          <UnifiedChat className="h-[600px]" />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChatsTab;
