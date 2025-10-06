import React from 'react';
import { Button } from '../ui/button';
import { Chrome } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GoogleAuthButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export function GoogleAuthButton({ onSuccess, onError, className }: GoogleAuthButtonProps) {
  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Google auth error:', error);
        onError?.(error);
      } else {
        console.log('Google auth initiated:', data);
      }
    } catch (error) {
      console.error('Google auth error:', error);
      onError?.(error);
    }
  };

  return (
    <Button
      onClick={handleGoogleAuth}
      className={`w-full flex items-center gap-2 ${className}`}
      variant="outline"
    >
      <Chrome className="h-4 w-4" />
      Continue with Google
    </Button>
  );
}
