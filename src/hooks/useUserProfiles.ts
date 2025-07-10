import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
}

export const useUserProfiles = (userIds: string[]) => {
  return useQuery({
    queryKey: ['user-profiles', userIds.sort()],
    queryFn: async () => {
      if (userIds.length === 0) return {};

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', userIds);

      if (error) throw error;

      // Convert to map for easy lookup
      const profilesMap: Record<string, UserProfile> = {};
      data?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });

      return profilesMap;
    },
    enabled: userIds.length > 0,
  });
};

export const getDisplayName = (profile: UserProfile | undefined): string => {
  if (!profile) return 'Unknown User';
  
  if (profile.role === 'admin') {
    return 'Administrator';
  }
  
  return profile.full_name || profile.email || 'User';
};