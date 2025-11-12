import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { useModeManager } from '@/hooks/useModeManager';
import { getDataClient } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, DollarSign, Upload } from 'lucide-react';

export default function CreateMoneyContract() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { currentUserId: prodCurrentUserId } = useProductionAuthStore();
  const { currentMode } = useModeManager();
  const { toast } = useToast();
  
  const isDemoMode = currentMode === 'demo';
  const currentAuthUserId = isDemoMode ? currentUserId : prodCurrentUserId;
  
  const [phone, setPhone] = useState('+91 ');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [disbursalProof, setDisbursalProof] = useState<File | null>(null);
  const [disbursalPreview, setDisbursalPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!currentAuthUserId) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a money contract',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [currentAuthUserId, navigate, toast]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'attachment' | 'disbursal') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'attachment') {
          setAttachedFile(file);
          setFilePreview(reader.result as string);
        } else {
          setDisbursalProof(file);
          setDisbursalPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = () => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone.match(/^\+91\d{10}$/)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit Indian mobile number',
        variant: 'destructive',
      });
      return false;
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 100) {
      toast({
        title: 'Invalid Amount',
        description: 'Amount must be at least ₹100',
        variant: 'destructive',
      });
      return false;
    }
    
    if (!dueDate) {
      toast({
        title: 'Due Date Required',
        description: 'Please select a repayment due date',
        variant: 'destructive',
      });
      return false;
    }
    
    const dueDateTime = new Date(`${dueDate}T${time}`);
    const now = new Date();
    const minDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    if (dueDateTime < minDate || dueDateTime > maxDate) {
      toast({
        title: 'Invalid Due Date',
        description: 'Due date must be between 48 hours and 90 days from now',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !currentAuthUserId) return;
    
    setLoading(true);
    try {
      const client = getDataClient();
      const cleanPhone = phone.replace(/\s/g, '');
      
      // Check if lender exists
      let lender = await client.getUserByPhone(cleanPhone);
      if (!lender) {
        toast({
          title: 'User Not Found',
          description: 'The lender must have an account. Please ask them to sign up first.',
          variant: 'destructive',
        });
        return;
      }
      
      const dueDateTime = new Date(`${dueDate}T${time}`);
      
      await client.createContract({
        borrower_id: currentAuthUserId,
        lender_id: lender.id,
        amount: parseFloat(amount),
        due_at: dueDateTime.toISOString(),
        reason: reason || null,
        attachment_url: filePreview,
        disbursal_proof_url: disbursalPreview,
        status: 'REQUESTED',
        contract_type: 'MONEY',
      });
      
      toast({
        title: 'Success!',
        description: 'Money lending request created successfully',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Create contract error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create contract',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/create')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-green-50">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Money Lending Request</h1>
            <p className="text-sm text-muted-foreground">Create a request to borrow money</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="phone">Lender Phone Number *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Minimum ₹100"
              min="100"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Repayment Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need this money?"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="attachment">Attachment (Optional)</Label>
            <Input
              id="attachment"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, 'attachment')}
            />
            {filePreview && (
              <p className="text-sm text-muted-foreground mt-2">
                File attached: {attachedFile?.name}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="disbursalProof">Disbursal Proof (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              If the lender has already given you the money, upload proof here
            </p>
            <Input
              id="disbursalProof"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, 'disbursal')}
            />
            {disbursalPreview && (
              <p className="text-sm text-muted-foreground mt-2">
                Proof attached: {disbursalProof?.name}
              </p>
            )}
          </div>
          
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
