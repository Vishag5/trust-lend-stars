import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { useModeManager } from '@/hooks/useModeManager';
import { getDataClient, User } from '@/lib/dataClient';
import { MobileHeader } from '@/components/MobileHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, User as UserIcon, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { currentUserId, currentUser, logout } = useAuthStore();
  const { currentUserId: prodCurrentUserId, currentUser: prodCurrentUser, logout: prodLogout } = useProductionAuthStore();
  const { currentMode } = useModeManager();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
  });
  
  // Use appropriate auth store based on mode
  const isDemoMode = currentMode === 'demo';
  const currentAuthUserId = isDemoMode ? currentUserId : prodCurrentUserId;
  const currentAuthUser = isDemoMode ? currentUser : prodCurrentUser;
  const currentLogout = isDemoMode ? logout : prodLogout;

  useEffect(() => {
    if (!currentAuthUserId) {
      navigate('/');
      return;
    }
    loadUser();
  }, [currentAuthUserId, navigate]);

  const loadUser = async () => {
    if (!currentAuthUserId) return;
    setLoading(true);
    try {
      const client = getDataClient();
      const userData = await client.getUserById(currentAuthUserId);
      setUser(userData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await currentLogout();
    navigate('/');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Settings" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading settings...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <MobileHeader title="Settings" showBack />
      
      <main className="flex-1 space-y-4 px-4 py-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={user?.name || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={user?.phone || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Contact support to update your profile information
            </p>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, email: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via SMS
                </p>
              </div>
              <Switch
                checked={notifications.sms}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, sms: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser notifications
                </p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, push: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Settings
            </Button>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help & Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/help')}
            >
              Help Center
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Contact Support
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Report a Bug
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Terms of Service
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Policy
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Logout */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
