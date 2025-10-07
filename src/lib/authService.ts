import { supabase } from '@/integrations/supabase/client';
import { User } from './types';
import { ADMIN_CONFIG } from './adminConfig';

// Real Supabase authentication service
class AuthService {
  constructor() {
    // Initialize admin user in Supabase if not exists
    this.initializeAdminUser();
  }

  private async initializeAdminUser() {
    try {
      // Check if admin user exists in Supabase
      const { data: existingAdmin, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', '+917012938275')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking admin user:', error);
        return;
      }

      if (!existingAdmin) {
        console.log('⚠️ Admin user not found in database');
        // Create admin user if it doesn't exist
        await this.createAdminUser();
      } else {
        console.log('✅ Admin user found in database');
      }
    } catch (error) {
      console.error('Error initializing admin user:', error);
    }
  }

  private async createAdminUser() {
    try {
      // First check if admin user already exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', '+917012938275')
        .single();

      if (existingAdmin) {
        console.log('✅ Admin user already exists, skipping creation');
        return;
      }

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking admin user:', checkError);
        return;
      }

      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const adminUser = {
        id: generateUUID(),
        name: 'Admin User',
        phone: '+917012938275',
        email: 'info.vishag@gmail.com',
        trust_reliability_cached: 0,
        created_at: new Date().toISOString(),
      };

      const { data: createdAdmin, error: createError } = await supabase
        .from('users')
        .insert(adminUser)
        .select()
        .single();

      if (createError) {
        if (createError.code === '23505') { // Unique constraint violation
          console.log('✅ Admin user already exists (unique constraint)');
        } else {
          console.error('Error creating admin user:', createError);
        }
      } else {
        console.log('✅ Admin user created successfully');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
  }

  async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Check if user already exists in Supabase
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', userData.phone)
        .single();

      if (existingUser) {
        return { success: false, error: 'User already exists with this phone number' };
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Check if email confirmation is required
      if (authData.user && !authData.user.email_confirmed_at) {
        console.log('⚠️ Email confirmation required for:', userData.email);
        
        // For development: Skip email confirmation check
        console.log('🔧 Development mode: Skipping email confirmation');
        // In production, you would return the error message above
      }

      // Create user profile in our users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: userData.name,
          phone: userData.phone,
          email: userData.email, // Include email field
          trust_reliability_cached: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      console.log('✅ User registered:', profileData.email);
      return { success: true, user: profileData as User };
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        // Handle email confirmation error specifically
        if (authError.message.includes('email not confirmed') || authError.message.includes('Email not confirmed')) {
          return { 
            success: false, 
            error: 'Please check your email and click the confirmation link to complete registration. If you don\'t see the email, check your spam folder.' 
          };
        }
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Authentication failed' };
      }

      // Get user profile from our users table
      // First try to find by auth user ID
      let { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      // If not found by ID, try to find by email (for admin user)
      if (!profileData && authData.user.email === 'info.vishag@gmail.com') {
        const { data: adminProfile, error: adminError } = await supabase
          .from('users')
          .select('*')
          .eq('phone', '+917012938275')
          .single();
        
        if (adminProfile) {
          // Update the admin user's ID to match the auth user
          const { data: updatedProfile, error: updateError } = await supabase
            .from('users')
            .update({ id: authData.user.id })
            .eq('phone', '+917012938275')
            .select()
            .single();
          
          if (updateError) {
            console.error('Error updating admin user ID:', updateError);
            return { success: false, error: 'Failed to link admin profile' };
          }
          
          profileData = updatedProfile;
        }
      }

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      if (!profileData) {
        return { success: false, error: 'User profile not found' };
      }

      console.log('✅ User logged in:', profileData.name);
      return { success: true, user: profileData as User };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) return null;
      return data as User;
    } catch (error) {
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) return null;
      return data as User;
    } catch (error) {
      return null;
    }
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();
      
      if (error) return null;
      return data as User;
    } catch (error) {
      return null;
    }
  }

  isAdminUser(user: User): boolean {
    return ADMIN_CONFIG.isAdmin(user.email || '', user.phone);
  }

  getAdminType(user: User): 'email' | 'phone' | null {
    return ADMIN_CONFIG.getAdminType(user.email || '', user.phone);
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) return [];
      return data as User[];
    } catch (error) {
      return [];
    }
  }

  // Logout
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('Supabase signOut error:', error);
        // Continue with cleanup even if signOut fails
      }
      
      // Force clear all sessions and tokens
      if (typeof window !== 'undefined') {
        // Clear all Supabase-related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear sessionStorage as well
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
            sessionStorage.removeItem(key);
          }
        });
        
        // Clear any cookies that might contain auth tokens
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          if (name.includes('supabase') || name.includes('auth')) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          }
        });
      }
      
      // Force clear Supabase session
      await supabase.auth.signOut({ scope: 'global' });
      
      return { success: true };
    } catch (error: any) {
      console.log('Logout error:', error);
      return { success: false, error: error.message || 'Logout failed' };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<{ user: User | null; error?: string }> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        return { user: null, error: sessionError.message };
      }
      
      if (session?.user) {
        // First try to find by auth user ID
        let { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        // If not found by ID, try to find by email (for admin user)
        if (!profile && session.user.email === 'info.vishag@gmail.com') {
          const { data: adminProfile, error: adminError } = await supabase
            .from('users')
            .select('*')
            .eq('phone', '+917012938275')
            .single();
          
          if (adminProfile) {
            // Update the admin user's ID to match the auth user
            const { data: updatedProfile, error: updateError } = await supabase
              .from('users')
              .update({ id: session.user.id })
              .eq('phone', '+917012938275')
              .select()
              .single();
            
            if (!updateError) {
              profile = updatedProfile;
            }
          }
        }
        
        if (profileError) {
          return { user: null, error: profileError.message };
        }
        
        if (!profile) {
          return { user: null, error: 'User profile not found' };
        }
        
        return { user: profile as User };
      }
      
      return { user: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'Failed to get current user' };
    }
  }
}

export const authService = new AuthService();
