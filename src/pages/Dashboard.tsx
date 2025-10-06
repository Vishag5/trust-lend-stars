import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { getDataClient, Contract, Extension } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';
import { ExtensionRequestDialog } from '@/components/ExtensionRequestDialog';
import { SettleUpDialog } from '@/components/SettleUpDialog';
import { ProofViewerDialog } from '@/components/ProofViewerDialog';
import { PaymentProofDialog } from '@/components/PaymentProofDialog';
import { ValidateProofDialog } from '@/components/ValidateProofDialog';
import { ReviewDialog } from '@/components/ReviewDialog';
// import { SecurityTestRunner } from '@/components/SecurityTestRunner';
import { Plus, Search, FileText, Clock, User, Calendar, IndianRupee, Share2, BarChart3, Settings, HelpCircle, UserCircle, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { ReliabilityStars } from '@/components/ReliabilityStars';
import { computeReliability } from '@/lib/reliability';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { InviteDialog } from '@/components/InviteDialog';
import { ContractHistoryDialog } from '@/components/ContractHistoryDialog';
import { ContractDetailsDialog } from '@/components/ContractDetailsDialog';
import { ReminderManager } from '@/components/ReminderManager';
import { NotificationBell } from '@/components/NotificationBell';
import { InAppNotification } from '@/components/InAppNotification';
import { SecurityTestPanel } from '@/components/SecurityTestPanel';
import { UIUXTestSuite } from '@/components/UIUXTestSuite';
import { LoadingSpinner, LoadingOverlay } from '@/components/LoadingSpinner';
import { ErrorBoundary, ErrorMessage } from '@/components/ErrorBoundary';
import { reminderService } from '@/lib/reminderService';
import { notificationService } from '@/lib/notificationService';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [showSettleDialog, setShowSettleDialog] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPaymentProofDialog, setShowPaymentProofDialog] = useState(false);
  const [showValidateProofDialog, setShowValidateProofDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showContractHistoryDialog, setShowContractHistoryDialog] = useState(false);
  const [showContractDetailsDialog, setShowContractDetailsDialog] = useState(false);
  const [proofType, setProofType] = useState<'disbursal' | 'settlement'>('disbursal');
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [activeExtension, setActiveExtension] = useState<Extension | null>(null);
  const [showReminderManager, setShowReminderManager] = useState(false);

  useEffect(() => {
    if (!currentUserId) {
      navigate('/');
      return;
    }
    loadData();
    
    // Start reminder service
    reminderService.start();
    
    // Request notification permission
    requestNotificationPermission();
    
    return () => {
      reminderService.stop();
    };
  }, [currentUserId, navigate]);

  const requestNotificationPermission = async () => {
    try {
      const permission = await notificationService.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        toast({
          title: 'Notifications Enabled',
          description: 'You will receive payment reminders on your phone screen',
        });
      } else if (permission === 'denied') {
        console.log('❌ Notification permission denied');
        
        // Check if it's iOS Chrome
        if (notificationService.isIOS() && !notificationService.isIOSSafari()) {
          toast({
            title: 'iOS Chrome Limitation',
            description: 'For notifications, please use Safari browser or add this app to your home screen',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Notifications Disabled',
            description: 'You can enable notifications in your browser settings',
            variant: 'destructive',
          });
        }
      } else {
        console.log('⏳ Notification permission pending');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

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

  const handleAccept = async (contract: Contract) => {
    // Set the active contract and show payment proof dialog
    setActiveContract(contract);
    setProofType('disbursal');
    setShowPaymentProofDialog(true);
  };

  const handlePaymentProofSubmit = async (proofUrl: string, notes?: string) => {
    if (!activeContract) return;
    
    try {
      const client = getDataClient();
      
      if (proofType === 'disbursal') {
        // Lender uploading disbursal proof
        await client.updateContract(activeContract.id, { 
          status: 'PENDING_DISBURSAL',
          disbursal_proof_url: proofUrl,
        });
        toast({ 
          title: 'Payment proof uploaded!',
          description: 'Waiting for borrower to confirm receipt',
        });
      } else {
        // Borrower uploading settlement proof
        await client.updateContract(activeContract.id, { 
          status: 'PENDING_SETTLEMENT',
          repayment_proof_url: proofUrl,
          settlement_pending: true,
        });
        toast({ 
          title: 'Settlement proof uploaded!',
          description: 'Waiting for lender to confirm receipt',
        });
      }
      
      setShowPaymentProofDialog(false);
      setActiveContract(null);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload payment proof',
        variant: 'destructive',
      });
    }
  };

  const handleValidateProof = async (approved: boolean) => {
    if (!activeContract) return;
    
    try {
      const client = getDataClient();
      
      if (proofType === 'disbursal') {
        // Borrower validating lender's disbursal proof
        if (approved) {
          await client.updateContract(activeContract.id, { 
        status: 'ACTIVE', 
          });
          toast({ 
            title: 'Payment confirmed!',
            description: 'Contract is now active',
          });
        } else {
          await client.updateContract(activeContract.id, { 
            status: 'REQUESTED',
            disbursal_proof_url: null,
          });
          toast({ 
            title: 'Payment proof rejected',
            description: 'Please contact the lender',
            variant: 'destructive',
          });
        }
      } else {
        // Lender validating borrower's settlement proof
        if (approved) {
          await client.updateContract(activeContract.id, { 
            status: 'SETTLED',
            settlement_pending: false,
          });
          
          // Keep the contract active for review dialog
          const contractForReview = activeContract;
          
          setShowValidateProofDialog(false);
          loadData();
          
          // Show success message
          toast({ 
            title: 'Settlement confirmed!',
            description: 'Please rate and review the borrower',
          });
          
          // Automatically open review dialog after a short delay
          setTimeout(() => {
            setActiveContract(contractForReview);
            // Trigger the review dialog by simulating the Rate & Review button click
            // We'll use a custom event or state to trigger the review dialog
            setShowReviewDialog(true);
          }, 1000);
          
          return; // Don't set activeContract to null yet
        } else {
          await client.updateContract(activeContract.id, { 
            status: 'DUE',
            repayment_proof_url: null,
            settlement_pending: false,
          });
          toast({ 
            title: 'Settlement proof rejected',
            description: 'Please contact the borrower',
            variant: 'destructive',
          });
        }
      }
      
      setShowValidateProofDialog(false);
      setActiveContract(null);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process validation',
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

  const handleExtensionSubmit = async (newDueDate: Date, reason: string) => {
    if (!activeContract) return;
    try {
      const client = getDataClient();
      const extraDays = Math.ceil((newDueDate.getTime() - new Date(activeContract.due_at).getTime()) / (1000 * 60 * 60 * 24));
      await client.createExtension({
        contract_id: activeContract.id,
        new_due_at: newDueDate.toISOString(),
        reason,
        extra_days: extraDays,
      });
      setShowExtensionDialog(false);
      setActiveContract(null);
      toast({ title: 'Extension request sent' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send extension request', variant: 'destructive' });
    }
  };

  const handleInitiateSettlement = (contract: Contract) => {
    // Set the active contract and show payment proof dialog for settlement
    setActiveContract(contract);
    setProofType('settlement');
    setShowPaymentProofDialog(true);
  };

  const handleViewProof = (contract: Contract, type: 'disbursal' | 'settlement') => {
    setActiveContract(contract);
    setProofType(type);
    setShowValidateProofDialog(true);
  };

  const handleReviewSubmit = async (rating: number, review: string) => {
    if (!activeContract) return;
    
    try {
      const client = getDataClient();
      await client.createReview({
        contract_id: activeContract.id,
        reviewer_id: currentUserId,
        reviewee_id: activeContract.borrower_id,
        stars: rating,
        text: review || null,
      });
      
      setShowReviewDialog(false);
      setActiveContract(null);
      toast({ 
        title: 'Review submitted successfully!',
        description: 'Thank you for rating the borrower',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    }
  };

  const handleViewContractHistory = (contract: Contract, extension: Extension) => {
    setActiveContract(contract);
    setActiveExtension(extension);
    setShowContractHistoryDialog(true);
  };

  const handleViewContractDetails = (contract: Contract) => {
    setActiveContract(contract);
    setShowContractDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] flex-col bg-background">
        <MobileHeader />
        <main className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" text="Loading your dashboard..." />
        </main>
      </div>
    );
  }

  const requestsAsLender = contracts.filter(
    (c) => c.lender_id === currentUserId && c.status === 'REQUESTED'
  );
  
  const requestsAsBorrower = contracts.filter(
    (c) => c.borrower_id === currentUserId && c.status === 'REQUESTED'
  );
  
  const pendingExtensions = extensions.filter(e => {
    const contract = contracts.find(c => c.id === e.contract_id);
    return contract && contract.lender_id === currentUserId && e.approved === null;
  });
  
  // Pending disbursal - Borrower needs to validate lender's payment proof
  const pendingDisbursalAsBorrower = contracts.filter(
    c => c.status === 'PENDING_DISBURSAL' && c.borrower_id === currentUserId
  );

  // Pending disbursal - Lender waiting for borrower to validate
  const pendingDisbursalAsLender = contracts.filter(
    c => c.status === 'PENDING_DISBURSAL' && c.lender_id === currentUserId
  );

  // Pending settlement - Lender needs to validate borrower's repayment proof
  const pendingSettlementAsLender = contracts.filter(
    c => c.status === 'PENDING_SETTLEMENT' && c.lender_id === currentUserId
  );

  // Pending settlement - Borrower waiting for lender to validate
  const pendingSettlementAsBorrower = contracts.filter(
    c => c.status === 'PENDING_SETTLEMENT' && c.borrower_id === currentUserId
  );
  
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

  // Get a valid due date for the extension dialog
  const getValidDueDate = () => {
    if (activeContract?.due_at) {
      const date = new Date(activeContract.due_at);
      return isNaN(date.getTime()) ? new Date().toISOString() : activeContract.due_at;
    }
    return new Date().toISOString();
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen-safe min-h-screen-safe flex-col bg-muted/30">
      <MobileHeader 
        rightElement={
          <NotificationBell 
            userId={currentUserId} 
            onNotificationClick={() => setShowReminderManager(true)}
          />
        }
      />
      
      <main className="flex-1 space-y-4 px-4 sm:px-6 py-6 pb-safe overflow-y-auto">
        {/* Development Tools */}
        {import.meta.env.MODE === 'development' && (
          <div className="space-y-4 mb-4">
            <div className="bg-muted/50 border border-dashed rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-semibold">Development Mode</p>
                  <p className="text-xs text-muted-foreground">Demo data with payment proofs</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('This will reset all data and reload with fresh demo data including payment proofs. Continue?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                >
                  Reset Demo Data
                </Button>
              </div>
            </div>
            
            {/* Security Test Panel */}
            <SecurityTestPanel />
            
            {/* UI/UX Test Suite */}
            <UIUXTestSuite />
          </div>
        )}

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/help')}
            className="flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              // Navigate to the appropriate profile based on user type
              const isBorrower = contracts.some(c => c.borrower_id === currentUserId);
              if (isBorrower) {
                navigate(`/borrower/${currentUserId}`);
              } else {
                navigate(`/lender/${currentUserId}`);
              }
              // Scroll to top of the page
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }}
            className="flex items-center gap-2"
          >
            <UserCircle className="h-4 w-4" />
            My Profile
          </Button>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">You Owe</span>
            </div>
            <div className="text-2xl font-bold">₹{youOwe.reduce((sum, c) => sum + c.amount, 0)}</div>
            <div className="text-xs text-muted-foreground">{youOwe.length} active loans</div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">They Owe You</span>
            </div>
            <div className="text-2xl font-bold">₹{totalLent}</div>
            <div className="text-xs text-muted-foreground">{theyOweYou.length} active loans</div>
          </Card>
        </div>

        {/* Request Loan Button */}
        <div className="space-y-3">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => navigate('/create-contract')}
          >
            <Plus className="mr-2 h-5 w-5" />
            Request Loan
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => navigate('/contracts')}>
              <FileText className="mr-2 h-4 w-4" />
              All Contracts
            </Button>
            <Button variant="outline" onClick={() => navigate('/search')}>
              <Search className="mr-2 h-4 w-4" />
              Find People
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="text-sm text-muted-foreground">
          {requestsAsLender.length > 0 && `${requestsAsLender.length} new requests`}
          {requestsAsLender.length > 0 && requestsAsBorrower.length > 0 && ' • '}
          {requestsAsBorrower.length > 0 && `${requestsAsBorrower.length} your requests`}
          {requestsAsBorrower.length > 0 && activeContracts.length > 0 && ' • '}
          {activeContracts.length > 0 && `${activeContracts.length} active contracts`}
          {(requestsAsLender.length > 0 || pendingExtensions.length > 0) && ` • ${requestsAsLender.length + pendingExtensions.length} need attention`}
        </div>

        {/* Pending Disbursal - Lender waiting for borrower validation */}
        {pendingDisbursalAsLender.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              ⏳ Awaiting Borrower Confirmation
              <span className="text-sm font-normal text-muted-foreground">
                ({pendingDisbursalAsLender.length})
              </span>
            </h2>
            {pendingDisbursalAsLender.map((contract) => (
              <Card key={contract.id} className="p-4 border-blue-500/50 bg-blue-50">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {contract.borrower ? getInitials(contract.borrower.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{contract.borrower?.name}</h3>
                      <p className="text-xs text-muted-foreground">Borrower</p>
                    </div>
                  </div>
                  <StatusBadge status={contract.status} />
                </div>
                
                <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Amount</div>
                      <div className="font-semibold">₹{contract.amount.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Due Date</div>
                      <div className="font-semibold">{format(new Date(contract.due_at), 'MMM dd, yyyy')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-100 border border-blue-300 rounded-md p-3 mb-3">
                  <p className="text-sm font-medium text-blue-900">
                    ✅ You uploaded payment proof. Waiting for {contract.borrower?.name} to confirm receipt.
                  </p>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setActiveContract(contract);
                    setProofType('disbursal');
                    setShowValidateProofDialog(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Proof
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Pending Disbursal - Borrower needs to validate payment */}
        {pendingDisbursalAsBorrower.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              💳 Verify Payment Receipt
              <span className="text-sm font-normal text-muted-foreground">
                ({pendingDisbursalAsBorrower.length})
              </span>
            </h2>
            {pendingDisbursalAsBorrower.map((contract) => (
                <Card key={contract.id} className="p-4 border-warning/50 bg-warning/5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                          {contract.lender ? getInitials(contract.lender.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{contract.lender?.name}</h3>
                        <p className="text-xs text-muted-foreground">Lender</p>
                      </div>
                    </div>
                    <StatusBadge status={contract.status} />
                  </div>
                  
                  <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-warning" />
                      <div>
                        <div className="text-xs text-muted-foreground">Amount</div>
                        <div className="font-semibold">₹{contract.amount.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-warning" />
                      <div>
                        <div className="text-xs text-muted-foreground">Due Date</div>
                        <div className="font-semibold">{format(new Date(contract.due_at), 'MMM dd, yyyy')}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-warning/10 border border-warning/30 rounded-md p-3 mb-3">
                    <p className="text-sm font-medium text-warning-foreground">
                      ⚠️ Lender has uploaded payment proof. Please verify you received the money!
                    </p>
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
                    onClick={() => handleViewProof(contract, 'disbursal')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View & Verify Payment Proof
                  </Button>
                </Card>
              ))}
          </div>
        )}

        {/* My Loan Requests (as Borrower) */}
        {requestsAsBorrower.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">My Loan Requests ({requestsAsBorrower.length})</h2>
            {requestsAsBorrower.map((contract) => (
              <Card key={contract.id} className="p-4">
                <div 
                  className="mb-3 flex items-start justify-between cursor-pointer" 
                  onClick={() => navigate(`/lender/${contract.lender_id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {contract.lender ? getInitials(contract.lender.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{contract.lender?.name}</h3>
                      <p className="text-xs text-muted-foreground">Lender</p>
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
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Due</div>
                      <div className="font-semibold">{format(new Date(contract.due_at), 'MMM dd, yyyy')}</div>
                    </div>
                  </div>
                </div>
                
                {contract.reason && (
                  <p className="text-sm text-muted-foreground mb-3">Reason: {contract.reason}</p>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <p>Awaiting lender response...</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Loan Requests (as Lender) */}
        {requestsAsLender.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Loan Requests ({requestsAsLender.length})</h2>
            {requestsAsLender.map((contract) => (
              <Card key={contract.id} className="p-4">
                <div 
                  className="mb-3 flex items-start justify-between cursor-pointer" 
                  onClick={() => navigate(`/borrower/${contract.borrower_id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {contract.borrower ? getInitials(contract.borrower.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{contract.borrower?.name}</h3>
                      <p className="text-xs text-muted-foreground">Borrower</p>
                      {contract.borrower?.trust_reliability_cached !== null && (
                        <div className="flex items-center gap-1 mt-1">
                          <ReliabilityStars score={contract.borrower.trust_reliability_cached} />
                          <span className="text-xs text-muted-foreground">
                            {contract.borrower.trust_reliability_cached}%
                          </span>
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
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Due</div>
                      <div className="font-semibold">{format(new Date(contract.due_at), 'MMM dd, yyyy')}</div>
                    </div>
                  </div>
                </div>

                {contract.reason && (
                  <p className="text-sm text-muted-foreground mb-3">Reason: {contract.reason}</p>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 min-w-0 text-xs bg-success hover:bg-success/90" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(contract);
                    }}
                  >
                    Accept & Upload
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="flex-1 min-w-0 text-xs" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(contract.id);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Extension Requests */}
        {pendingExtensions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Extension Requests ({pendingExtensions.length})</h2>
            {pendingExtensions.map((extension) => {
              const contract = contracts.find(c => c.id === extension.contract_id);
              if (!contract) return null;
              
              return (
                <Card key={extension.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewContractHistory(contract, extension)}>
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                          {contract.borrower ? getInitials(contract.borrower.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{contract.borrower?.name}</h3>
                        <div className="text-xs text-muted-foreground">
                          Requesting {extension.extra_days} extra days
                      </div>
                        <div className="flex items-center gap-2 mt-1">
                          <ReliabilityStars score={contract.borrower?.trust_reliability_cached || 0} />
                          <span className="text-xs text-muted-foreground">
                            {contract.borrower?.trust_reliability_cached || 0}% reliability
                          </span>
                    </div>
                  </div>
                    </div>
                    <StatusBadge status={contract.status} />
                  </div>

                  <div className="mb-3 text-sm">
                    <p className="text-muted-foreground">New due date: {format(new Date(extension.new_due_at), 'MMM dd, yyyy')}</p>
                    <p className="text-muted-foreground">Amount: ₹{contract.amount.toLocaleString()}</p>
                    {extension.reason && (
                      <p className="text-muted-foreground">Reason: {extension.reason}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="flex-1 min-w-0 text-xs touch-target"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewContractHistory(contract, extension);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <div className="flex gap-2 flex-1">
                      <Button 
                        size="sm"
                        className="flex-1 min-w-0 text-xs bg-success hover:bg-success/90 touch-target"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExtensionAction(extension.id, true);
                        }}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm"
                        variant="destructive" 
                        className="flex-1 min-w-0 text-xs touch-target"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExtensionAction(extension.id, false);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pending Settlement - Lender needs to validate */}
        {pendingSettlementAsLender.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              💰 Review Settlement Proofs
              <span className="text-sm font-normal text-muted-foreground">
                ({pendingSettlementAsLender.length})
              </span>
            </h2>
            {pendingSettlementAsLender.map((contract) => (
              <Card key={contract.id} className="p-4 border-success/50 bg-success/5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {contract.borrower ? getInitials(contract.borrower.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{contract.borrower?.name}</h3>
                      <p className="text-xs text-muted-foreground">Borrower</p>
                    </div>
                  </div>
                  <StatusBadge status={contract.status} />
        </div>

                <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-success" />
                    <div>
                      <div className="text-xs text-muted-foreground">Amount</div>
                      <div className="font-semibold">₹{contract.amount.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-success" />
                    <div>
                      <div className="text-xs text-muted-foreground">Due Date</div>
                      <div className="font-semibold">{format(new Date(contract.due_at), 'MMM dd, yyyy')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-success/10 border border-success/30 rounded-md p-3 mb-3">
                  <p className="text-sm font-medium text-success-foreground">
                    ✅ {contract.borrower?.name} has uploaded repayment proof. Please verify and confirm!
                  </p>
        </div>

        <Button 
                  size="sm"
                  className="w-full bg-success hover:bg-success/90"
                  onClick={() => handleViewProof(contract, 'settlement')}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Review Settlement Proof
        </Button>
              </Card>
            ))}
        </div>
        )}

        {/* Pending Settlement - Borrower waiting for lender validation */}
        {pendingSettlementAsBorrower.length > 0 && (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              ⏳ Settlement Under Review
              <span className="text-sm font-normal text-muted-foreground">
                ({pendingSettlementAsBorrower.length})
              </span>
            </h2>
            {pendingSettlementAsBorrower.map((contract) => (
              <Card key={contract.id} className="p-4 border-blue-500/50 bg-blue-50">
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                          {contract.lender ? getInitials(contract.lender.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{contract.lender?.name}</h3>
                      <p className="text-xs text-muted-foreground">Lender</p>
                      </div>
                    </div>
                      <StatusBadge status={contract.status} />
                  </div>
                
                <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Amount</div>
                      <div className="font-semibold">₹{contract.amount.toLocaleString('en-IN')}</div>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Due Date</div>
                      <div className="font-semibold">{format(new Date(contract.due_at), 'MMM dd, yyyy')}</div>
                    </div>
                  </div>
                  </div>
                
                <div className="bg-blue-100 border border-blue-300 rounded-md p-3 mb-3">
                  <p className="text-sm font-medium text-blue-900">
                    ✅ You uploaded settlement proof. Waiting for {contract.lender?.name} to confirm receipt.
                  </p>
                </div>
                
                      <Button 
                        size="sm" 
                        variant="outline" 
                  className="w-full"
                  onClick={() => {
                          setActiveContract(contract);
                    setProofType('settlement');
                    setShowValidateProofDialog(true);
                        }}
                      >
                  <Eye className="mr-2 h-4 w-4" />
                  View Proof
                      </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Active Contracts */}
        {activeContracts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Active Contracts ({activeContracts.length})</h2>
            {activeContracts.map((contract) => (
              <Card key={contract.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewContractDetails(contract)}>
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {contract.borrower_id === currentUserId 
                          ? (contract.lender ? getInitials(contract.lender.name) : '?')
                          : (contract.borrower ? getInitials(contract.borrower.name) : '?')
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
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
                          <ReliabilityStars score={contract.borrower.trust_reliability_cached} />
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
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Due</div>
                      <div className="font-semibold">{format(new Date(contract.due_at), 'MMM dd, yyyy')}</div>
                    </div>
                  </div>
                </div>
                
                {contract.status === 'DUE' && isOverdue(contract.due_at) && (
                  <div className="mb-3 p-2 bg-destructive/10 rounded-md">
                    <p className="text-sm text-destructive font-medium">
                      Overdue by {getDaysOverdue(contract.due_at)} days
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {contract.borrower_id === currentUserId && contract.status === 'ACTIVE' && (
                    <>
                    {contract.settlement_pending ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 min-w-0 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowProofDialog(true);
                        }}
                      >
                        Awaiting Approval
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1 min-w-0 text-xs bg-success hover:bg-success/90"
                        onClick={(e) => {
                          e.stopPropagation();
                            handleInitiateSettlement(contract);
                        }}
                      >
                          Mark as Paid
                      </Button>
                    )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 min-w-0 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveContract(contract);
                          setShowExtensionDialog(true);
                        }}
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Request Extension
                      </Button>
                    </>
                  )}
                  
                  {contract.lender_id === currentUserId && contract.status === 'PENDING_SETTLEMENT' && contract.settlement_pending && (
                    <Button 
                      size="sm" 
                      className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProof(contract, 'settlement');
                      }}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Review Settlement
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
      </main>

          <ExtensionRequestDialog
            open={showExtensionDialog}
        onOpenChange={setShowExtensionDialog}
            onSubmit={handleExtensionSubmit}
        currentDueDate={getValidDueDate()}
      />

      <PaymentProofDialog
        open={showPaymentProofDialog}
        onOpenChange={setShowPaymentProofDialog}
        onSubmit={handlePaymentProofSubmit}
        title={proofType === 'disbursal' ? '💳 Upload Payment Proof' : '💰 Upload Settlement Proof'}
        description={
          proofType === 'disbursal'
            ? `Upload proof of payment to ${activeContract?.borrower?.name || 'borrower'}`
            : `Upload proof of repayment to ${activeContract?.lender?.name || 'lender'}`
        }
      />

      <ValidateProofDialog
        open={showValidateProofDialog}
        onOpenChange={setShowValidateProofDialog}
        proofUrl={
          proofType === 'disbursal'
            ? (activeContract?.disbursal_proof_url || '')
            : (activeContract?.repayment_proof_url || '')
        }
        proofType={proofType}
        userName={
          proofType === 'disbursal'
            ? (activeContract?.lender?.name || 'Lender')
            : (activeContract?.borrower?.name || 'Borrower')
        }
        amount={activeContract?.amount || 0}
        onValidate={handleValidateProof}
        viewOnly={
          // View only if you're the one who uploaded the proof
          proofType === 'disbursal'
            ? activeContract?.lender_id === currentUserId
            : activeContract?.borrower_id === currentUserId
        }
      />

      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        onSubmit={handleReviewSubmit}
        borrowerName={activeContract?.borrower?.name || 'Borrower'}
      />

      <InviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      <ContractHistoryDialog
        open={showContractHistoryDialog}
        onOpenChange={setShowContractHistoryDialog}
        contract={activeContract}
        extension={activeExtension}
      />

      <ContractDetailsDialog
        open={showContractDetailsDialog}
        onOpenChange={setShowContractDetailsDialog}
        contract={activeContract}
        showActions={true}
        userRole={activeContract?.borrower_id === currentUserId ? 'borrower' : activeContract?.lender_id === currentUserId ? 'lender' : 'viewer'}
      />

      {/* Reminder Manager Dialog */}
      {showReminderManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowReminderManager(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Reminder Manager</h2>
              <button 
                onClick={() => setShowReminderManager(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <ReminderManager
                userId={currentUserId}
                onReminderAction={(action, reminderId) => {
                  console.log(`Reminder action: ${action} for reminder: ${reminderId}`);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Fallback In-App Notifications for iOS Chrome */}
      <InAppNotification userId={currentUserId} />
      
      {/* Security Test Runner - Only show in demo mode */}
      {/* {import.meta.env.MODE === 'development' && (
        <SecurityTestRunner />
      )} */}
      </div>
    </ErrorBoundary>
  );
}
