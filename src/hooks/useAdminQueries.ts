
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

interface Chat {
  id: string;
  user_id: string;
  admin_id: string | null;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export const useAdminQueries = (selectedChat: string | null, selectedChatUserId: string | null) => {
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

  const chatsQuery = useQuery({
    queryKey: ['admin-chats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Chat[];
    },
  });

  const chatMessagesQuery = useQuery({
    queryKey: ['chat-messages', selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', selectedChat)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!selectedChat,
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
    chats: chatsQuery.data || [],
    chatMessages: chatMessagesQuery.data || [],
    selectedUserRequests: selectedUserRequestsQuery.data || [],
  };
};
