import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Contract, getDataClient } from '@/lib/dataClient';
import { StatusBadge } from './StatusBadge';
import { formatAmount, formatDateTime, formatPhone, getTimeUntilDue } from '@/lib/format';
import { useNavigate } from 'react-router-dom';
import { Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { ExtensionRequestDialog } from './ExtensionRequestDialog';
import { useToast } from '@/hooks/use-toast';

interface ContractCardProps {
  contract: Contract;
  currentUserId: string;
  onUpdate: () => void;
}

export function ContractCard({ contract, currentUserId, onUpdate }: ContractCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const isBorrower = contract.borrower_id === currentUserId;
  const isLender = contract.lender_id === currentUserId;
  const otherParty = isBorrower ? contract.lender : contract.borrower;
  
  const handleExtensionRequest = async (newDueDate: Date, reason: string) => {
    try {
      const client = getDataClient();
      const extraDays = Math.ceil((newDueDate.getTime() - new Date(contract.due_at).getTime()) / (1000 * 60 * 60 * 24));
      await client.createExtension({
        contract_id: contract.id,
        new_due_at: newDueDate.toISOString(),
        reason,
        extra_days: extraDays,
      });
      toast({ title: 'Extension request sent successfully!' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send extension request', variant: 'destructive' });
    }
  };

  const handleCancelRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const client = getDataClient();
      await client.updateContract(contract.id, { status: 'REJECTED' });
      toast({ title: 'Request cancelled' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to cancel request', variant: 'destructive' });
    }
  };

  const handleSettleUp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const client = getDataClient();
      await client.updateContract(contract.id, { 
        status: 'SETTLED',
        repayment_proof_url: 'mock://proof.jpg',
        settlement_pending: true 
      });
      toast({ title: 'Settlement proof uploaded. Awaiting lender approval.' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to settle up', variant: 'destructive' });
    }
  };

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const client = getDataClient();
      await client.updateContract(contract.id, { 
        status: 'ACTIVE',
        disbursal_proof_url: 'mock://proof.jpg' 
      });
      toast({ title: 'Contract accepted!' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to accept contract', variant: 'destructive' });
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const client = getDataClient();
      await client.updateContract(contract.id, { status: 'REJECTED' });
      toast({ title: 'Contract rejected' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject contract', variant: 'destructive' });
    }
  };

  const handleApproveSettlement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const client = getDataClient();
      await client.updateContract(contract.id, { 
        status: 'SETTLED',
        settlement_pending: false 
      });
      toast({ title: 'Settlement approved!' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve settlement', variant: 'destructive' });
    }
  };

  const renderActionButtons = () => {
    // BORROWER ACTIONS
    if (isBorrower) {
      if (contract.status === 'REQUESTED') {
        return (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={handleCancelRequest}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Request
            </Button>
          </div>
        );
      }
      
      if (contract.status === 'ACTIVE' || contract.status === 'DUE') {
        return (
          <>
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={(e) => { 
                  e.stopPropagation();
                  setShowExtensionDialog(true);
                }}
              >
                <Clock className="mr-2 h-4 w-4" />
                Ask for Extension
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-success hover:bg-success/90"
                onClick={handleSettleUp}
              >
                Settle Up
              </Button>
            </div>
            <ExtensionRequestDialog
              open={showExtensionDialog}
              onOpenChange={setShowExtensionDialog}
              onSubmit={handleExtensionRequest}
              currentDueDate={contract.due_at}
            />
          </>
        );
      }
    }
    
    // LENDER ACTIONS (only lenders can review)
    if (isLender) {
      if (contract.status === 'REQUESTED') {
        return (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={handleReject}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button 
              size="sm" 
              className="flex-1 bg-success hover:bg-success/90"
              onClick={handleAccept}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </div>
        );
      }
      
      if (contract.status === 'DUE' || contract.status === 'SETTLED') {
        const buttons = [];
        
        // Show "Approve Settlement" if borrower submitted proof
        if (contract.settlement_pending || contract.repayment_proof_url) {
          buttons.push(
            <Button 
              key="approve"
              size="sm" 
              className="flex-1 bg-success hover:bg-success/90"
              onClick={handleApproveSettlement}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Settlement
            </Button>
          );
        }
        
        if (buttons.length > 0) {
          return <div className="flex gap-2 pt-2">{buttons}</div>;
        }
      }
    }
    
    return null;
  };

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate(`/contract/${contract.id}`)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {otherParty?.name || 'Unknown'}
              </span>
              {isLender && otherParty && (
                <span className="text-sm text-muted-foreground">
                  {formatPhone(otherParty.phone, true)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isBorrower ? 'Borrowed from' : 'Lent to'} {otherParty?.name || 'Unknown'}
            </p>
          </div>
          <StatusBadge status={contract.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-primary">{formatAmount(contract.amount)}</span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{getTimeUntilDue(contract.due_at)}</span>
          </div>
        </div>
        
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            Due: {formatDateTime(contract.due_at)}
          </p>
          {contract.reason && (
            <p className="text-muted-foreground">Reason: {contract.reason}</p>
          )}
        </div>

        {renderActionButtons()}
      </CardContent>
    </Card>
  );
}
