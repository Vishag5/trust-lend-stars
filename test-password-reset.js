import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://leuqcbemxfdeuyjzfvcr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxldXFjYmVteGZkZXV5anpmdmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDY2MTAsImV4cCI6MjA3Mzk4MjYxMH0.xkIjARluSezewxCgabBfkxrCb5-G5FzezV3gJ9gobBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPasswordResetWithProductionURL() {
  console.log('🧪 Testing Password Reset with Production URL...');
  
  try {
    const testEmail = 'info.vishag@gmail.com';
    const productionUrl = 'https://trust-lend-stars-pb596z43i-vishag-ts-projects.vercel.app';
    const redirectUrl = `${productionUrl}/reset-password`;
    
    console.log('📧 Sending password reset email to:', testEmail);
    console.log('🔗 Redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.log('❌ Password reset email failed:', error.message);
    } else {
      console.log('✅ Password reset email sent successfully');
      console.log('📧 Check your email for the reset link');
      console.log('🔗 The link should redirect to:', redirectUrl);
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Check your email inbox (and spam folder)');
      console.log('2. Click the password reset link');
      console.log('3. The link should redirect to the production URL');
      console.log('4. Set your new password');
    }
  } catch (error) {
    console.log('❌ Password reset test error:', error.message);
  }
}

testPasswordResetWithProductionURL();
