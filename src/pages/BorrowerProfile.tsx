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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, MessageSquare, Star, Calendar, IndianRupee, TrendingUp, AlertTriangle, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReliabilityStars } from '@/components/ReliabilityStars';
import { ContractCard } from '@/components/ContractCard';

export default function BorrowerProfile() {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!currentAuthUserId) {
      navigate('/');
      return;
    }
    if (!id) {
      setError('No borrower ID provided');
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
      const client = getDataClient();
      
      // Load user data
      const userData = await client.getUserById(id);
      setUser(userData);
      
      // Load contracts for this user
      const contractsData = await client.getContractsForUser(id);
      setContracts(contractsData);
      
      // Load reviews for this user
      const reviewsData = await client.getReviewsForUser(id);
      setReviews(reviewsData);
      
      // Load all users for reviewer names
      const allUsersData = await client.getUsers();
      setAllUsers(allUsersData);
    } catch (error) {
      console.error('Error loading borrower data:', error);
      setError(`Failed to load borrower data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Error',
        description: 'Failed to load borrower data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (!user) return;
    toast({
      title: 'Calling...',
      description: `Calling ${user.name} at ${user.phone}`,
    });
  };

  const handleMessage = () => {
    if (!user) return;
    toast({
      title: 'Messaging...',
      description: `Opening message to ${user.name}`,
    });
  };

  const handleWhatsApp = () => {
    if (!user) return;
    const phoneNumber = user.phone?.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, '_blank');
  };


  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Borrower Profile" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading borrower profile...</p>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Borrower Profile" showBack />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Borrower Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'The borrower you are looking for does not exist.'}
            </p>
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

  // Separate positive and negative reviews
  const positiveReviews = reviews.filter(r => r.stars >= 4);
  const negativeReviews = reviews.filter(r => r.stars < 4);
  const unresolvedNegatives = negativeReviews.filter(r => !r.resolved);

  // Calculate stats
  const totalContracts = contracts.length;
  const settledContracts = contracts.filter(c => c.status === 'SETTLED').length;
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE' || c.status === 'DUE').length;
  const successRate = totalContracts > 0 ? Math.round((settledContracts / totalContracts) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <MobileHeader title="Borrower Profile" showBack />
      
      <main className="flex-1 px-4 py-6">
        {/* Borrower Info Card */}
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
              <div className="flex items-center gap-2 mt-2">
                <ReliabilityStars score={user.trust_reliability_cached || 0} />
              </div>
            </div>
          </div>
          
          {/* Contact Options - Only show if viewing someone else's profile */}
          {!isOwnProfile ? (
            <div className="flex justify-center gap-4">
              {/* Call Button */}
              <Button 
                onClick={handleCall}
                size="sm"
                variant="outline"
                className="h-12 w-12 p-0 rounded-full hover:bg-green-50 hover:border-green-300"
                title={`Call ${user.name}`}
              >
                <Phone className="h-5 w-5 text-green-600" />
              </Button>
              
              {/* WhatsApp Button */}
              <Button 
                onClick={handleWhatsApp}
                size="sm"
                className="h-12 w-12 p-0 rounded-full bg-green-600 hover:bg-green-700"
                title={`WhatsApp ${user.name}`}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </Button>
              
              {/* SMS Button */}
              <Button 
                onClick={handleMessage}
                size="sm"
                variant="outline"
                className="h-12 w-12 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
                title={`Send SMS to ${user.name}`}
              >
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-primary/10 rounded-md text-center">
              <UserCircle className="mx-auto h-8 w-8 mb-2 text-primary" />
              <p className="font-semibold">This is your profile</p>
              <p className="text-sm text-muted-foreground mt-1">View your borrowing history and reliability score</p>
            </div>
          )}
        </Card>

        {/* Borrower Stats */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Borrower Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalContracts}</div>
              <div className="text-sm text-muted-foreground">Total Loans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{settledContracts}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{activeContracts}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </div>
        </Card>

        {/* Unresolved Negative Reviews Alert */}
        {unresolvedNegatives.length > 0 && (
          <Card className="p-6 mb-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Unresolved Issues</h3>
                <p className="text-sm text-red-700">
                  This borrower has {unresolvedNegatives.length} unresolved negative review{unresolvedNegatives.length > 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Reviews & Ratings */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({reviews.length})</TabsTrigger>
            <TabsTrigger value="positive">Positive ({positiveReviews.length})</TabsTrigger>
            <TabsTrigger value="negative">Issues ({negativeReviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {reviews.length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground">
                    This borrower hasn't received any reviews yet.
                  </p>
                </div>
              </Card>
            ) : (
              reviews.map((review) => {
                const reviewer = allUsers.find(u => u.id === review.reviewer_id);
                return (
                  <Card key={review.id} className={`p-4 ${review.stars < 4 ? 'border-red-200 bg-red-50' : ''}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{reviewer?.name?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{reviewer?.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-2">
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
                      </div>
                      {review.stars < 4 && !review.resolved && (
                        <Badge variant="destructive">Unresolved</Badge>
                      )}
                    </div>
                    {review.text && (
                      <p className="text-sm text-muted-foreground">{review.text}</p>
                    )}
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="positive" className="space-y-4">
            {positiveReviews.length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-muted-foreground">No positive reviews yet</p>
                </div>
              </Card>
            ) : (
              positiveReviews.map((review) => {
                const reviewer = allUsers.find(u => u.id === review.reviewer_id);
                return (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{reviewer?.name?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{reviewer?.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-2">
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
                      </div>
                    </div>
                    {review.text && (
                      <p className="text-sm text-muted-foreground">{review.text}</p>
                    )}
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="negative" className="space-y-4">
            {negativeReviews.length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-muted-foreground">No issues reported</p>
                </div>
              </Card>
            ) : (
              negativeReviews.map((review) => {
                const reviewer = allUsers.find(u => u.id === review.reviewer_id);
                return (
                  <Card key={review.id} className="p-4 border-red-200 bg-red-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{reviewer?.name?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{reviewer?.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.stars ? 'text-red-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {!review.resolved && (
                        <Badge variant="destructive">Unresolved</Badge>
                      )}
                    </div>
                    {review.text && (
                      <p className="text-sm text-muted-foreground">{review.text}</p>
                    )}
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Contract History */}
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Contract History</h2>
          {contracts.length === 0 ? (
            <p className="text-muted-foreground">No contracts found</p>
          ) : (
            <div className="space-y-3">
              {contracts.slice(0, 5).map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onUpdate={loadUserData}
                />
              ))}
              {contracts.length > 5 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/contracts')}
                >
                  View All Contracts
                </Button>
              )}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
