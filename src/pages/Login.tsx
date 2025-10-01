import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { getDataClient } from '@/lib/dataClient';
import { seedDemoData, DEMO_USERS } from '@/lib/seedData';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    // Seed demo data on first load
    seedDemoData();

    // If already logged in, go to dashboard
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background px-4">
      <Card className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-primary">LenTrust</h1>
          <p className="text-muted-foreground">Peer-to-peer lending with accountability</p>
        </div>

        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Select a demo user to continue
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => handleUserSelect(DEMO_USERS.BORROWER_A.phone, DEMO_USERS.BORROWER_A.name)}
            >
              <User className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{DEMO_USERS.BORROWER_A.name}</div>
                <div className="text-xs text-muted-foreground">{DEMO_USERS.BORROWER_A.phone}</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => handleUserSelect(DEMO_USERS.BORROWER_B.phone, DEMO_USERS.BORROWER_B.name)}
            >
              <User className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{DEMO_USERS.BORROWER_B.name}</div>
                <div className="text-xs text-muted-foreground">{DEMO_USERS.BORROWER_B.phone}</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => handleUserSelect(DEMO_USERS.LENDER_L1.phone, DEMO_USERS.LENDER_L1.name)}
            >
              <User className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{DEMO_USERS.LENDER_L1.name}</div>
                <div className="text-xs text-muted-foreground">{DEMO_USERS.LENDER_L1.phone}</div>
              </div>
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Demo app • All data is stored locally
        </p>
      </Card>
    </div>
  );
}
