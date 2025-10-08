import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

export function AuthCallback() {
  const navigate = useNavigate();
  const { setCurrentUser } = useProductionAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Handle the OAuth callback
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        setError(error.message);
        toast({
          title: 'Authentication Failed',
          description: error.message,
          variant: 'destructive',
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (data.session?.user) {
        console.log('OAuth user data:', data.session.user);
        // Get user profile from our users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email', data.session.user.email)
          .single();

        if (profileError) {
          // If user doesn't exist in our users table, create them
          if (profileError.code === 'PGRST116') {
            console.log('Creating new OAuth user profile...');
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                id: data.session.user.id,
                name: data.session.user.user_metadata?.full_name || 
                      data.session.user.user_metadata?.name || 
                      data.session.user.email?.split('@')[0] || 
                      'User',
                email: data.session.user.email,
                phone: data.session.user.user_metadata?.phone || '',
                trust_reliability_cached: 0,
                created_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating user profile:', createError);
              setError(`Failed to create user profile: ${createError.message}`);
              toast({
                title: 'Profile Creation Failed',
                description: `Failed to create your user profile: ${createError.message}`,
                variant: 'destructive',
              });
              setTimeout(() => navigate('/'), 3000);
              return;
            }

            console.log('OAuth user profile created:', newProfile);
            setCurrentUser(newProfile);
          } else {
            console.error('Profile error:', profileError);
            setError(profileError.message);
            toast({
              title: 'Profile Error',
              description: profileError.message,
              variant: 'destructive',
            });
            setTimeout(() => navigate('/'), 3000);
            return;
          }
        } else {
          console.log('Existing OAuth user profile found:', profile);
          setCurrentUser(profile);
        }

        toast({
          title: 'Welcome!',
          description: 'You have been successfully signed in.',
        });
        
        navigate('/dashboard');
      } else {
        setError('No user session found');
        toast({
          title: 'Authentication Failed',
          description: 'No user session found',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setError('An unexpected error occurred');
      toast({
        title: 'Authentication Failed',
        description: 'An unexpected error occurred during authentication',
        variant: 'destructive',
      });
      setTimeout(() => navigate('/'), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Completing sign-in...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}