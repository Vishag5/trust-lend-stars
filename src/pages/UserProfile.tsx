import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { useModeManager } from '@/hooks/useModeManager';
import { getDataClient, User, Contract, Review } from '@/lib/dataClient';
import { MobileHeader } from '@/components/MobileHeader';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Star, MessageCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { computeReliability } from '@/lib/reliability';
import { ContractCard } from '@/components/ContractCard';
import { ReliabilityStars } from '@/components/ReliabilityStars';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { currentUserId: prodCurrentUserId } = useProductionAuthStore();
  const { currentMode } = useModeManager();
  const { toast } = useToast();
  
  // Use appropriate auth store based on mode
  const isDemoMode = currentMode === 'demo';
  const currentAuthUserId = isDemoMode ? currentUserId : prodCurrentUserId;
  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reliability, setReliability] = useState({ percentage: 0, stars: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!currentAuthUserId) {
      navigate('/');
      return;
    }
    if (!id) {
      setError('No user ID provided');
      setLoading(false);
      return;
    }
    loadUserData();
  }, [currentAuthUserId, id, navigate]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const loadUserData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Loading user data for ID:', id);
      const client = getDataClient();
      
      // First, let's see all available users
      const allUsersData = await client.getUsers();
      console.log('All available users:', allUsersData);
      setAllUsers(allUsersData);
      
      // Load user data
      const userData = await client.getUserById(id);
      console.log('User data loaded:', userData);
      setUser(userData);
      
      // Load contracts for this user
      const contractsData = await client.getContractsForUser(id);
      console.log('Contracts loaded:', contractsData);
      setContracts(contractsData);
      
      // Load reviews for this user
      const reviewsData = await client.getReviewsForUser(id);
      console.log('Reviews loaded:', reviewsData);
      setReviews(reviewsData);
      
      // Calculate reliability
      const reliabilityData = computeReliability(contractsData);
      setReliability(reliabilityData);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError(`Failed to load user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="User Profile" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading user profile...</p>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="User Profile" showBack />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">User Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'The user you are looking for does not exist.'}
            </p>
            
            {/* Debug info */}
            <div className="text-left text-sm mb-4 p-3 bg-muted rounded">
              <p><strong>Requested ID:</strong> {id}</p>
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
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const isOwnProfile = currentUserId === id;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length 
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <MobileHeader title="User Profile" showBack />
      
      <main className="flex-1 px-4 py-6">
        {/* User Info Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.phone}</p>
              <div className="flex items-center gap-2 mt-2">
                <ReliabilityStars score={user.trust_reliability_cached || 0} />
                <span className="text-sm text-muted-foreground">
                  {user.trust_reliability_cached || 0}% reliable
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{contracts.length}</div>
              <div className="text-sm text-muted-foreground">Total Contracts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <MessageCircle className="mr-2 h-4 w-4" />
              Message
            </Button>
            <Button variant="outline" className="flex-1">
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
            {!isOwnProfile && (
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => navigate('/create-contract')}
              >
                Request Loan
              </Button>
            )}
          </div>
        </Card>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Reviews & Ratings</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.text && (
                    <p className="text-sm text-muted-foreground">{review.text}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* No Reviews Message */}
        {reviews.length === 0 && (
          <Card className="p-6 mb-6">
            <div className="text-center">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                This user hasn't received any reviews yet.
              </p>
            </div>
          </Card>
        )}

        {/* Contracts Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({contracts.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({contracts.filter(c => c.status === 'ACTIVE' || c.status === 'DUE').length})</TabsTrigger>
            <TabsTrigger value="settled">Settled ({contracts.filter(c => c.status === 'SETTLED').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {contracts.length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-muted-foreground">No contracts found</p>
                </div>
              </Card>
            ) : (
              contracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onUpdate={loadUserData}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-3">
            {contracts.filter(c => c.status === 'ACTIVE' || c.status === 'DUE').length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-muted-foreground">No active contracts</p>
                </div>
              </Card>
            ) : (
              contracts
                .filter(c => c.status === 'ACTIVE' || c.status === 'DUE')
                .map((contract) => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    onUpdate={loadUserData}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="settled" className="space-y-3">
            {contracts.filter(c => c.status === 'SETTLED').length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-muted-foreground">No settled contracts</p>
                </div>
              </Card>
            ) : (
              contracts
                .filter(c => c.status === 'SETTLED')
                .map((contract) => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    onUpdate={loadUserData}
                  />
                ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}