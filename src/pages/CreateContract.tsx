import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MobileHeader } from '@/components/MobileHeader';
import { useAuthStore } from '@/store/authStore';
import { getDataClient } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function CreateContract() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState('+91 ');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [dueDate, setDueDate] = useState<string>(''); // deprecated, kept for fallback
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('10:00');
  const [dateOpen, setDateOpen] = useState(false);
  const [suppressBlur, setSuppressBlur] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

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
    if (!phone || !amount || !selectedDate || !time) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Phone number validation
    const phoneRegex = /^\+91\s?\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid Indian phone number (+91 followed by 10 digits)',
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

    // Build due datetime from selected date + time
    const due = new Date(selectedDate);
    const [hh, mm] = time.split(':').map((v) => parseInt(v, 10));
    due.setHours(hh || 0, mm || 0, 0, 0);

    // Check due date is at least 48 hours from now
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
        attachment_url: filePreview || null,
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAttachedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      setFilePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setAttachedFile(null);
    setFilePreview(null);
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
                <Label htmlFor="dueDateBtn">Repayment Date *</Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="dueDateBtn"
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                      onClick={() => setDateOpen(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? selectedDate.toDateString() : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setDateOpen(false);
                        setTimeout(() => {
                          const input = document.getElementById('repay-time') as HTMLInputElement | null;
                          input?.focus();
                        }, 0);
                      }}
                      disabled={(date) => {
                        const now = new Date();
                        const minDate = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
                        const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
                        return date < minDate || date > maxDate;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm cursor-text"
                  onClick={() => {
                    setTimePickerOpen(true);
                    const input = document.getElementById('repay-time') as HTMLInputElement | null;
                    setTimeout(() => {
                    input?.showPicker?.();
                    input?.focus();
                    }, 100);
                  }}
                >
                  <input
                    id="repay-time"
                    type="time"
                    value={time}
                    onFocus={() => {
                      setTimePickerOpen(true);
                      setSuppressBlur(true);
                    }}
                    onChange={(e) => {
                      setTime(e.target.value);
                      // Don't auto-close, let user finish selecting AM/PM
                    }}
                    onBlur={(e) => {
                      if (suppressBlur) {
                        e.preventDefault();
                        e.stopPropagation();
                        (e.target as HTMLInputElement).focus();
                      } else {
                        setTimePickerOpen(false);
                        setSuppressBlur(false);
                      }
                    }}
                    className="w-full bg-transparent outline-none"
                    required
                  />
                </div>
                {timePickerOpen && (
                  <p className="text-xs text-muted-foreground">
                    Select time and AM/PM, then click outside to close
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Minimum 48 hours from now, maximum 90 days
                </p>
              </div>
            </div>

            {/* Attach Proof */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                Attach Proof (Optional)
              </h3>
              
              <div className="space-y-2">
                <input
                  id="attachment"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                disabled={loading}
                  onClick={() => document.getElementById('attachment')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                  {attachedFile ? 'Change File' : 'Upload Receipt or Document'}
                </Button>
                
                {attachedFile && (
                  <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{attachedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(attachedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
              </Button>
                  </div>
                )}
                
                {filePreview && attachedFile?.type.startsWith('image/') && (
                  <img 
                    src={filePreview} 
                    alt="File preview" 
                    className="max-h-32 w-full rounded-md object-contain border"
                  />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Add any receipts, agreements, or supporting documents (PDF, DOC, or images)
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
