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
import { ExtensionRequestDialog } from '@/components/ExtensionRequestDialog';
import { SettleUpDialog } from '@/components/SettleUpDialog';
import { ProofViewerDialog } from '@/components/ProofViewerDialog';

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [showSettleDialog, setShowSettleDialog] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);

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
    try {
      const client = getDataClient();
      await client.updateContract(contract.id, {
        status: 'ACTIVE',
        disbursal_proof_url: 'mock://proof.jpg',
      });
      toast({ title: 'Contract accepted' });
      await loadContract();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to accept contract', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!contract || !currentUserId) return;
    try {
      const client = getDataClient();
      await client.updateContract(contract.id, {
        status: 'REJECTED',
      });
      toast({ title: 'Contract rejected' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject contract', variant: 'destructive' });
    }
  };

  const handleExtensionSubmit = async (newDueDate: Date, reason: string) => {
    if (!contract) return;
    try {
      const client = getDataClient();
      const extraDays = Math.ceil((newDueDate.getTime() - new Date(contract.due_at).getTime()) / (1000 * 60 * 60 * 24));
      await client.createExtension({
        contract_id: contract.id,
        new_due_at: newDueDate.toISOString(),
        reason,
        extra_days: extraDays,
      });
      setShowExtensionDialog(false);
      toast({ title: 'Extension request sent' });
      await loadContract();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send extension request', variant: 'destructive' });
    }
  };

  const handleSettleUpload = async (proofUrl: string) => {
    if (!contract) return;
    try {
      const client = getDataClient();
      await client.updateContract(contract.id, {
        status: 'DUE',
        repayment_proof_url: proofUrl,
        settlement_pending: true,
      });
      setShowSettleDialog(false);
      toast({ title: 'Settlement proof uploaded. Awaiting lender approval.' });
      await loadContract();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload proof', variant: 'destructive' });
    }
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
                <div className="flex items-center gap-2">
                  {contract.settlement_pending && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 text-xs font-medium">Awaiting approval</span>
                  )}
                  <StatusBadge status={contract.status} />
                </div>
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
                <Button variant="ghost" onClick={handleReject}>Reject</Button>
              </div>
            )}

            {contract.status === 'ACTIVE' && isBorrower && (
              <div className="flex gap-2 pt-4">
                {contract.settlement_pending ? (
                  <Button variant="outline" onClick={() => setShowProofDialog(true)}>Awaiting Approval</Button>
                ) : (
                  <Button onClick={() => setShowSettleDialog(true)}>Settle Up</Button>
                )}
                <Button variant="outline" onClick={() => setShowExtensionDialog(true)}>Ask for Extension</Button>
              </div>
            )}
            {/* Proof viewer for either party */}
            <ProofViewerDialog
              open={showProofDialog}
              onOpenChange={setShowProofDialog}
              imageUrl={contract.repayment_proof_url || contract.disbursal_proof_url}
            />
            <ExtensionRequestDialog
              open={showExtensionDialog}
              onOpenChange={setShowExtensionDialog}
              onSubmit={handleExtensionSubmit}
              currentDueDate={contract.due_at}
            />
            <SettleUpDialog
              open={showSettleDialog}
              onOpenChange={setShowSettleDialog}
              onUpload={handleSettleUpload}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
