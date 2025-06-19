
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAIL = '329@riseup.net';

export const useAdminUser = () => {
  const { user, profile } = useAuth();
  
  // Check if current user is admin
  const isCurrentUserAdmin = profile?.email === ADMIN_EMAIL || profile?.role === 'admin';

  // Get admin user by email
  const { data: adminUser, isLoading: loadingAdmin, error: adminError } = useQuery({
    queryKey: ['admin-user'],
    queryFn: async () => {
      console.log('useAdminUser: Fetching admin user with email:', ADMIN_EMAIL);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('email', ADMIN_EMAIL)
        .maybeSingle();

      if (error) {
        console.error('useAdminUser: Error fetching admin user:', error);
        throw error;
      }

      if (!data) {
        console.log('useAdminUser: No admin user found in database');
        throw new Error('Admin user not found. Please contact support.');
      }

      console.log('useAdminUser: Found admin user:', data);
      return data;
    },
    enabled: !!user && !isCurrentUserAdmin,
  });

  return {
    adminUser,
    loadingAdmin,
    adminError,
    isCurrentUserAdmin,
    ADMIN_EMAIL
  };
};
