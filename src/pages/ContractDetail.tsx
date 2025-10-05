import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { getDataClient, Contract } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ReliabilityStars } from '@/components/ReliabilityStars';
import { ExtensionRequestDialog } from '@/components/ExtensionRequestDialog';
import { SettleUpDialog } from '@/components/SettleUpDialog';
import { ProofViewerDialog } from '@/components/ProofViewerDialog';
import { ArrowLeft, FileText } from 'lucide-react';
import { formatDateTime, formatAmount } from '@/lib/format';

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [showSettleDialog, setShowSettleDialog] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadContract();
  }, [id]);

  const loadContract = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const client = getDataClient();
      const contractData = await client.getContractById(id);
      setContract(contractData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contract details',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
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
      loadContract();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send extension request', variant: 'destructive' });
    }
  };

  const handleSettleSubmit = async (proofUrl: string) => {
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
      loadContract();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload proof', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Contract Details" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading contract details...</p>
        </main>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Contract Details" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Contract not found</p>
        </main>
      </div>
    );
  }

  const isBorrower = contract.borrower_id === currentUserId;
  const isLender = contract.lender_id === currentUserId;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <MobileHeader title="Contract Details" showBack />
      
      <main className="flex-1 space-y-4 px-4 py-6">
        {/* Contract Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {contract.borrower ? contract.borrower.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">{contract.borrower?.name || 'Unknown'}</h1>
                {contract.borrower?.trust_reliability_cached !== null && (
                  <div className="flex items-center gap-1">
                    <ReliabilityStars score={contract.borrower?.trust_reliability_cached || 0} />
                  </div>
                )}
              </div>
            </div>
            <StatusBadge status={contract.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">{formatAmount(contract.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="text-lg font-semibold">{formatDateTime(contract.due_at)}</p>
            </div>
          </div>

          {contract.reason && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reason</p>
              <p className="text-base">{contract.reason}</p>
            </div>
          )}

          {contract.attachment_url && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Attached Document</p>
              <div className="mt-2">
                {contract.attachment_url.startsWith('data:image/') ? (
                  <img 
                    src={contract.attachment_url} 
                    alt="Attached document" 
                    className="max-h-64 w-full rounded-md object-contain border"
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Document attached</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        {isBorrower && contract.status === 'ACTIVE' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            {contract.settlement_pending ? (
              <Button variant="outline" onClick={() => setShowProofDialog(true)}>Awaiting Approval</Button>
            ) : (
              <Button onClick={() => setShowSettleDialog(true)}>Mark as Paid</Button>
            )}
            <Button variant="outline" onClick={() => setShowExtensionDialog(true)}>Request Extension</Button>
          </Card>
        )}

        {/* Proof viewer for either party */}
        <ProofViewerDialog
          open={showProofDialog}
          onOpenChange={setShowProofDialog}
          proofUrl={contract.repayment_proof_url || ''}
          title="Repayment Proof"
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
          onSubmit={handleSettleSubmit}
        />
      </main>
    </div>
  );
}