
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UnifiedChat from './UnifiedChat';
import { useAuth } from '@/contexts/AuthContext';

const AdminChat: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const { user, profile, loading } = useAuth();

  // Get admin users from the database
  const { data: adminUsers = [], isLoading: loadingAdmins, error: adminError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log('AdminChat: Fetching admin users...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'admin');

      if (error) {
        console.error('AdminChat: Error fetching admin users:', error);
        throw error;
      }

      console.log('AdminChat: Found admin users:', data);
      return data || [];
    },
    enabled: !!user,
  });

  // Find available admin for chat
  const availableAdmin = profile?.role === 'admin' 
    ? adminUsers.find(admin => admin.id !== user?.id)
    : adminUsers[0];

  console.log('AdminChat: Current state:', {
    userRole: profile?.role,
    totalAdmins: adminUsers.length,
    availableAdmin: availableAdmin?.id,
    loading: loading || loadingAdmins
  });

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

  if (loading || loadingAdmins) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Chat with Admin</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (adminError) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Chat with Admin</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">
            Error loading admin users. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!availableAdmin) {
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
            {profile?.role === 'admin' 
              ? "No other admin users are currently available for chat."
              : "No admin users are currently available. Please try again later."
            }
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
            <p>Debug: Found {adminUsers.length} admin users total</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showChat) {
    return (
      <div className="max-w-4xl mx-auto">
        <UnifiedChat
          otherUserId={availableAdmin.id}
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
          <span>Start Chat with {availableAdmin.full_name || availableAdmin.email || 'Admin'}</span>
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Our admin team typically responds within a few minutes during business hours
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminChat;
