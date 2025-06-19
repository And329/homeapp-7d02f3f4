
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PropertyRequest } from '@/types/propertyRequest';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  type: 'rent' | 'sale';
  is_hot_deal: boolean;
  description: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[] | null;
  images: string[] | null;
}

export const useAdminQueries = (selectedConversation: string | null, selectedChatUserId: string | null) => {
  const propertiesQuery = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
  });

  const propertyRequestsQuery = useQuery({
    queryKey: ['property-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropertyRequest[];
    },
  });

  const blogPostsQuery = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const newsArticlesQuery = useQuery({
    queryKey: ['admin-news-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const conversationsQuery = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const messagesQuery = useQuery({
    queryKey: ['admin-messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedConversation,
  });

  const selectedUserRequestsQuery = useQuery({
    queryKey: ['selected-user-requests', selectedChatUserId],
    queryFn: async () => {
      if (!selectedChatUserId) return [];
      
      const { data, error } = await supabase
        .from('property_requests')
        .select('*')
        .eq('user_id', selectedChatUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropertyRequest[];
    },
    enabled: !!selectedChatUserId,
  });

  return {
    properties: propertiesQuery.data || [],
    propertiesLoading: propertiesQuery.isLoading,
    propertyRequests: propertyRequestsQuery.data || [],
    requestsLoading: propertyRequestsQuery.isLoading,
    blogPosts: blogPostsQuery.data || [],
    blogLoading: blogPostsQuery.isLoading,
    newsArticles: newsArticlesQuery.data || [],
    newsLoading: newsArticlesQuery.isLoading,
    conversations: conversationsQuery.data || [],
    messages: messagesQuery.data || [],
    selectedUserRequests: selectedUserRequestsQuery.data || [],
  };
};
