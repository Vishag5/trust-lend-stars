import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { getDataClient, Contract } from '@/lib/dataClient';
import { ArrowLeft } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatAmount, formatDateTime, formatPhone } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContract();
  }, [id]);

  const loadContract = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const client = getDataClient();
      const data = await client.getContractById(id);
      setContract(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load contract', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!contract || !currentUserId) return;
    // TODO: Implement accept flow with proof upload
    toast({ title: 'Accept flow', description: 'To be implemented' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Contract not found</p>
      </div>
    );
  }

  const isBorrower = contract.borrower_id === currentUserId;
  const isLender = contract.lender_id === currentUserId;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl">{formatAmount(contract.amount)}</CardTitle>
                <p className="mt-2 text-muted-foreground">
                  {isBorrower ? 'Borrowed from' : 'Lent to'}{' '}
                  {isBorrower ? contract.lender?.name : contract.borrower?.name}
                </p>
              </div>
              <StatusBadge status={contract.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                <p className="text-base font-semibold">{formatDateTime(contract.due_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-base font-semibold">{formatDateTime(contract.created_at)}</p>
              </div>
            </div>

            {contract.reason && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reason</p>
                <p className="text-base">{contract.reason}</p>
              </div>
            )}

            {contract.status === 'REQUESTED' && isLender && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAccept}>Accept & Upload Proof</Button>
                <Button variant="ghost">Reject</Button>
              </div>
            )}

            {contract.status === 'ACTIVE' && isBorrower && (
              <div className="flex gap-2 pt-4">
                <Button>Settle Up</Button>
                <Button variant="outline">Ask for Extension</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
