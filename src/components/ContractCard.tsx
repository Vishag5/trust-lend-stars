import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { getDataClient, Contract } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { ReliabilityStars } from '@/components/ReliabilityStars';
import { ExtensionRequestDialog } from '@/components/ExtensionRequestDialog';
import { SettleUpDialog } from '@/components/SettleUpDialog';
import { ReviewDialog } from '@/components/ReviewDialog';
import { ContractDetailsDialog } from '@/components/ContractDetailsDialog';
import { formatDateTime } from '@/lib/format';

interface ContractCardProps {
  contract: Contract;
  onUpdate: () => void;
}

export function ContractCard({ contract, onUpdate }: ContractCardProps) {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [showSettleDialog, setShowSettleDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showContractDetailsDialog, setShowContractDetailsDialog] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const isBorrower = contract.borrower_id === currentUserId;
  const isLender = contract.lender_id === currentUserId;

  useEffect(() => {
    const checkExistingReview = async () => {
      if (isLender && contract.status === 'SETTLED') {
        try {
          const client = getDataClient();
          const reviews = await client.getReviewsForUser(contract.borrower_id);
          const existingReview = reviews.find(r => r.contract_id === contract.id && r.reviewer_id === currentUserId);
          console.log('ContractCard - Checking review for contract:', contract.id);
          console.log('ContractCard - All reviews for borrower:', reviews);
          console.log('ContractCard - Existing review found:', existingReview);
          setHasReviewed(!!existingReview);
        } catch (error) {
          console.error('Error checking existing review:', error);
          setHasReviewed(false); // Default to false on error
        }
      } else {
        setHasReviewed(false); // Reset to false if not a lender or not settled
      }
    };
    checkExistingReview();
  }, [contract.id, contract.borrower_id, contract.status, isLender, currentUserId]);


  const handleExtensionSubmit = async (newDueDate: Date, reason: string) => {
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
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send extension request', variant: 'destructive' });
    }
  };

  const handleSettleSubmit = async (proofUrl: string) => {
    try {
      const client = getDataClient();
      await client.updateContract(contract.id, { 
        status: 'DUE',
        repayment_proof_url: proofUrl,
        settlement_pending: true,
      });
      setShowSettleDialog(false);
      toast({ title: 'Settlement proof uploaded. Awaiting lender approval.' });
      onUpdate();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload proof', variant: 'destructive' });
    }
  };

  const handleReviewSubmit = async (rating: number, review: string) => {
    try {
      const client = getDataClient();
      console.log('ContractCard - Submitting review for contract:', contract.id);
      console.log('ContractCard - Review details:', { rating, review, contract_id: contract.id, reviewer_id: currentUserId, reviewee_id: contract.borrower_id });
      
      await client.createReview({
        contract_id: contract.id,
        reviewer_id: currentUserId,
        reviewee_id: contract.borrower_id,
        rating,
        review: review || null,
      });
      
      console.log('ContractCard - Review submitted successfully, setting hasReviewed to true');
      setHasReviewed(true);
      toast({ title: 'Review submitted successfully!' });
      onUpdate();
    } catch (error) {
      console.error('ContractCard - Error submitting review:', error);
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    }
  };

  const renderActionButtons = () => {
    // BORROWER ACTIONS
    if (isBorrower) {
      const buttons = [];
      
      if (contract.status === 'ACTIVE') {
        if (contract.settlement_pending) {
          buttons.push(
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={(e) => { e.stopPropagation(); }}
            >
              Awaiting Approval
            </Button>
          );
        } else {
          buttons.push(
            <Button 
              size="sm" 
              className="flex-1 bg-success hover:bg-success/90"
              onClick={(e) => { e.stopPropagation(); setShowSettleDialog(true); }}
            >
              Mark as Paid
            </Button>
          );
        }
        
        if (!contract.extension_pending) {
          buttons.push(
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
              Request Extension
                </Button>
          );
        }
      }
      
      return buttons.length > 0 ? (
        <div className="flex gap-2">
          {buttons}
        </div>
      ) : null;
    }

    // LENDER ACTIONS
    if (isLender) {
      const buttons = [];
      
      if (contract.status === 'REQUESTED') {
        buttons.push(
            <Button 
              size="sm" 
              className="flex-1 bg-success hover:bg-success/90"
            onClick={(e) => { e.stopPropagation(); }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept
            </Button>
        );
        buttons.push(
          <Button 
            size="sm" 
            variant="destructive" 
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        );
      }
      
      if (contract.status === 'DUE' && contract.settlement_pending) {
          buttons.push(
            <Button 
              size="sm" 
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={(e) => { e.stopPropagation(); }}
            >
            Review Settlement
            </Button>
          );
        }
        
      // Show "Rate & Review" button for lenders on SETTLED contracts
      if (contract.status === 'SETTLED' && !contract.settlement_pending) {
        console.log('ContractCard - Rendering review button for contract:', contract.id, 'hasReviewed:', hasReviewed);
        if (hasReviewed) {
          buttons.push(
            <Button
              key="reviewed"
              size="sm"
              variant="outline"
              className="flex-1"
              disabled
            >
              ✓ Reviewed
            </Button>
          );
        } else {
          buttons.push(
            <Button
              key="review"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowReviewDialog(true);
              }}
            >
              Rate & Review
            </Button>
          );
        }
      }
      
      if (buttons.length > 0) {
        return (
          <div className="flex gap-2">
            {buttons}
          </div>
        );
      }
    }
    
    return null;
  };

  return (
    <>
      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowContractDetailsDialog(true)}
      >
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-semibold text-primary">
                {contract.borrower_id === currentUserId 
                  ? (contract.lender ? contract.lender.name.charAt(0).toUpperCase() : '?')
                  : (contract.borrower ? contract.borrower.name.charAt(0).toUpperCase() : '?')
                }
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {contract.borrower_id === currentUserId 
                  ? contract.lender?.name 
                  : contract.borrower?.name
                }
              </h3>
              <div className="text-xs text-muted-foreground">
                {contract.borrower_id === currentUserId ? 'You owe' : 'They owe you'}
              </div>
              {/* Show trust score for borrowers */}
              {contract.borrower_id !== currentUserId && contract.borrower?.trust_reliability_cached !== null && (
                <div className="flex items-center gap-1 mt-1">
                  <ReliabilityStars score={contract.borrower?.trust_reliability_cached || 0} />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center flex-shrink-0 ml-2">
            <StatusBadge status={contract.status} />
          </div>
        </div>
        
        <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Amount</span>
            <div className="font-semibold">₹{contract.amount}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Due</span>
            <div className="font-semibold">{formatDateTime(contract.due_at)}</div>
          </div>
        </div>
        
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            Due: {formatDateTime(contract.due_at)}
          </p>
          {contract.reason && (
            <p className="text-muted-foreground">Reason: {contract.reason}</p>
          )}
          {contract.attachment_url && (
            <p className="text-muted-foreground">📎 Document attached</p>
          )}
        </div>

        {renderActionButtons()}
    </Card>

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

      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        onSubmit={handleReviewSubmit}
        borrowerName={contract.borrower?.name || 'Unknown'}
      />

      <ContractDetailsDialog
        open={showContractDetailsDialog}
        onOpenChange={setShowContractDetailsDialog}
        contract={contract}
        showActions={true}
        userRole={isBorrower ? 'borrower' : isLender ? 'lender' : 'viewer'}
      />
    </>
  );
}