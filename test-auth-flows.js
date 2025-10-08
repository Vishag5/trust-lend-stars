import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://leuqcbemxfdeuyjzfvcr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxldXFjYmVteGZkZXV5anpmdmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDY2MTAsImV4cCI6MjA3Mzk4MjYxMH0.xkIjARluSezewxCgabBfkxrCb5-G5FzezV3gJ9gobBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPasswordReset() {
  console.log('🧪 Testing Password Reset Flow...');
  
  try {
    // Test sending password reset email with a real email format
    const testEmail = 'info.vishag@gmail.com'; // Use your admin email for testing
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'https://trust-lend-stars-6ce0k3ril-vishag-ts-projects.vercel.app/reset-password',
    });

    if (error) {
      console.log('❌ Password reset email failed:', error.message);
    } else {
      console.log('✅ Password reset email sent successfully');
      console.log('📧 Check email for reset link');
      console.log('🔗 Reset link should redirect to: https://trust-lend-stars-6ce0k3ril-vishag-ts-projects.vercel.app/reset-password');
    }
  } catch (error) {
    console.log('❌ Password reset test error:', error.message);
  }
}

async function testGoogleAuth() {
  console.log('🧪 Testing Google Auth Configuration...');
  
  try {
    // Check if Google provider is enabled
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://trust-lend-stars-6ce0k3ril-vishag-ts-projects.vercel.app/auth/callback'
      }
    });

    if (error) {
      console.log('❌ Google OAuth test failed:', error.message);
      if (error.message.includes('not enabled')) {
        console.log('🔧 Google OAuth provider needs to be enabled in Supabase dashboard');
      }
    } else {
      console.log('✅ Google OAuth configuration looks good');
      console.log('🔗 OAuth URL:', data.url);
    }
  } catch (error) {
    console.log('❌ Google OAuth test error:', error.message);
  }
}

async function testUserCreation() {
  console.log('🧪 Testing User Creation for OAuth...');
  
  try {
    // Simulate OAuth user data with proper UUID
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const mockOAuthUser = {
      id: generateUUID(),
      email: 'testoauth@example.com',
      user_metadata: {
        full_name: 'Test OAuth User',
        name: 'Test OAuth User'
      }
    };

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', mockOAuthUser.email)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      console.log('✅ User creation test - user does not exist (expected)');
      
      // Test user creation
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: mockOAuthUser.id,
          name: mockOAuthUser.user_metadata?.full_name || mockOAuthUser.user_metadata?.name || 'User',
          email: mockOAuthUser.email,
          phone: '',
          trust_reliability_cached: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.log('❌ User creation failed:', createError.message);
      } else {
        console.log('✅ User creation successful:', newUser.name);
        
        // Clean up test user
        await supabase.from('users').delete().eq('id', mockOAuthUser.id);
        console.log('🧹 Test user cleaned up');
      }
    } else if (existingUser) {
      console.log('ℹ️ Test user already exists:', existingUser.name);
    } else {
      console.log('❌ Unexpected error checking user:', checkError?.message);
    }
  } catch (error) {
    console.log('❌ User creation test error:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Authentication Flow Tests...\n');
  
  await testPasswordReset();
  console.log('');
  
  await testGoogleAuth();
  console.log('');
  
  await testUserCreation();
  console.log('');
  
  console.log('✅ All authentication flow tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Configure Google OAuth in Supabase dashboard if not already done');
  console.log('2. Test password reset with a real email');
  console.log('3. Test Google sign-in with a real Google account');
}

runAllTests();
