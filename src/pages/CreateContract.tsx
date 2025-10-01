import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MobileHeader } from '@/components/MobileHeader';
import { useAuthStore } from '@/store/authStore';
import { getDataClient } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload } from 'lucide-react';

export default function CreateContract() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId) {
      toast({
        title: 'Error',
        description: 'Please log in first',
        variant: 'destructive',
      });
      return;
    }

    // Validation
    if (!phone || !amount || !dueDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 100) {
      toast({
        title: 'Invalid amount',
        description: 'Amount must be at least ₹100',
        variant: 'destructive',
      });
      return;
    }

    // Check due date is at least 48 hours from now
    const due = new Date(dueDate);
    const minDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    
    if (due < minDate) {
      toast({
        title: 'Invalid due date',
        description: 'Due date must be at least 48 hours from now',
        variant: 'destructive',
      });
      return;
    }

    if (due > maxDate) {
      toast({
        title: 'Invalid due date',
        description: 'Due date must be within 90 days',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const client = getDataClient();
      
      // Find lender by phone
      const lender = await client.getUserByPhone(phone.replace(/\s/g, ''));
      if (!lender) {
        toast({
          title: 'Lender not found',
          description: 'No user found with this phone number. Would you like to invite them?',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Create contract
      await client.createContract({
        borrower_id: currentUserId,
        lender_id: lender.id,
        amount: amountNum,
        due_at: due.toISOString(),
        reason: reason || null,
      });

      toast({
        title: 'Loan request sent!',
        description: 'The lender will receive a notification to review your request',
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create loan request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <MobileHeader title="Request Loan" showBack />
      
      <main className="flex-1 px-4 py-6">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Loan Request Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lender Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                Lender Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Lender's Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Loan Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                Loan Details
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (INR) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    className="pl-8"
                    required
                    min="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Loan</Label>
                <Input
                  id="reason"
                  type="text"
                  placeholder="e.g., Emergency medical expense"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Repayment Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Maximum 30 days from today
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional terms or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Help your lender understand your situation
                </p>
              </div>
            </div>

            {/* Attach Proof */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                Attach Proof (Optional)
              </h3>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Receipt or Document
              </Button>
              <p className="text-xs text-muted-foreground">
                Add any receipts, agreements, or supporting documents
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="space-y-3 pt-4">
              <Button 
                type="submit" 
                className="w-full bg-success hover:bg-success/90" 
                size="lg"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Loan Request'}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              The lender will receive a notification to review your request
            </p>
          </form>
        </Card>
      </main>
    </div>
  );
}
