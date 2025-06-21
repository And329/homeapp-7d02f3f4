
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
      
      // First, let's check all profiles to see what we have
      const { data: allProfiles, error: debugError } = await supabase
        .from('profiles')
        .select('id, email, role, full_name');

      console.log('ContactAdminButton: All profiles in database:', allProfiles);
      
      if (debugError) {
        console.error('ContactAdminButton: Error fetching all profiles:', debugError);
      }
      
      // Find an admin user - try multiple approaches
      let adminProfile = null;
      
      // First try to find by role
      const { data: adminByRole, error: roleError } = await supabase
        .from('profiles')
        .select('id, email, role, full_name')
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle();

      if (roleError) {
        console.error('ContactAdminButton: Error finding admin by role:', roleError);
      } else if (adminByRole) {
        adminProfile = adminByRole;
        console.log('ContactAdminButton: Found admin by role:', adminProfile);
      }

      // If no admin found by role, try to find by email (329@riseup.net)
      if (!adminProfile) {
        const { data: adminByEmail, error: emailError } = await supabase
          .from('profiles')
          .select('id, email, role, full_name')
          .eq('email', '329@riseup.net')
          .limit(1)
          .maybeSingle();

        if (emailError) {
          console.error('ContactAdminButton: Error finding admin by email:', emailError);
        } else if (adminByEmail) {
          adminProfile = adminByEmail;
          console.log('ContactAdminButton: Found admin by email:', adminProfile);
          
          // Update this user's role to admin if it's not already set
          if (adminProfile.role !== 'admin') {
            console.log('ContactAdminButton: Updating admin role for user');
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', adminProfile.id);
              
            if (updateError) {
              console.error('ContactAdminButton: Error updating admin role:', updateError);
            } else {
              adminProfile.role = 'admin';
            }
          }
        }
      }

      if (!adminProfile) {
        console.error('ContactAdminButton: No admin found in any way');
        toast({
          title: "Error",
          description: "Unable to find admin. Please try again later or contact support directly.",
          variant: "destructive",
        });
        return;
      }

      console.log('ContactAdminButton: Using admin profile:', adminProfile);

      // Check if conversation already exists between user and this admin
      const { data: existingConversation, error: conversationError } = await supabase
        .from('conversations')
        .select('id')
        .eq('is_admin_support', true)
        .or(`and(participant_1_id.eq.${adminProfile.id},participant_2_id.eq.${user.id}),and(participant_1_id.eq.${user.id},participant_2_id.eq.${adminProfile.id})`)
        .maybeSingle();

      if (conversationError) {
        console.error('ContactAdminButton: Error checking existing conversation:', conversationError);
      }

      let conversationId = existingConversation?.id;

      // Create new conversation if none exists
      if (!conversationId) {
        console.log('ContactAdminButton: Creating new admin support conversation');
        
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant_1_id: adminProfile.id,
            participant_2_id: user.id,
            subject: 'General Support',
            is_admin_support: true,
          })
          .select('id')
          .single();

        if (createError) {
          console.error('ContactAdminButton: Error creating conversation:', createError);
          toast({
            title: "Error",
            description: "Failed to start conversation. Please try again.",
            variant: "destructive",
          });
          return;
        }

        conversationId = newConversation.id;
        console.log('ContactAdminButton: Created new conversation:', conversationId);
      } else {
        console.log('ContactAdminButton: Using existing conversation:', conversationId);
      }

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
