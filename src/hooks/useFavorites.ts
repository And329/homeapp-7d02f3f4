
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          property_id,
          created_at,
          properties (
            id,
            title,
            price,
            location,
            emirate,
            bedrooms,
            bathrooms,
            area,
            property_type,
            year_built,
            parking,
            type,
            images,
            videos,
            description,
            amenities,
            latitude,
            longitude,
            owner_id,
            is_hot_deal,
            is_approved,
            qr_code,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user,
  });

  // Add to favorites
  const addToFavoritesMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      toast({
        title: "Added to favorites",
        description: "Property has been added to your favorites.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to favorites.",
        variant: "destructive",
      });
    },
  });

  // Remove from favorites
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      toast({
        title: "Removed from favorites",
        description: "Property has been removed from your favorites.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites.",
        variant: "destructive",
      });
    },
  });

  // Check if property is favorited
  const isFavorite = (propertyId: string) => {
    return favorites.some(fav => fav.property_id === propertyId);
  };

  // Toggle favorite
  const toggleFavorite = (propertyId: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add favorites.",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite(propertyId)) {
      removeFromFavoritesMutation.mutate(propertyId);
    } else {
      addToFavoritesMutation.mutate(propertyId);
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    isToggling: addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending,
  };
};
