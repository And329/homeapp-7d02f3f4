
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import ChatWindow from './ChatWindow';

const AdminChat: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatPartnerName, setChatPartnerName] = useState<string>('');
  const { user, profile } = useAuth();
  const { createConversationAsync, isCreatingConversation } = useConversations();

  // Get admin users
  const { data: adminUsers = [], isLoading: loadingAdmins } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'admin');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Check if user already has a conversation with any admin
  const { data: existingConversation } = useQuery({
    queryKey: ['existing-admin-conversation', user?.id],
    queryFn: async () => {
      if (!user || !adminUsers.length) return null;

      const adminIds = adminUsers.map(admin => admin.id);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participant_1_id,
          participant_2_id,
          subject,
          profiles!conversations_participant_1_id_fkey(full_name, email),
          profiles_participant_2:profiles!conversations_participant_2_id_fkey(full_name, email)
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .or(`participant_1_id.in.(${adminIds.join(',')}),participant_2_id.in.(${adminIds.join(',')})`)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching existing conversation:', error);
        return null;
      }

      return data;
    },
    enabled: !!user && adminUsers.length > 0,
  });

  const availableAdmin = profile?.role === 'admin' 
    ? adminUsers.find(admin => admin.id !== user?.id)
    : adminUsers[0];

  const handleStartChat = async () => {
    if (!availableAdmin || !user) return;

    try {
      console.log('Creating conversation with admin:', availableAdmin);
      
      const conversation = await createConversationAsync({
        otherUserId: availableAdmin.id,
        subject: 'Admin Support Chat'
      });
      
      console.log('Created conversation:', conversation);
      setConversationId(conversation.id);
      setChatPartnerName(availableAdmin.full_name || availableAdmin.email || 'Admin');
    } catch (error) {
      console.error('Failed to start admin chat:', error);
    }
  };

  const handleUseExistingConversation = () => {
    if (!existingConversation || !user) return;

    setConversationId(existingConversation.id);
    
    // Get the other participant's name
    const otherParticipant = existingConversation.participant_1_id === user.id 
      ? existingConversation.profiles_participant_2
      : existingConversation.profiles;
    
    setChatPartnerName(otherParticipant?.full_name || otherParticipant?.email || 'Admin');
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Chat with Admin</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Please sign in to chat with admin support.</p>
        </CardContent>
      </Card>
    );
  }

  if (loadingAdmins) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  if (!availableAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Chat with Admin</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No admin users are currently available.</p>
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded mt-4">
            <p>Found {adminUsers.length} admin users total</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (conversationId && chatPartnerName) {
    return (
      <div className="h-[70vh] min-h-[500px] max-h-[800px]">
        <ChatWindow
          conversationId={conversationId}
          otherUserName={chatPartnerName}
          onClose={() => {
            setConversationId(null);
            setChatPartnerName('');
          }}
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
              onClick={handleUseExistingConversation}
              variant="outline"
              className="mr-2"
            >
              Continue Existing Chat
            </Button>
          </div>
        )}

        <Button
          onClick={handleStartChat}
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
              Start New Chat with {availableAdmin.full_name || availableAdmin.email}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminChat;
