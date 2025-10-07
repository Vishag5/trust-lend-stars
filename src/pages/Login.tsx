import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { getDataClient } from '@/lib/dataClient';
import { seedDemoData, DEMO_USERS } from '@/lib/seedData';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { PhoneAuthForm } from '@/components/auth/PhoneAuthForm';
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm';
import { OnboardingForm } from '@/components/OnboardingForm';
import { User, Chrome, Phone, Shield, Mail } from 'lucide-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useModeManager } from '@/hooks/useModeManager';
import { ADMIN_CONFIG } from '@/lib/adminConfig';

export default function Login() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, isAuthenticated, checkAuth } = useAuthStore();
  const { currentUser: prodCurrentUser, isAuthenticated: prodIsAuthenticated, checkAuth: prodCheckAuth } = useProductionAuthStore();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  
  // Mode management - Use same method as Dashboard
  const { currentMode } = useModeManager();
  const isDemoMode = currentMode === 'demo';
  
  // Feature flags
  const showDebugInfo = useFeatureFlag('debugPanel');
  
  // Debug: Log mode detection (temporarily enabled for debugging)
  // console.log('Login.tsx - currentMode:', currentMode);
  // console.log('Login.tsx - isDemoMode:', isDemoMode);
  
  // Use appropriate auth store based on mode
  const currentAuthUser = isDemoMode ? currentUser : prodCurrentUser;
  const currentIsAuthenticated = isDemoMode ? isAuthenticated : prodIsAuthenticated;
  
  // Stabilize the checkAuth function to prevent infinite loops
  const currentCheckAuth = useCallback(() => {
    if (isDemoMode) {
      checkAuth();
    } else {
      prodCheckAuth();
    }
  }, [isDemoMode, checkAuth, prodCheckAuth]);

  useEffect(() => {
    // Check authentication status
    currentCheckAuth();
    
    // Seed demo data on first load (only in demo mode)
    if (isDemoMode) {
      const initializeData = async () => {
        try {
          await seedDemoData();
        } catch (error) {
          console.error('Login: Error seeding data:', error);
        }
      };
      initializeData();
    }

    // If already logged in, go to dashboard
    if (currentIsAuthenticated && currentAuthUser) {
      navigate('/dashboard');
    }
  }, [currentAuthUser, currentIsAuthenticated, navigate, currentCheckAuth, isDemoMode, currentMode]);

  // Add a separate effect to handle logout redirects
  useEffect(() => {
    // Check if we're coming from a logout (no user but was authenticated)
    const handleLogoutRedirect = () => {
      // If we're in production mode and no user is found, ensure we stay on login page
      if (!isDemoMode && !currentAuthUser && !currentIsAuthenticated) {
        // Force clear any remaining state
        console.log('Login: Handling logout redirect - staying on login page');
      }
    };

    handleLogoutRedirect();
  }, [isDemoMode, currentAuthUser, currentIsAuthenticated]);

  const handleUserSelect = async (phone: string, name: string) => {
    try {
      const client = getDataClient();
      const user = await client.getUserByPhone(phone);
      
      if (user) {
        setCurrentUser(user);
        
        // Check if user is admin
        const isAdmin = ADMIN_CONFIG.isAdmin(user.email || '', user.phone);
        const adminType = ADMIN_CONFIG.getAdminType(user.email || '', user.phone);
        
        toast({
          title: `Welcome, ${name}!`,
          description: isAdmin ? `Admin access granted (${adminType})` : `Logged in as ${phone}`,
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
        <OnboardingForm
          user={authUser}
          onComplete={handleOnboardingComplete}
          onError={(error) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to create profile',
              variant: 'destructive',
            });
          }}
          className="w-full max-w-2xl"
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

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 sm:py-5 hover:bg-primary/5 transition-all active:scale-[0.98] border-amber-200 bg-amber-50"
                onClick={() => handleUserSelect(DEMO_USERS.ADMIN.phone, DEMO_USERS.ADMIN.name)}
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">{DEMO_USERS.ADMIN.name}</div>
                  <div className="text-xs text-muted-foreground">{DEMO_USERS.ADMIN.phone}</div>
                  <div className="text-xs text-amber-600 font-medium">Admin Access</div>
                </div>
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Demo app • All data is stored locally
            </p>
          </div>
        ) : (
          // Production Mode - Show basic email/password authentication
          <EmailPasswordForm
            onSuccess={handleAuthSuccess}
            onError={(error) => {
              toast({
                title: 'Authentication Error',
                description: error.message || 'Authentication failed',
                variant: 'destructive',
              });
            }}
            className="w-full"
          />
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
