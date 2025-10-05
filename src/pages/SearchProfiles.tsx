import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getDataClient, User, Contract } from '@/lib/dataClient';
import { MobileHeader } from '@/components/MobileHeader';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Phone, Eye, MessageCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { computeReliability } from '@/lib/reliability';
import { ReliabilityStars } from '@/components/ReliabilityStars';

export default function SearchProfiles() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pastLenders, setPastLenders] = useState<User[]>([]);
  const [pastBorrowers, setPastBorrowers] = useState<User[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      navigate('/');
      return;
    }
    loadData();
  }, [currentUserId, navigate]);

  const loadData = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const client = getDataClient();
      
      // Load all users
      const users = await client.getUsers();
      setAllUsers(users.filter(u => u.id !== currentUserId));
      
      // Load contracts to find past lenders and borrowers
      const contractsData = await client.getContractsForUser(currentUserId);
      setContracts(contractsData);
      
      // Find past lenders (users who lent money to current user)
      const lenderIds = contractsData
        .filter(c => c.borrower_id === currentUserId && c.status === 'SETTLED')
        .map(c => c.lender_id);
      const uniqueLenderIds = [...new Set(lenderIds)];
      const pastLendersData = users.filter(u => uniqueLenderIds.includes(u.id));
      setPastLenders(pastLendersData);
      
      // Find past borrowers (users who borrowed from current user)
      const borrowerIds = contractsData
        .filter(c => c.lender_id === currentUserId && c.status === 'SETTLED')
        .map(c => c.borrower_id);
      const uniqueBorrowerIds = [...new Set(borrowerIds)];
      const pastBorrowersData = users.filter(u => uniqueBorrowerIds.includes(u.id));
      setPastBorrowers(pastBorrowersData);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderUserCard = (user: User, showRating: boolean = false) => {
    // Only show rating for borrowers (reliability > 0), never for lenders (reliability = 0)
    const isBorrower = user.trust_reliability_cached !== null && user.trust_reliability_cached > 0;

    return (
      <Card key={user.id} className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.phone}</p>
            {/* Only show rating for borrowers, not lenders */}
            {showRating && isBorrower && (
              <div className="flex items-center gap-1 mt-1">
                <ReliabilityStars score={user.trust_reliability_cached} />
                <span className="text-xs text-muted-foreground">
                  {user.trust_reliability_cached}%
                </span>
              </div>
            )}
          </div>
        </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => {
            // Determine if this user is a borrower or lender based on their role in contracts
            // For now, we'll use a simple heuristic: if they have reliability score, they're a borrower
            if (user.trust_reliability_cached !== null && user.trust_reliability_cached > 0) {
              navigate(`/borrower/${user.id}`);
            } else {
              navigate(`/lender/${user.id}`);
            }
            // Scroll to top of the page
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
          }}
        >
          <Eye className="mr-1 h-3 w-3" />
          View Profile
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
        >
          <MessageCircle className="mr-1 h-3 w-3" />
          Message
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
        >
          <Phone className="mr-1 h-3 w-3" />
          Call
        </Button>
      </div>
    </Card>
    );
  };

  const renderLenderCard = (user: User) => (
    <Card key={user.id} className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.phone}</p>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">Past Lender</p>
        <p className="text-xs text-muted-foreground">Previously lent you money</p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => {
            // Determine if this user is a borrower or lender based on their role in contracts
            // For now, we'll use a simple heuristic: if they have reliability score, they're a borrower
            if (user.trust_reliability_cached !== null && user.trust_reliability_cached > 0) {
              navigate(`/borrower/${user.id}`);
            } else {
              navigate(`/lender/${user.id}`);
            }
            // Scroll to top of the page
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
          }}
        >
          <Eye className="mr-1 h-3 w-3" />
          View Profile
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
        >
          <MessageCircle className="mr-1 h-3 w-3" />
          Message
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
        >
          <Phone className="mr-1 h-3 w-3" />
          Call
        </Button>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Find People" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <MobileHeader title="Find People" showBack />
      
      <main className="flex-1 px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
              placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
          </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Users ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="lenders">Past Lenders ({pastLenders.length})</TabsTrigger>
            <TabsTrigger value="borrowers">Past Borrowers ({pastBorrowers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
          {filteredUsers.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                {searchQuery ? 'No users found matching your search' : 'No users available'}
              </p>
            ) : (
              filteredUsers.map(user => renderUserCard(user, true))
            )}
          </TabsContent>

          <TabsContent value="lenders" className="space-y-3">
            {pastLenders.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No past lenders found</p>
            ) : (
              pastLenders.map(user => renderLenderCard(user))
            )}
          </TabsContent>

          <TabsContent value="borrowers" className="space-y-3">
            {pastBorrowers.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No past borrowers found</p>
            ) : (
              pastBorrowers.map(user => renderUserCard(user, true))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
