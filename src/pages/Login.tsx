import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { getDataClient } from '@/lib/dataClient';
import { QA_USERS, seedDemoData } from '@/lib/seedData';
import { Handshake } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const isQAMode = import.meta.env.VITE_QA_MODE === 'true';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const { toast } = useToast();

  const handleLogin = async (phoneNumber: string) => {
    setLoading(true);
    try {
      // Seed demo data if needed
      await seedDemoData();

      const client = getDataClient();
      let user = await client.getUserByPhone(phoneNumber);

      if (!user) {
        toast({
          title: 'User not found',
          description: 'No account found with this phone number',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setCurrentUser({ id: user.id, name: user.name, phone: user.phone });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'An error occurred during login',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (qaUser: typeof QA_USERS[keyof typeof QA_USERS]) => {
    handleLogin(qaUser.phone);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Handshake className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">LenTrust</CardTitle>
          <CardDescription className="text-base">
            Peer-to-peer lending with accountability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isQAMode && (
            <div className="space-y-2 rounded-lg border border-warning bg-warning-light p-4">
              <p className="text-sm font-semibold text-warning-foreground">QA Quick Login</p>
              <div className="space-y-2">
                {Object.values(QA_USERS).map((qaUser) => (
                  <Button
                    key={qaUser.phone}
                    onClick={() => handleQuickLogin(qaUser)}
                    disabled={loading}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {qaUser.name} — {qaUser.phone}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              placeholder="+91 90000 11111"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            onClick={() => handleLogin(phone)}
            disabled={loading || !phone}
            className="w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
