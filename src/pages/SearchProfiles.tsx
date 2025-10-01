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
import { Search, Phone, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { computeReliability } from '@/lib/reliability';

export default function SearchProfiles() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
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
      const allContracts = await client.getContractsForUser(currentUserId);
      setContracts(allContracts);

      // Get unique users who have had transactions with current user
      const userIds = new Set<string>();
      allContracts.forEach(contract => {
        if (contract.borrower_id !== currentUserId) {
          userIds.add(contract.borrower_id);
        }
        if (contract.lender_id !== currentUserId) {
          userIds.add(contract.lender_id);
        }
      });

      const users = await Promise.all(
        Array.from(userIds).map(id => client.getUserById(id))
      );
      setConnectedUsers(users.filter((u): u is User => u !== null));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserContracts = (userId: string) => {
    return contracts.filter(c => 
      c.borrower_id === userId || c.lender_id === userId
    );
  };

  const getCompletedCount = (userId: string) => {
    const userContracts = getUserContracts(userId);
    return userContracts.filter(c => c.status === 'SETTLED').length;
  };

  const renderStars = (percentage: number) => {
    let stars = 0;
    if (percentage >= 90) stars = 5;
    else if (percentage >= 75) stars = 4;
    else if (percentage >= 60) stars = 3;
    else if (percentage >= 40) stars = 2;
    else stars = 1;

    return (
      <div className="flex items-center gap-1">
        {[...Array(stars)].map((_, i) => <span key={i}>⭐</span>)}
        {[...Array(5 - stars)].map((_, i) => <span key={i}>☆</span>)}
        <span className="ml-1 text-sm">{percentage}%</span>
      </div>
    );
  };

  const filteredUsers = connectedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Search & Explore" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader title="Search & Explore" showBack />
      
      <main className="flex-1 px-4 py-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profiles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
          </TabsList>

          <TabsContent value="contracts" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              View all your contracts in the "View Contracts" section
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/contracts')}
            >
              Go to Contracts
            </Button>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">User Profiles</h2>
              <span className="text-sm text-muted-foreground">{filteredUsers.length} found</span>
            </div>

            {filteredUsers.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No profiles found</p>
              </Card>
            ) : (
              filteredUsers.map((user) => {
                const userContracts = getUserContracts(user.id);
                const completedCount = getCompletedCount(user.id);
                const reliability = user.trust_reliability_cached || 0;

                return (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{user.name}</h3>
                        <div className="flex items-center text-xs">
                          {renderStars(reliability)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 text-sm">
                      <p className="text-success mb-1">Completed</p>
                      <p className="font-semibold text-success">{completedCount} contracts</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Phone className="h-4 w-4" />
                      <span>{user.phone}</span>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/user/${user.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
