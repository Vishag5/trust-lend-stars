import { create } from 'zustand';
import { authService } from '@/lib/authService';
import { User } from '@/lib/types';

interface ProductionAuthState {
  currentUserId: string | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  adminType: 'email' | 'phone' | null;
  isLoggingOut: boolean; // Add logout flag
  lastLogoutTime: number; // Track when logout happened
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useProductionAuthStore = create<ProductionAuthState>((set, get) => ({
  currentUserId: null,
  currentUser: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check auth
  isAdmin: false,
  adminType: null,
  isLoggingOut: false, // Initialize logout flag
  lastLogoutTime: 0, // Initialize logout time

  setCurrentUser: (user) => {
    const isAdmin = user ? authService.isAdminUser(user) : false;
    const adminType = user ? authService.getAdminType(user) : null;
    
    set({ 
      currentUser: user, 
      currentUserId: user?.id || null,
      isAuthenticated: !!user,
      isAdmin,
      adminType
    });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        get().setCurrentUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const result = await authService.register(userData);
      
      if (result.success && result.user) {
        get().setCurrentUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, isLoggingOut: true }); // Set logout flag
    
    try {
      // Step 1: Clear local state immediately
      set({ 
        currentUser: null, 
        currentUserId: null, 
        isAuthenticated: false,
        isAdmin: false,
        adminType: null
      });
      
      // Step 2: Clear Supabase session and all storage
      await authService.logout();
      
      // Step 3: Wait for session to be fully cleared
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Verify logout was successful
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('⚠️ Session still exists after logout, forcing clear...');
        // Force clear again
        await supabase.auth.signOut({ scope: 'global' });
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Step 5: Clear logout flag and set logout time
      set({ isLoggingOut: false, lastLogoutTime: Date.now() });
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even on error, clear the logout flag and state
      set({ 
        isLoggingOut: false,
        currentUser: null, 
        currentUserId: null, 
        isAuthenticated: false,
        isAdmin: false,
        adminType: null
      });
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    const state = get();
    
    // Don't check auth if we're in the middle of logging out
    if (state.isLoggingOut) {
      return;
    }
    
    // Don't check auth if we just logged out (within last 5 seconds)
    if (state.lastLogoutTime && (Date.now() - state.lastLogoutTime) < 5000) {
      console.log('🚫 Skipping auth check - recently logged out');
      return;
    }
    
    set({ isLoading: true });
    try {
      const { user, error } = await authService.getCurrentUser();
      if (user) {
        get().setCurrentUser(user);
      } else {
        // If no user found, ensure we're logged out
        if (get().isAuthenticated) {
          set({ 
            currentUser: null, 
            currentUserId: null, 
            isAuthenticated: false,
            isAdmin: false,
            adminType: null
          });
        }
      }
      if (error) {
        console.error('Auth check error:', error);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, ensure we're logged out
      set({ 
        currentUser: null, 
        currentUserId: null, 
        isAuthenticated: false,
        isAdmin: false,
        adminType: null
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Auto-check authentication on store initialization
if (typeof window !== 'undefined') {
  // Check auth after a delay, but only if not logging out
  setTimeout(() => {
    const state = useProductionAuthStore.getState();
    if (!state.isLoggingOut) {
      state.checkAuth();
    }
  }, 200); // Increased delay to prevent race conditions
}
