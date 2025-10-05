import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, IndianRupee, FileText, User, ArrowRight, CheckCircle, XCircle, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import { getDataClient, Contract, Extension } from '@/lib/dataClient';
import { StatusBadge } from '@/components/StatusBadge';
import { ReliabilityStars } from '@/components/ReliabilityStars';

interface ContractHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  extension: Extension | null;
}

export function ContractHistoryDialog({ 
  open, 
  onOpenChange, 
  contract, 
  extension 
}: ContractHistoryDialogProps) {
  const navigate = useNavigate();
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

  const handleBorrowerProfileClick = () => {
    if (contract?.borrower_id) {
      navigate(`/borrower/${contract.borrower_id}`);
      onOpenChange(false);
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleViewProof = (proofUrl: string, title: string) => {
    setCurrentProofUrl(proofUrl);
    setCurrentProofTitle(title);
    setShowProofViewer(true);
  };

  const handleDownloadProof = (proofUrl: string, filename: string) => {
    try {
      // Handle base64 data URLs
      if (proofUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = proofUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Handle regular URLs
        const link = document.createElement('a');
        link.href = proofUrl;
        link.download = filename;
        link.target = '_blank';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(proofUrl, '_blank');
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract History
          </DialogTitle>
          <DialogDescription>
            Complete contract details and transaction history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Overview */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 cursor-pointer" onClick={handleBorrowerProfileClick}>
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {contract.borrower ? contract.borrower.name.charAt(0).toUpperCase() : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={handleBorrowerProfileClick}
                  >
                    <h3 className="font-semibold text-lg">{contract.borrower?.name}</h3>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <ReliabilityStars 
                      score={contract.borrower?.trust_reliability_cached || 0} 
                    />
                    <span className="text-xs text-muted-foreground">
                      {contract.borrower?.trust_reliability_cached || 0}% reliability
                    </span>
                  </div>
                </div>
              </div>
              <StatusBadge status={contract.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">₹{contract.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-semibold">{format(new Date(contract.created_at), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-muted-foreground">Original Due:</span>
                <span className="font-semibold">{format(new Date(contract.due_at), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-600" />
                <span className="text-muted-foreground">Lender:</span>
                <span className="font-semibold">{contract.lender?.name}</span>
              </div>
            </div>

            {contract.reason && (
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Loan Purpose:</p>
                <p className="text-sm">{contract.reason}</p>
              </div>
            )}

            {contract.attachment_url && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Original Attachment:</p>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Contract attachment</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(contract.attachment_url, '_blank')}
                  >
                    View
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Payment Proofs */}
          {(contract.disbursal_proof_url || contract.repayment_proof_url) && (
            <Card className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Payment Proofs
              </h4>
              
              {contract.disbursal_proof_url && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Disbursal Proof (Lender Payment)
                  </p>
                  <div className="relative border rounded-lg overflow-hidden bg-muted/30">
                    <img
                      src={contract.disbursal_proof_url}
                      alt="Disbursal proof"
                      className="w-full h-auto max-h-[200px] object-contain cursor-pointer"
                      onClick={() => handleViewProof(contract.disbursal_proof_url, 'Disbursal Proof')}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleViewProof(contract.disbursal_proof_url, 'Disbursal Proof')}
                    >
                      View Full
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadProof(contract.disbursal_proof_url, 'disbursal-proof.png')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {contract.repayment_proof_url && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Repayment Proof (Borrower Payment)
                  </p>
                  <div className="relative border rounded-lg overflow-hidden bg-muted/30">
                    <img
                      src={contract.repayment_proof_url}
                      alt="Repayment proof"
                      className="w-full h-auto max-h-[200px] object-contain cursor-pointer"
                      onClick={() => handleViewProof(contract.repayment_proof_url, 'Repayment Proof')}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleViewProof(contract.repayment_proof_url, 'Repayment Proof')}
                    >
                      View Full
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadProof(contract.repayment_proof_url, 'repayment-proof.png')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Extension History */}
          {allExtensions.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                Extension History ({allExtensions.length})
              </h4>
              
              <div className="space-y-3">
                {allExtensions.map((ext, index) => (
                  <div key={ext.id} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Extension #{index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {ext.approved === true && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        {ext.approved === false && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                        {ext.approved === null && (
                          <Badge variant="secondary">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Requested: {format(new Date(ext.created_at), 'MMM dd, yyyy')}</div>
                      <div>New Due: {format(new Date(ext.new_due_at), 'MMM dd, yyyy')}</div>
                      <div>Extra Days: {ext.extra_days}</div>
                      {ext.decided_at && (
                        <div>Decided: {format(new Date(ext.decided_at), 'MMM dd, yyyy')}</div>
                      )}
                    </div>
                    
                    {ext.reason && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                        <strong>Reason:</strong> {ext.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Current Extension Request (if any) */}
          {extension && (
            <Card className="p-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <Clock className="h-4 w-4" />
                Current Extension Request
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requested:</span>
                  <span className="font-medium">{format(new Date(extension.created_at), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Due Date:</span>
                  <span className="font-medium">{format(new Date(extension.new_due_at), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extra Days:</span>
                  <span className="font-medium">{extension.extra_days} days</span>
                </div>
                
                {extension.reason && (
                  <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Reason:</p>
                    <p className="text-sm">{extension.reason}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleBorrowerProfileClick} className="bg-primary hover:bg-primary/90">
            <User className="h-4 w-4 mr-2" />
            View Borrower Profile
          </Button>
        </div>
      </DialogContent>

      {/* Proof Viewer Modal */}
      {showProofViewer && (
        <Dialog open={showProofViewer} onOpenChange={setShowProofViewer}>
          <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {currentProofTitle}
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-4 pt-0">
              <div className="relative border rounded-lg overflow-hidden bg-muted/30">
                <img
                  src={currentProofUrl}
                  alt={currentProofTitle}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              </div>
              
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadProof(currentProofUrl, `${currentProofTitle.toLowerCase().replace(' ', '-')}.png`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(currentProofUrl, '_blank')}
                >
                  Open in New Tab
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
