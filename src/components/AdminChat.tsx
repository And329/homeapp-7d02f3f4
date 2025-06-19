
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UnifiedChat from './UnifiedChat';
import { useAuth } from '@/contexts/AuthContext';

const AdminChat: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const { user } = useAuth();

  // Get current user's profile to check if they are admin
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('AdminChat: Checking current user profile for:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('AdminChat: Error fetching current user profile:', error);
        return null;
      }
      
      console.log('AdminChat: Current user profile:', data);
      return data;
    },
    enabled: !!user,
  });

  // Get admin users from the database
  const { data: adminUsers = [], isLoading: loadingAdmins } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log('AdminChat: Fetching admin users...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, email')
        .eq('role', 'admin');

      if (error) {
        console.error('AdminChat: Error fetching admin users:', error);
        throw error;
      }
      
      console.log('AdminChat: Found admin users:', data);
      return data || [];
    },
  });

  // If current user is admin, find other admins. Otherwise, use any admin.
  const availableAdmins = currentUserProfile?.role === 'admin' 
    ? adminUsers.filter(admin => admin.id !== user?.id)
    : adminUsers;

  const adminUser = availableAdmins.length > 0 ? availableAdmins[0] : null;

  console.log('AdminChat: Current user is admin:', currentUserProfile?.role === 'admin');
  console.log('AdminChat: Available admins:', availableAdmins);
  console.log('AdminChat: Selected admin user:', adminUser);

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

  if (loadingAdmins) {
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
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!adminUser) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Chat with Admin</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              {currentUserProfile?.role === 'admin' 
                ? "You are an admin user. No other admin users are currently available for chat."
                : "No admin users are currently available. Please try again later or contact us through other means."
              }
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded">
              <p className="font-semibold mb-2">Debug info:</p>
              <p>Total admin users found: {adminUsers.length}</p>
              <p>Your role: {currentUserProfile?.role || 'unknown'}</p>
              <p>Your user ID: {user?.id}</p>
              <p>Available admins for chat: {availableAdmins.length}</p>
              {adminUsers.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Admin users in database:</p>
                  {adminUsers.map((admin, index) => (
                    <p key={admin.id} className="ml-2">
                      {index + 1}. {admin.full_name || admin.email || admin.id} (Role: {admin.role})
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showChat) {
    return (
      <div className="max-w-4xl mx-auto">
        <UnifiedChat
          otherUserId={adminUser.id}
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
          <span>Start Chat with {adminUser.full_name || adminUser.email || 'Admin'}</span>
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Our admin team typically responds within a few minutes during business hours
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminChat;
