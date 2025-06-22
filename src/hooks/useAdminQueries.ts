import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/property';
import { PropertyRequest } from '@/types/propertyRequest';

export const useAdminQueries = (selectedConversation: string | null, selectedChatUserId: string | null) => {
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: propertyRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['admin-property-requests'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('property_requests')
          .select('*, qr_code')
          .order('created_at', { ascending: false });

        if (error) {
          // If qr_code column doesn't exist yet, try without it
          if (error.message?.includes('qr_code')) {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('property_requests')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (fallbackError) throw fallbackError;
            return (fallbackData || []).map(request => ({ ...request, qr_code: null }));
          }
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Error fetching property requests:', error);
        return [];
      }
    },
  });

  // Add contact inquiries query
  const { data: contactInquiries = [], isLoading: contactInquiriesLoading } = useQuery({
    queryKey: ['contact-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: blogPosts = [], isLoading: blogLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: newsArticles = [], isLoading: newsLoading } = useQuery({
    queryKey: ['admin-news-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participant_1_id,
          participant_2_id,
          subject,
          created_at,
          last_message_at,
          is_admin_support,
          profiles!conversations_participant_2_id_fkey(full_name, email)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedConversation,
  });

  const { data: selectedUserRequests = [] } = useQuery({
    queryKey: ['user-property-requests', selectedChatUserId],
    queryFn: async () => {
      if (!selectedChatUserId) return [];
      
      try {
        const { data, error } = await supabase
          .from('property_requests')
          .select('*, qr_code')
          .eq('user_id', selectedChatUserId)
          .order('created_at', { ascending: false });

        if (error) {
          // If qr_code column doesn't exist yet, try without it
          if (error.message?.includes('qr_code')) {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('property_requests')
              .select('*')
              .eq('user_id', selectedChatUserId)
              .order('created_at', { ascending: false });
            
            if (fallbackError) throw fallbackError;
            return (fallbackData || []).map(request => ({ ...request, qr_code: null }));
          }
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Error fetching user requests:', error);
        return [];
      }
    },
    enabled: !!selectedChatUserId,
  });

  return {
    properties,
    propertiesLoading,
    propertyRequests,
    requestsLoading,
    contactInquiries,
    contactInquiriesLoading,
    blogPosts,
    blogLoading,
    newsArticles,
    newsLoading,
    conversations,
    messages,
    selectedUserRequests,
  };
};
