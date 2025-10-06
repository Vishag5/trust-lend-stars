import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  currentUserId: string | null;
  currentUser: { id: string; name: string; phone: string; email?: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setCurrentUser: (user: { id: string; name: string; phone: string; email?: string } | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithPhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  createUserProfile: (userData: { name: string; phone: string }) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUserId: null,
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,

  setCurrentUser: (user) => set({ 
    currentUser: user, 
    currentUserId: user?.id || null,
    isAuthenticated: !!user 
  }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Get user profile from our users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          get().setCurrentUser(profile);
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Google login failed' };
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithPhone: async (phone) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : `+${phone}`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Phone login failed' };
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOTP: async (phone, otp) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone.startsWith('+') ? phone : `+${phone}`,
        token: otp,
        type: 'sms'
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Get user profile from our users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          get().setCurrentUser(profile);
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'OTP verification failed' };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      set({ currentUser: null, currentUserId: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user profile from our users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          get().setCurrentUser(profile);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createUserProfile: async (userData) => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }

      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: userData.name,
          phone: userData.phone,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      get().setCurrentUser(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Profile creation failed' };
    } finally {
      set({ isLoading: false });
    }
  },
}));
