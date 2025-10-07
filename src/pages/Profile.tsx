import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { useModeManager } from '@/hooks/useModeManager';
import { getDataClient, Review } from '@/lib/dataClient';
import { computeReliability, ReliabilityData } from '@/lib/reliability';
import { ReliabilityStars } from '@/components/ReliabilityStars';
import { MobileHeader } from '@/components/MobileHeader';
import { LogOut, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, currentUserId, logout } = useAuthStore();
  const { currentUser: prodCurrentUser, currentUserId: prodCurrentUserId, logout: prodLogout } = useProductionAuthStore();
  const { currentMode } = useModeManager();
  const { toast } = useToast();
  const [reliability, setReliability] = useState<ReliabilityData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [whyOpen, setWhyOpen] = useState(false);
  
  // Use appropriate auth store based on mode
  const isDemoMode = currentMode === 'demo';
  const currentAuthUser = isDemoMode ? currentUser : prodCurrentUser;
  const currentAuthUserId = isDemoMode ? currentUserId : prodCurrentUserId;
  const currentLogout = isDemoMode ? logout : prodLogout;

  useEffect(() => {
    if (!currentAuthUserId) {
      navigate('/');
      return;
    }
    loadProfile();
  }, [currentAuthUserId, navigate]);

  const loadProfile = async () => {
    if (!currentAuthUserId) return;
    setLoading(true);
    try {
      const client = getDataClient();
      const reliabilityData = await computeReliability(currentAuthUserId);
      const reviewsData = await client.getReviewsForUser(currentAuthUserId);
      
      setReliability(reliabilityData);
      setReviews(reviewsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
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
        <MobileHeader title="Profile" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  const negativeReviews = reviews.filter(r => r.stars < 3);
  const unresolvedNegatives = negativeReviews.filter(r => !r.resolved);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader title="Profile" showBack />
      
      <main className="flex-1 space-y-4 px-4 py-6">
        {/* User Info Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{currentAuthUser?.name}</h2>
              <p className="text-sm text-muted-foreground">{currentAuthUser?.phone}</p>
            </div>

            {reliability && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Trust Score</h3>
                  <span className="text-2xl font-bold text-primary">{reliability.percentage}%</span>
                </div>
                
                <ReliabilityStars reliability={reliability} size="lg" />

                <Collapsible open={whyOpen} onOpenChange={setWhyOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full">
                      {whyOpen ? 'Hide' : 'Why?'} Details
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">How it's calculated:</p>
                    <ul className="list-inside list-disc space-y-1">
                      <li>On-time or ≤7-day late repayments count as good</li>
                      <li>Resolved negative reviews after payment count as good</li>
                      <li>Based on last 12 months of contracts</li>
                      <li>Requires at least 2 completed contracts</li>
                    </ul>
                    {reliability.denominator > 0 && (
                      <p className="pt-2 font-medium">
                        Your score: {reliability.numerator} good / {reliability.denominator} total = {reliability.percentage}%
                      </p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>
        </Card>

        {/* Negative Reviews (if any) */}
        {unresolvedNegatives.length > 0 && (
          <Card className="border-destructive/50 bg-destructive-light p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-destructive">Unresolved Negative Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  You have {unresolvedNegatives.length} unresolved negative review{unresolvedNegatives.length > 1 ? 's' : ''}. 
                  These are visible to lenders and affect your reliability score.
                </p>
                {unresolvedNegatives.map((review) => (
                  <div key={review.id} className="mt-2 rounded-lg border bg-card p-3 text-sm">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium">
                        {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Reviews Summary */}
        {reviews.length > 0 && (
          <Card className="p-4">
            <h3 className="mb-3 font-semibold">All Reviews</h3>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-1 border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-star">
                      {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.text && (
                    <p className="text-sm text-muted-foreground">{review.text}</p>
                  )}
                  {review.resolved && review.stars < 3 && (
                    <span className="inline-block rounded bg-success-light px-2 py-0.5 text-xs text-success">
                      Resolved
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </main>
    </div>
  );
}
