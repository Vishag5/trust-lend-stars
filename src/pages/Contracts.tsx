import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getDataClient, Contract } from '@/lib/dataClient';
import { MobileHeader } from '@/components/MobileHeader';
import { ContractCard } from '@/components/ContractCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function Contracts() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      navigate('/');
      return;
    }
    loadContracts();
  }, [currentUserId, navigate]);

  const loadContracts = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const client = getDataClient();
      const data = await client.getContractsForUser(currentUserId);
      setContracts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contracts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Contracts" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  // Sort contracts: REQUESTED first, then ACTIVE/DUE, then SETTLED last
  const sortedContracts = [...contracts].sort((a, b) => {
    const statusOrder = { 'REQUESTED': 0, 'ACTIVE': 1, 'DUE': 1, 'SETTLED': 3, 'REJECTED': 4 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const allContracts = sortedContracts.filter(c => c.status !== 'REJECTED');
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE' || c.status === 'DUE');
  const settledContracts = contracts.filter(c => c.status === 'SETTLED');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader title="View Contracts" showBack />
      
      <main className="flex-1 px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">Contract History</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          View all your contracts, sorted by status
        </p>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({allContracts.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeContracts.length})</TabsTrigger>
            <TabsTrigger value="settled">Settled ({settledContracts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {allContracts.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No contracts found</p>
            ) : (
              allContracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  currentUserId={currentUserId!}
                  onUpdate={loadContracts}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-3">
            {activeContracts.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No active contracts</p>
            ) : (
              activeContracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  currentUserId={currentUserId!}
                  onUpdate={loadContracts}
                  showActions={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="settled" className="space-y-3">
            {settledContracts.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No settled contracts</p>
            ) : (
              settledContracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  currentUserId={currentUserId!}
                  onUpdate={loadContracts}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
