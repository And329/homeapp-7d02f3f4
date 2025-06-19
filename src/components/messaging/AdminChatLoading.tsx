
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const AdminChatLoading: React.FC = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Loading admin chat...</span>
      </CardContent>
    </Card>
  );
};

export default AdminChatLoading;
