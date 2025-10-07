import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, IndianRupee, FileText, User, ArrowRight, CheckCircle, XCircle, Download, Phone, MessageCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { getDataClient, Contract } from '@/lib/dataClient';
import { Extension } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { ReliabilityStars } from '@/components/ReliabilityStars';
import { useAuthStore } from '@/store/authStore';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { useModeManager } from '@/hooks/useModeManager';
import { ProofViewerDialog } from '@/components/ProofViewerDialog';

interface ContractDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  showActions?: boolean; // Whether to show action buttons
  userRole?: 'borrower' | 'lender' | 'viewer'; // Role of the current user viewing the contract
}

export function ContractDetailsDialog({ 
  open, 
  onOpenChange, 
  contract,
  showActions = true,
  userRole = 'viewer'
}: ContractDetailsDialogProps) {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { currentUserId: prodCurrentUserId } = useProductionAuthStore();
  const { currentMode } = useModeManager();
  
  // Use appropriate auth store based on mode
  const isDemoMode = currentMode === 'demo';
  const currentAuthUserId = isDemoMode ? currentUserId : prodCurrentUserId;
  
  const [allExtensions, setAllExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProofViewer, setShowProofViewer] = useState(false);
  const [currentProofUrl, setCurrentProofUrl] = useState<string>('');
  const [currentProofTitle, setCurrentProofTitle] = useState<string>('');

  useEffect(() => {
    if (contract && open) {
      loadExtensions();
    }
  }, [contract, open]);

  const loadExtensions = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const client = getDataClient();
      const extensions = await client.getExtensionsForContract(contract.id);
      setAllExtensions(extensions);
    } catch (error) {
      console.error('Error loading extensions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProof = (proofUrl: string, title: string) => {
    setCurrentProofUrl(proofUrl);
    setCurrentProofTitle(title);
    setShowProofViewer(true);
  };

  const handleDownload = (proofUrl: string) => {
    const link = document.createElement('a');
    link.href = proofUrl;
    link.download = 'payment-proof.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
  };

  if (!contract) return null;

  const isBorrower = contract.borrower_id === currentAuthUserId;
  const isLender = contract.lender_id === currentAuthUserId;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
            <DialogDescription>
              View detailed information about this loan contract
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Contract Status */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={contract.status} />
                  {contract.settlement_pending && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Settlement Pending
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatAmount(contract.amount)}</p>
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDateTime(contract.due_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDateTime(contract.created_at)}</p>
                </div>
              </div>
              
              {contract.reason && (
                <div className="mt-3">
                  <p className="text-muted-foreground text-sm">Reason</p>
                  <p className="text-sm">{contract.reason}</p>
                </div>
              )}
            </Card>

            {/* Parties Information */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Parties</h3>
              <div className="space-y-3">
                {/* Borrower */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {contract.borrower?.name?.charAt(0) || 'B'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{contract.borrower?.name || 'Unknown Borrower'}</p>
                    <p className="text-sm text-muted-foreground">{contract.borrower?.phone || 'No phone'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Borrower</p>
                    <ReliabilityStars 
                      score={contract.borrower?.trust_reliability_cached || 0} 
                      size="sm" 
                    />
                  </div>
                </div>

                <Separator />

                {/* Lender */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {contract.lender?.name?.charAt(0) || 'L'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{contract.lender?.name || 'Unknown Lender'}</p>
                    <p className="text-sm text-muted-foreground">{contract.lender?.phone || 'No phone'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Lender</p>
                    <ReliabilityStars 
                      score={contract.lender?.trust_reliability_cached || 0} 
                      size="sm" 
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Proofs */}
            {(contract.disbursal_proof_url || contract.repayment_proof_url) && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Payment Proofs</h3>
                <div className="space-y-3">
                  {contract.disbursal_proof_url && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Disbursal Proof</p>
                          <p className="text-sm text-muted-foreground">Lender's payment proof</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProof(contract.disbursal_proof_url!, 'Disbursal Proof')}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(contract.disbursal_proof_url!)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {contract.repayment_proof_url && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Repayment Proof</p>
                          <p className="text-sm text-muted-foreground">Borrower's payment proof</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProof(contract.repayment_proof_url!, 'Repayment Proof')}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(contract.repayment_proof_url!)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Extensions */}
            {allExtensions.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Extension Requests</h3>
                <div className="space-y-3">
                  {allExtensions.map((extension) => (
                    <div key={extension.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="font-medium">
                            {formatDateTime(extension.new_due_at)}
                          </span>
                        </div>
                        <Badge 
                          variant={extension.approved ? 'default' : extension.status === 'REJECTED' ? 'destructive' : 'secondary'}
                        >
                          {extension.approved ? 'Approved' : extension.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                        </Badge>
                      </div>
                      {extension.reason && (
                        <p className="text-sm text-muted-foreground">{extension.reason}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested: {formatDateTime(extension.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                {(isBorrower || isLender) && (
                  <Button onClick={() => navigate(`/contract/${contract.id}`)}>
                    View Full Details
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Proof Viewer Dialog */}
      <ProofViewerDialog
        open={showProofViewer}
        onOpenChange={setShowProofViewer}
        imageUrl={currentProofUrl}
        title={currentProofTitle}
      />
    </>
  );
}