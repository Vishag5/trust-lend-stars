import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { getDataClient } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function CreateContract() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState('');
  const [lenderPhone, setLenderPhone] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      toast({ title: 'Error', description: 'Not logged in', variant: 'destructive' });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < 100) {
      toast({ title: 'Invalid amount', description: 'Minimum amount is ₹100', variant: 'destructive' });
      return;
    }

    const dueDateTime = new Date(`${dueDate}T${dueTime}`);
    const minDue = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const maxDue = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    if (dueDateTime < minDue) {
      toast({ title: 'Invalid due date', description: 'Due date must be at least 48 hours from now', variant: 'destructive' });
      return;
    }

    if (dueDateTime > maxDue) {
      toast({ title: 'Invalid due date', description: 'Due date cannot exceed 90 days', variant: 'destructive' });
      return;
    }

    if (!/^\+91\d{10}$/.test(lenderPhone.replace(/\s/g, ''))) {
      toast({ title: 'Invalid phone', description: 'Phone must be in format +91XXXXXXXXXX', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const client = getDataClient();
      const lender = await client.getUserByPhone(lenderPhone.replace(/\s/g, ''));

      if (!lender) {
        toast({ title: 'Lender not found', description: 'No user found with this phone number', variant: 'destructive' });
        setLoading(false);
        return;
      }

      await client.createContract({
        borrower_id: currentUserId,
        lender_id: lender.id,
        amount: amountNum,
        due_at: dueDateTime.toISOString(),
        reason: reason || null,
      });

      toast({ title: 'Request created', description: 'Your loan request has been sent' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create contract', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

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

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Loan Request</CardTitle>
            <CardDescription>Request money from a trusted lender</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (₹)</label>
                <Input
                  type="number"
                  placeholder="Minimum ₹100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lender Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+91 90000 22222"
                  value={lenderPhone}
                  onChange={(e) => setLenderPhone(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Time</label>
                  <Input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason (Optional)</label>
                <Textarea
                  placeholder="Why do you need this loan?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Send Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
