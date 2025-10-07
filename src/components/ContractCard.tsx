import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { useModeManager } from '@/hooks/useModeManager';
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
  const { currentUserId: prodCurrentUserId } = useProductionAuthStore();
  const { currentMode } = useModeManager();
  const { toast } = useToast();
  
  // Use appropriate auth store based on mode
  const isDemoMode = currentMode === 'demo';
  const currentAuthUserId = isDemoMode ? currentUserId : prodCurrentUserId;
  
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [showSettleDialog, setShowSettleDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showContractDetailsDialog, setShowContractDetailsDialog] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const isBorrower = contract.borrower_id === currentAuthUserId;
  const isLender = contract.lender_id === currentAuthUserId;

  useEffect(() => {
    const checkExistingReview = async () => {
      if (isLender && contract.status === 'SETTLED') {
        try {
          const client = getDataClient();
          const reviews = await client.getReviewsForUser(contract.borrower_id);
          const existingReview = reviews.find(r => r.contract_id === contract.id && r.reviewer_id === currentAuthUserId);
          console.log('ContractCard - Checking review for contract:', contract.id);
          console.log('ContractCard - All reviews for borrower:', reviews);
          console.log('ContractCard - Existing review found:', existingReview);
          setHasReviewed(!!existingReview);
        } catch (error) {
          console.error('Error checking existing review:', error);
          setHasReviewed(false); // Default to false on error
        }
      }
    };

    checkExistingReview();
  }, [isLender, contract.status, contract.borrower_id, contract.id, currentAuthUserId]);

  const handleExtensionSubmit = async (newDueDate: Date, reason: string) => {
    try {
      const client = getDataClient();
      await client.createExtension({
        contract_id: contract.id,
        new_due_at: newDueDate.toISOString(),
        reason: reason,
      });
      
      toast({
        title: 'Extension Requested',
        description: 'Your extension request has been submitted',
      });
      
      setShowExtensionDialog(false);
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request extension',
        variant: 'destructive',
      });
    }
  };

  const handleSettleSubmit = async (proofUrl: string, notes?: string) => {
    try {
      const client = getDataClient();
      await client.settleContract(contract.id, proofUrl);
      
      toast({
        title: 'Payment Proof Submitted',
        description: 'Your payment proof has been submitted for verification',
      });
      
      setShowSettleDialog(false);
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit payment proof',
        variant: 'destructive',
      });
    }
  };

  const handleReviewSubmit = async (rating: number, review: string) => {
    try {
      const client = getDataClient();
      await client.createReview({
        reviewer_id: currentAuthUserId,
        reviewed_user_id: contract.borrower_id,
        rating: rating,
        comment: review,
      });
      
      toast({
        title: 'Review Submitted',
        description: 'Your review has been submitted',
      });
      
      setShowReviewDialog(false);
      setHasReviewed(true);
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptContract = async () => {
    try {
      const client = getDataClient();
      await client.updateContract(contract.id, { status: 'ACTIVE' });
      
      toast({
        title: 'Contract Accepted',
        description: 'The loan has been approved',
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept contract',
        variant: 'destructive',
      });
    }
  };

  const handleRejectContract = async () => {
    try {
      const client = getDataClient();
      await client.updateContract(contract.id, { status: 'REJECTED' });
      
      toast({
        title: 'Contract Rejected',
        description: 'The loan request has been declined',
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject contract',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = () => {
    setShowContractDetailsDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'SETTLED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'DUE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'Pending Approval';
      case 'ACTIVE': return 'Active';
      case 'SETTLED': return 'Settled';
      case 'REJECTED': return 'Rejected';
      case 'DUE': return 'Due';
      default: return status;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(contract.status)}>
                {getStatusText(contract.status)}
              </Badge>
              {contract.settlement_pending && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  Settlement Pending
                </Badge>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-lg font-semibold">{formatAmount(contract.amount)}</p>
              <p className="text-sm text-muted-foreground">
                Due: {formatDateTime(contract.due_at)}
              </p>
              {contract.reason && (
                <p className="text-sm text-muted-foreground">{contract.reason}</p>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewDetails}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isBorrower ? 'Lender' : 'Borrower'}: {contract.borrower?.name || contract.lender?.name || 'Unknown'}
            </p>
            <p className="text-xs text-muted-foreground">
              {contract.borrower?.phone || contract.lender?.phone || 'No phone'}
            </p>
          </div>
          <ReliabilityStars 
            score={contract.borrower?.trust_reliability_cached || contract.lender?.trust_reliability_cached || 0} 
            size="sm" 
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {contract.status === 'REQUESTED' && isLender && (
            <>
              <Button size="sm" onClick={handleAcceptContract} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button size="sm" variant="destructive" onClick={handleRejectContract}>
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          {contract.status === 'ACTIVE' && isBorrower && !contract.settlement_pending && (
            <Button size="sm" onClick={() => setShowSettleDialog(true)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark as Paid
            </Button>
          )}
          
          {contract.status === 'ACTIVE' && isBorrower && (
            <Button size="sm" variant="outline" onClick={() => setShowExtensionDialog(true)}>
              <Clock className="h-4 w-4 mr-1" />
              Request Extension
            </Button>
          )}
          
          {contract.status === 'SETTLED' && isLender && !hasReviewed && (
            <Button size="sm" variant="outline" onClick={() => setShowReviewDialog(true)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Leave Review
            </Button>
          )}
          
          <Button size="sm" variant="outline" onClick={handleViewDetails}>
            View Details
          </Button>
        </div>
      </Card>

      {/* Dialogs */}
      <ExtensionRequestDialog
        open={showExtensionDialog}
        onOpenChange={setShowExtensionDialog}
        onSubmit={handleExtensionSubmit}
        currentDueDate={new Date(contract.due_at)}
      />

      <SettleUpDialog
        open={showSettleDialog}
        onOpenChange={setShowSettleDialog}
        onSubmit={handleSettleSubmit}
        contract={contract}
      />

      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        onSubmit={handleReviewSubmit}
        borrowerName={contract.borrower?.name || 'Borrower'}
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