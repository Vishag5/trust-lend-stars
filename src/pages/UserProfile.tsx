import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getDataClient, User, Contract, Review } from '@/lib/dataClient';
import { MobileHeader } from '@/components/MobileHeader';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { computeReliability } from '@/lib/reliability';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reliability, setReliability] = useState({ percentage: 0, stars: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || !id) {
      navigate('/');
      return;
    }
    loadUserData();
  }, [currentUserId, id, navigate]);

  const loadUserData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const client = getDataClient();
      const userData = await client.getUserById(id);
      setUser(userData);

      const allContracts = await client.getContractsForUser(id);
      setContracts(allContracts);

      const userReviews = await client.getReviewsForUser(id);
      setReviews(userReviews);

      const reliabilityData = await computeReliability(id);
      setReliability(reliabilityData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="User Profile" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const completionRate = contracts.filter(c => c.status === 'SETTLED').length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
    : '0';

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`}>⭐</span>)}
        {hasHalfStar && <span>⭐</span>}
        {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`}>☆</span>)}
      </>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader title="User Profile" showBack />
      
      <main className="flex-1 px-4 py-6 space-y-6">
        {/* User Info Card */}
        <Card className="p-6 text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
          <div className="flex items-center justify-center gap-2 text-yellow-500 text-xl mb-1">
            {renderStars(parseFloat(avgRating))}
          </div>
          <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{contracts.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Contracts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{reliability.percentage}%</div>
            <div className="text-xs text-muted-foreground mt-1">Completion Rate</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{avgRating}</div>
            <div className="text-xs text-muted-foreground mt-1">Rating</div>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user.phone}</span>
            </div>
          </div>
        </Card>

        {/* Tabs for Reviews and Contract History */}
        <Tabs defaultValue="reviews" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="contracts">Contract History</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-3">
            {reviews.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No reviews yet</p>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card 
                  key={review.id} 
                  className={`p-4 ${review.stars <= 2 ? 'bg-red-50 border-red-200' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{review.reviewer?.name}</h3>
                      <div className="text-yellow-500 text-sm">
                        {renderStars(review.stars)}
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm ${review.stars <= 2 ? 'text-red-700' : 'text-muted-foreground'}`}>
                    {review.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-3">
            {contracts.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-muted-foreground mb-2">Contract history would appear here</p>
                <p className="text-sm text-muted-foreground">
                  {completionRate} of {contracts.length} contracts completed
                </p>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-muted-foreground mb-2">Contract history would appear here</p>
                <p className="text-sm text-muted-foreground">
                  {completionRate} of {contracts.length} contracts completed
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
