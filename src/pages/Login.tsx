import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { getDataClient } from '@/lib/dataClient';
import { seedDemoData, DEMO_USERS } from '@/lib/seedData';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { PhoneAuthForm } from '@/components/auth/PhoneAuthForm';
import { UserOnboarding } from '@/components/auth/UserOnboarding';
import { User, Chrome, Phone, Shield } from 'lucide-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function Login() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, isAuthenticated, checkAuth } = useAuthStore();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  
  // Feature flags
  const isDemoMode = useFeatureFlag('guestAccess');
  const showDebugInfo = useFeatureFlag('debugPanel');

  useEffect(() => {
    // Check authentication status
    checkAuth();
    
    // Seed demo data on first load (only in demo mode)
    if (isDemoMode) {
      const initializeData = async () => {
        console.log('Login: Initializing seed data...');
        try {
          await seedDemoData();
          console.log('Login: Seed data initialized successfully');
        } catch (error) {
          console.error('Login: Error seeding data:', error);
        }
      };
      initializeData();
    }

    // If already logged in, go to dashboard
    if (isAuthenticated && currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, isAuthenticated, navigate, checkAuth, isDemoMode]);

  const handleUserSelect = async (phone: string, name: string) => {
    try {
      const client = getDataClient();
      const user = await client.getUserByPhone(phone);
      
      if (user) {
        setCurrentUser(user);
        toast({
          title: `Welcome, ${name}!`,
          description: `Logged in as ${phone}`,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to select user',
        variant: 'destructive',
      });
    }
  };

  const handleAuthSuccess = (user: any) => {
    setAuthUser(user);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (userData: any) => {
    setCurrentUser(userData);
    setShowOnboarding(false);
    toast({
      title: 'Welcome to LenTrust!',
      description: 'Your profile has been created successfully',
    });
    navigate('/dashboard');
  };

  // Show onboarding if user just authenticated
  if (showOnboarding && authUser) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background px-4 sm:px-6">
        <UserOnboarding
          user={authUser}
          onComplete={handleOnboardingComplete}
          onError={(error) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to create profile',
              variant: 'destructive',
            });
          }}
          className="w-full max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background px-4 sm:px-6">
      <Card className="w-full max-w-md space-y-6 p-6 sm:p-8 shadow-xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="url(#gradient)" opacity="0.2"/>
                <path d="M50 20 L60 40 L82 43 L66 58 L70 80 L50 70 L30 80 L34 58 L18 43 L40 40 Z" fill="url(#gradient)"/>
                <text x="50" y="58" textAnchor="middle" fill="#6366f1" fontSize="18" fontWeight="bold">LT</text>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">LenTrust</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Peer-to-peer lending with accountability</p>
        </div>

        {isDemoMode ? (
          // Demo Mode - Show demo users
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Select a demo user to continue
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 sm:py-5 hover:bg-primary/5 transition-all active:scale-[0.98]"
                onClick={() => handleUserSelect(DEMO_USERS.BORROWER_A.phone, DEMO_USERS.BORROWER_A.name)}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">{DEMO_USERS.BORROWER_A.name}</div>
                  <div className="text-xs text-muted-foreground">{DEMO_USERS.BORROWER_A.phone}</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 sm:py-5 hover:bg-primary/5 transition-all active:scale-[0.98]"
                onClick={() => handleUserSelect(DEMO_USERS.BORROWER_B.phone, DEMO_USERS.BORROWER_B.name)}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">{DEMO_USERS.BORROWER_B.name}</div>
                  <div className="text-xs text-muted-foreground">{DEMO_USERS.BORROWER_B.phone}</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 sm:py-5 hover:bg-primary/5 transition-all active:scale-[0.98]"
                onClick={() => handleUserSelect(DEMO_USERS.LENDER_L1.phone, DEMO_USERS.LENDER_L1.name)}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">{DEMO_USERS.LENDER_L1.name}</div>
                  <div className="text-xs text-muted-foreground">{DEMO_USERS.LENDER_L1.phone}</div>
                </div>
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Demo app • All data is stored locally
            </p>
          </div>
        ) : (
          // Production Mode - Show authentication options
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="google" className="flex items-center gap-2">
                <Chrome className="h-4 w-4" />
                Google
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="google" className="space-y-4">
              <div className="text-center space-y-2">
                <Shield className="h-8 w-8 mx-auto text-primary" />
                <h3 className="text-lg font-semibold">Sign in with Google</h3>
                <p className="text-sm text-muted-foreground">
                  Quick and secure authentication
                </p>
              </div>
              <GoogleAuthButton
                onSuccess={handleAuthSuccess}
                onError={(error) => {
                  toast({
                    title: 'Authentication Error',
                    description: error.message || 'Google sign-in failed',
                    variant: 'destructive',
                  });
                }}
              />
            </TabsContent>
            
            <TabsContent value="phone" className="space-y-4">
              <PhoneAuthForm
                onSuccess={handleAuthSuccess}
                onError={(error) => {
                  toast({
                    title: 'Authentication Error',
                    description: error.message || 'Phone authentication failed',
                    variant: 'destructive',
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        )}

        {showDebugInfo && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Debug Info:</strong> Demo Mode: {isDemoMode ? 'ON' : 'OFF'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
