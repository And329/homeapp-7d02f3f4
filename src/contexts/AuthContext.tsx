
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'user';
  profile_picture?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('AuthContext: Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, profile_picture')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('AuthContext: Error fetching profile:', error);
        return null;
      }

      if (!data) {
        console.log('AuthContext: No profile found, creating one for user:', userId);
        
        // Get user info for profile creation
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          console.error('AuthContext: No authenticated user found');
          return null;
        }

        // Create profile - set as admin if this is the designated admin email
        const isAdmin = currentUser.email === '329@riseup.net';
        const fullName = currentUser.user_metadata?.full_name || (isAdmin ? 'Administrator' : null);
        
        // Try to create profile with retry logic for foreign key issues
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: currentUser.email || null,
                full_name: fullName,
                role: isAdmin ? 'admin' : 'user'
              })
              .select('id, email, full_name, role, profile_picture')
              .single();

            if (createError) {
              if (createError.code === '23503' && retryCount < maxRetries - 1) {
                // Foreign key constraint error, wait and retry
                console.log(`AuthContext: Foreign key error, retrying... (${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                retryCount++;
                continue;
              }
              throw createError;
            }

            console.log('AuthContext: Created new profile:', newProfile);
            return newProfile as Profile;
          } catch (error) {
            if (retryCount === maxRetries - 1) {
              console.error('AuthContext: Failed to create profile after retries:', error);
              return null;
            }
            retryCount++;
          }
        }
      }
      
      console.log('AuthContext: Found existing profile:', data);
      return data as Profile;
    } catch (error) {
      console.error('AuthContext: Exception fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, !!session?.user);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile after a short delay to ensure auth state is stable
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            setLoading(false);
          }, 500);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('AuthContext: Found existing session for user:', session.user.id);
          setSession(session);
          setUser(session.user);
          
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('AuthContext: Exception getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('AuthContext: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: Signing in user:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('AuthContext: Signing up user:', email);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    console.log('AuthContext: Signing out user');
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    console.log('AuthContext: Resetting password for:', email);
    const redirectUrl = `${window.location.origin}/auth`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    console.log('AuthContext: Updating password');
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    session,
    profile,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    loading,
    isAdmin,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
