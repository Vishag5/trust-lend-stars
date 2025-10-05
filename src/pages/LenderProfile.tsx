import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getDataClient, User } from '@/lib/dataClient';
import { MobileHeader } from '@/components/MobileHeader';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, MessageCircle, MessageSquare, Star, User as UserIcon, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LenderProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    console.log('LenderProfile mounted with ID:', id);
    console.log('Current user ID:', currentUserId);
    
    if (!currentUserId) {
      console.log('No current user, redirecting to login');
      navigate('/');
      return;
    }
    if (!id) {
      console.log('No lender ID provided');
      setError('No lender ID provided');
      setLoading(false);
      return;
    }
    loadUserData();
  }, [currentUserId, id, navigate]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const loadUserData = async () => {
    if (!id) return;
    console.log('Starting to load lender data for ID:', id);
    setLoading(true);
    setError(null);
    setDebugInfo(`Loading lender data for ID: ${id}`);
    
    try {
      const client = getDataClient();
      
      // First, let's see all available users
      console.log('Fetching all users...');
      const allUsersData = await client.getUsers();
      console.log('All available users:', allUsersData);
      setAllUsers(allUsersData);
      setDebugInfo(`Found ${allUsersData.length} users: ${allUsersData.map(u => `${u.name}(${u.id})`).join(', ')}`);
      
      // Load user data
      console.log('Fetching user by ID:', id);
      const userData = await client.getUserById(id);
      console.log('Lender data loaded successfully:', userData);
      setUser(userData);
      setDebugInfo(`Successfully loaded lender: ${userData.name} (${userData.id})`);
    } catch (error) {
      console.error('Error loading lender data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load lender data: ${errorMessage}`);
      setDebugInfo(`Error: ${errorMessage}`);
      toast({
        title: 'Error',
        description: 'Failed to load lender data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (!user) return;
    console.log('Calling lender:', user.name, user.phone);
    toast({
      title: 'Calling...',
      description: `Calling ${user.name} at ${user.phone}`,
    });
  };

  const handleMessage = () => {
    if (!user) return;
    console.log('Messaging lender:', user.name);
    toast({
      title: 'Messaging...',
      description: `Opening message to ${user.name}`,
    });
  };

  const handleWhatsApp = () => {
    if (!user) return;
    const phoneNumber = user.phone?.replace(/\D/g, ''); // Remove non-digits
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    console.log('Opening WhatsApp for:', user.name, phoneNumber);
    window.open(whatsappUrl, '_blank');
  };

  const handleRequestLoan = () => {
    if (!user) return;
    console.log('Requesting loan from:', user.name);
    navigate('/create-contract', { state: { lenderPhone: user.phone } });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Lender Profile" showBack />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Loading lender profile...</p>
            <p className="text-xs text-muted-foreground">{debugInfo}</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Lender Profile" showBack />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Lender Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'The lender you are looking for does not exist.'}
            </p>
            
            {/* Debug info */}
            <div className="text-left text-sm mb-4 p-3 bg-muted rounded">
              <p><strong>Requested ID:</strong> {id}</p>
              <p><strong>Debug Info:</strong> {debugInfo}</p>
              <p><strong>Available Users:</strong></p>
              <ul className="list-disc list-inside">
                {allUsers.map(u => (
                  <li key={u.id}>{u.name} (ID: {u.id})</li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/search')} className="w-full">
                Find People
              </Button>
              <Button variant="outline" onClick={loadUserData} className="w-full">
                Retry Loading
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const isOwnProfile = currentUserId === id;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <MobileHeader title="Lender Profile" showBack />
      
      <main className="flex-1 px-4 py-6">
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="p-3 mb-4 bg-yellow-50 border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Debug:</strong> {debugInfo}
            </p>
          </Card>
        )}

        {/* Lender Contact Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground text-lg">{user.phone}</p>
            </div>
          </div>
          
          {/* Contact Options - Only show if viewing someone else's profile */}
          {!isOwnProfile ? (
            <div className="space-y-3">
              <Button 
                onClick={handleCall}
                className="w-full h-12 text-lg"
                variant="outline"
              >
                <Phone className="mr-3 h-5 w-5" />
                Call {user.name}
              </Button>
              
              <Button 
                onClick={handleMessage}
                className="w-full h-12 text-lg"
                variant="outline"
              >
                <MessageCircle className="mr-3 h-5 w-5" />
                Send Message
              </Button>
              
              <Button 
                onClick={handleWhatsApp}
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageSquare className="mr-3 h-5 w-5" />
                WhatsApp
              </Button>
              
              <Button 
                onClick={handleRequestLoan}
                className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
              >
                <UserIcon className="mr-3 h-5 w-5" />
                Request Loan
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-primary/10 rounded-md text-center">
              <UserCircle className="mx-auto h-8 w-8 mb-2 text-primary" />
              <p className="font-semibold">This is your profile</p>
              <p className="text-sm text-muted-foreground mt-1">View your lending history</p>
            </div>
          )}
        </Card>

        {/* Lender Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Lender Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{user.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since:</span>
              <span className="font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-12"
              onClick={() => navigate('/search')}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Find More People
            </Button>
            <Button 
              variant="outline" 
              className="h-12"
              onClick={() => navigate('/contracts')}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              View Contracts
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}