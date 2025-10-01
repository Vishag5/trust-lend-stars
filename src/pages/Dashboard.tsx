import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { getDataClient, Contract, Extension } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';
import { Plus, Search, FileText, Clock, User, Calendar, IndianRupee } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { ReliabilityStars } from '@/components/ReliabilityStars';
import { computeReliability } from '@/lib/reliability';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
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
      const contractsData = await client.getContractsForUser(currentUserId);
      setContracts(contractsData);
      
      // Load extensions for all contracts
      const allExtensions: Extension[] = [];
      for (const contract of contractsData) {
        const contractExtensions = await client.getExtensionsForContract(contract.id);
        allExtensions.push(...contractExtensions);
      }
      setExtensions(allExtensions);
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

  const handleAccept = async (contractId: string) => {
    try {
      const client = getDataClient();
      await client.updateContract(contractId, { 
        status: 'ACTIVE', 
        disbursal_proof_url: 'mock://proof.jpg' 
      });
      toast({ title: 'Contract accepted!' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept contract',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (contractId: string) => {
    try {
      const client = getDataClient();
      await client.updateContract(contractId, { status: 'REJECTED' });
      toast({ title: 'Contract rejected' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject contract',
        variant: 'destructive',
      });
    }
  };

  const handleExtensionAction = async (extensionId: string, approved: boolean) => {
    try {
      const client = getDataClient();
      await client.approveExtension(extensionId, approved);
      toast({ title: approved ? 'Extension approved' : 'Extension rejected' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process extension',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <MobileHeader />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  const requestsAsLender = contracts.filter(
    (c) => c.lender_id === currentUserId && c.status === 'REQUESTED'
  );
  
  const pendingExtensions = extensions.filter(e => {
    const contract = contracts.find(c => c.id === e.contract_id);
    return contract && contract.lender_id === currentUserId && e.approved === null;
  });
  
  const activeContracts = contracts.filter(
    (c) => (c.borrower_id === currentUserId || c.lender_id === currentUserId) && 
    (c.status === 'ACTIVE' || c.status === 'DUE')
  );
  
  const youOwe = contracts.filter(
    c => c.borrower_id === currentUserId && (c.status === 'ACTIVE' || c.status === 'DUE')
  );
  
  const theyOweYou = contracts.filter(
    c => c.lender_id === currentUserId && (c.status === 'ACTIVE' || c.status === 'DUE')
  );

  const totalLent = theyOweYou.reduce((sum, c) => sum + c.amount, 0);
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysOverdue = (dueDate: string) => {
    const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / (24 * 60 * 60 * 1000));
    return days;
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <MobileHeader />
      
      <main className="flex-1 space-y-4 px-4 py-6">
        {/* Summary Stats */}
        <div className="text-sm text-muted-foreground">
          {requestsAsLender.length > 0 && `${requestsAsLender.length} new requests`}
          {requestsAsLender.length > 0 && activeContracts.length > 0 && ' • '}
          {activeContracts.length > 0 && `${activeContracts.length} active contracts`}
          {(requestsAsLender.length > 0 || pendingExtensions.length > 0) && ` • ${requestsAsLender.length + pendingExtensions.length} need attention`}
        </div>

        {/* Loan Requests */}
        {requestsAsLender.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Loan Requests ({requestsAsLender.length})</h2>
            {requestsAsLender.map((contract) => (
              <Card key={contract.id} className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {contract.borrower ? getInitials(contract.borrower.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{contract.borrower?.name}</h3>
                      {contract.borrower?.trust_reliability_cached !== null && (
                        <div className="text-xs text-muted-foreground">
                          Reliability: {contract.borrower.trust_reliability_cached}%
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={contract.status} />
                </div>
                
                <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Amount</div>
                      <div className="font-semibold">₹{contract.amount}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Due Date</div>
                      <div className="font-semibold">{format(new Date(contract.due_at), 'MM/dd/yyyy')}</div>
                    </div>
                  </div>
                </div>

                {contract.reason && (
                  <div className="mb-3 text-sm">
                    <span className="font-medium">Purpose:</span> {contract.reason}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-success hover:bg-success/90" 
                    onClick={() => handleAccept(contract.id)}
                  >
                    ✓ Accept
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1" 
                    onClick={() => handleReject(contract.id)}
                  >
                    ✕ Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Extension Requests */}
        {pendingExtensions.length > 0 && (
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              Extension Requests ({pendingExtensions.length})
            </h2>
            {pendingExtensions.map((extension) => {
              const contract = contracts.find(c => c.id === extension.contract_id);
              if (!contract) return null;
              return (
                <Card key={extension.id} className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {contract.borrower ? getInitials(contract.borrower.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{contract.borrower?.name}</h3>
                      </div>
                    </div>
                    <StatusBadge status="REQUESTED" />
                  </div>
                  
                  <div className="mb-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loan Amount:</span>
                      <span className="font-semibold">₹{contract.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Request Date:</span>
                      <span className="font-semibold">{format(new Date(extension.created_at), 'M/dd/yyyy')}</span>
                    </div>
                  </div>

                  <div className="mb-3 rounded-lg bg-muted p-3 text-sm">
                    <div className="mb-1 flex items-center gap-2 font-medium">
                      <Clock className="h-4 w-4" />
                      Extension Request:
                    </div>
                    <p className="text-muted-foreground">
                      {contract.borrower?.name} is asking for {extension.extra_days || 5} additional days to repay the loan.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/contract/${contract.id}`)}
                    >
                      Review
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleExtensionAction(extension.id, false)}
                    >
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleExtensionAction(extension.id, true)}
                    >
                      Accept
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Active Contracts & Total Lent */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold">{activeContracts.length}</div>
            <div className="text-sm text-muted-foreground">Active Contracts</div>
            <div className="mt-1 text-xs text-muted-foreground">ongoing loans</div>
          </Card>
          <Card className="bg-success p-4 text-white">
            <div className="text-2xl font-bold">₹{totalLent}</div>
            <div className="text-sm">Total Lent</div>
            <div className="mt-1 text-xs opacity-80">current value</div>
          </Card>
        </div>

        {/* Create New Contract & Actions */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => navigate('/create-contract')}
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Contract
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate('/contracts')}>
            <Search className="mr-2 h-4 w-4" />
            Search Profiles
          </Button>
          <Button variant="outline" onClick={() => navigate('/contracts')}>
            <FileText className="mr-2 h-4 w-4" />
            View Contracts
          </Button>
        </div>

        {/* Recent Contracts */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Contracts</h2>
          <p className="text-sm text-muted-foreground">Track money you owe to others and money owed to you</p>

          {/* You Owe */}
          {youOwe.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-warning">⚠️ You Owe</span>
                <span className="text-muted-foreground">• {youOwe.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Money you need to pay back</p>
              {youOwe.map((contract) => (
                <Card 
                  key={contract.id} 
                  className="cursor-pointer p-4 hover:bg-muted/50" 
                  onClick={() => navigate(`/contract/${contract.id}`)}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {contract.lender ? getInitials(contract.lender.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{contract.lender?.name}</h3>
                      </div>
                    </div>
                    {isOverdue(contract.due_at) ? (
                      <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-medium text-white">
                        {getDaysOverdue(contract.due_at)} days overdue
                      </span>
                    ) : (
                      <StatusBadge status={contract.status} />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <span className="font-semibold">₹{contract.amount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{format(new Date(contract.due_at), 'MM/dd/yyyy')}</span>
                    </div>
                  </div>
                  {contract.reason && (
                    <p className="mt-2 text-sm text-muted-foreground">{contract.reason}</p>
                  )}
                  {contract.status === 'ACTIVE' && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Clock className="mr-2 h-4 w-4" />
                        Ask for Time
                      </Button>
                      <Button size="sm" className="flex-1">
                        Settle Up
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* They Owe You */}
          {theyOweYou.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-success">💰 They Owe You</span>
                <span className="text-muted-foreground">• {theyOweYou.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Money others need to pay back to you</p>
              {theyOweYou.map((contract) => (
                <Card 
                  key={contract.id} 
                  className="cursor-pointer p-4 hover:bg-muted/50" 
                  onClick={() => navigate(`/contract/${contract.id}`)}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {contract.borrower ? getInitials(contract.borrower.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{contract.borrower?.name}</h3>
                      </div>
                    </div>
                    {isOverdue(contract.due_at) ? (
                      <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-medium text-white">
                        {getDaysOverdue(contract.due_at)} days overdue
                      </span>
                    ) : (
                      <StatusBadge status={contract.status} />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <span className="font-semibold">₹{contract.amount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{format(new Date(contract.due_at), 'MM/dd/yyyy')}</span>
                    </div>
                  </div>
                  {contract.reason && (
                    <p className="mt-2 text-sm text-muted-foreground">{contract.reason}</p>
                  )}
                  {isOverdue(contract.due_at) && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Send Reminder
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 flex-1">
                        Mark Settled
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
