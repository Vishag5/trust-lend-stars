import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { useContractStore } from '@/store/contractStore';
import { getDataClient, Contract } from '@/lib/dataClient';
import { Plus, LogOut, Share2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContractCard } from '@/components/ContractCard';
import { QAPanel } from '@/components/QAPanel';

const isQAMode = import.meta.env.VITE_QA_MODE === 'true';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, currentUserId, logout } = useAuthStore();
  const { contracts, setContracts } = useContractStore();
  const { toast } = useToast();
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
        title: 'Error loading contracts',
        description: 'Failed to fetch your contracts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleInvite = () => {
    const inviteText = `Join me on LenTrust - peer-to-peer lending with accountability!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(inviteText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyPhone = () => {
    if (currentUser?.phone) {
      navigator.clipboard.writeText(currentUser.phone);
      toast({ title: 'Phone copied', description: currentUser.phone });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Filter contracts by role
  const requestsAsLender = contracts.filter(
    (c) => c.lender_id === currentUserId && c.status === 'REQUESTED'
  );
  const activeAsBorrower = contracts.filter(
    (c) => c.borrower_id === currentUserId && c.status === 'ACTIVE'
  );
  const activeAsLender = contracts.filter(
    (c) => c.lender_id === currentUserId && c.status === 'ACTIVE'
  );
  const extensions = contracts.filter(
    (c) =>
      (c.lender_id === currentUserId || c.borrower_id === currentUserId) &&
      c.status === 'ACTIVE'
  );
  const youOwe = contracts.filter((c) => c.borrower_id === currentUserId && c.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">LenTrust</h1>
            {isQAMode && currentUser && (
              <div className="flex items-center gap-2 rounded-md bg-warning-light px-3 py-1">
                <span className="text-sm font-medium text-warning-foreground">
                  {currentUser.name} | {currentUser.phone}
                </span>
                <Button variant="ghost" size="sm" onClick={copyPhone}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleInvite}>
              <Share2 className="mr-2 h-4 w-4" />
              Invite
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <Button onClick={() => navigate('/create-contract')}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">
              Requests {requestsAsLender.length > 0 && `(${requestsAsLender.length})`}
            </TabsTrigger>
            <TabsTrigger value="active">
              Active {(activeAsBorrower.length + activeAsLender.length) > 0 && `(${activeAsBorrower.length + activeAsLender.length})`}
            </TabsTrigger>
            <TabsTrigger value="extensions">Extensions</TabsTrigger>
            <TabsTrigger value="you-owe">
              You Owe {youOwe.length > 0 && `(${youOwe.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {requestsAsLender.length === 0 ? (
              <p className="text-center text-muted-foreground">No pending requests</p>
            ) : (
              requestsAsLender.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  currentUserId={currentUserId!}
                  onUpdate={loadContracts}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeAsBorrower.length + activeAsLender.length === 0 ? (
              <p className="text-center text-muted-foreground">No active contracts</p>
            ) : (
              <>
                {activeAsBorrower.map((contract) => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    currentUserId={currentUserId!}
                    onUpdate={loadContracts}
                  />
                ))}
                {activeAsLender.map((contract) => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    currentUserId={currentUserId!}
                    onUpdate={loadContracts}
                  />
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="extensions" className="space-y-4">
            <p className="text-center text-muted-foreground">Extension requests will appear here</p>
          </TabsContent>

          <TabsContent value="you-owe" className="space-y-4">
            {youOwe.length === 0 ? (
              <p className="text-center text-muted-foreground">No outstanding debts</p>
            ) : (
              youOwe.map((contract) => (
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

      {/* QA Panel */}
      {isQAMode && <QAPanel onUpdate={loadContracts} />}
    </div>
  );
}
