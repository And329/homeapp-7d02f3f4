
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = '329@riseup.net';

const ContactAdminButton: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStartConversation = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to start a conversation with admin.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('ContactAdminButton: Starting conversation with admin for user:', user.id);
      
      // Find admin user by the hardcoded email
      const { data: adminProfile, error: adminError } = await supabase
        .from('profiles')
        .select('id, email, role, full_name')
        .eq('email', ADMIN_EMAIL)
        .eq('role', 'admin')
        .single();

      if (adminError || !adminProfile) {
        console.error('ContactAdminButton: Admin not found:', adminError);
        toast({
          title: "Error",
          description: "Unable to connect to admin support. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      console.log('ContactAdminButton: Found admin profile:', adminProfile);

      // Use the create_admin_conversation function
      const { data: conversationId, error: conversationError } = await supabase.rpc('create_admin_conversation', {
        p_admin_id: adminProfile.id,
        p_user_id: user.id,
        p_property_request_id: null,
        p_subject: 'General Support'
      });

      if (conversationError) {
        console.error('ContactAdminButton: Error creating conversation:', conversationError);
        toast({
          title: "Error",
          description: "Failed to start conversation. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('ContactAdminButton: Created/found conversation:', conversationId);

      toast({
        title: "Conversation ready",
        description: "Redirecting you to chat with admin support.",
      });

      // Navigate to user profile messages tab
      navigate('/profile?tab=messages');

    } catch (error) {
      console.error('ContactAdminButton: Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-primary text-white rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4">Need Direct Support?</h3>
      <p className="mb-4 opacity-90">
        Start a conversation with our admin team for personalized assistance with your property needs.
      </p>
      <Button
        onClick={handleStartConversation}
        variant="secondary"
        className="bg-white text-primary hover:bg-gray-100"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Chat with Admin
      </Button>
    </div>
  );
};

export default ContactAdminButton;
