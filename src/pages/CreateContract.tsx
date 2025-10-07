import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MobileHeader } from '@/components/MobileHeader';
import { useAuthStore } from '@/store/authStore';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { useModeManager } from '@/hooks/useModeManager';
import { getDataClient } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function CreateContract() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { currentUserId: prodCurrentUserId } = useProductionAuthStore();
  const { currentMode } = useModeManager();
  const { toast } = useToast();
  
  // Use appropriate auth store based on mode
  const isDemoMode = currentMode === 'demo';
  const currentAuthUserId = isDemoMode ? currentUserId : prodCurrentUserId;
  

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentAuthUserId) {
      console.log('CreateContract: No auth user, redirecting to login');
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a loan request',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [currentAuthUserId, navigate, toast]);
  
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
  
  // New state for enhanced phone lookup
  const [foundUser, setFoundUser] = useState<any>(null);
  const [phoneLookupLoading, setPhoneLookupLoading] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Enhanced phone lookup function
  const handlePhoneLookup = async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setFoundUser(null);
      return;
    }

    setPhoneLookupLoading(true);
    try {
      const client = getDataClient();
      
      // Try different phone number formats
      const formats = [
        phoneNumber.replace(/\s/g, ''), // Remove spaces: +918891932891
        phoneNumber.startsWith('+91') ? phoneNumber.replace(/\s/g, '') : `+91${phoneNumber.replace(/^\+91/, '').replace(/\s/g, '')}`, // Ensure +91 prefix without spaces
        phoneNumber.replace(/^\+91\s?/, '').replace(/\s/g, ''), // Remove +91 prefix and spaces: 8891932891
        phoneNumber.replace(/\s/g, ''), // Just remove spaces
      ];

      let foundUser = null;
      for (const format of formats) {
        foundUser = await client.getUserByPhone(format);
        if (foundUser) break;
      }

      setFoundUser(foundUser);
    } catch (error) {
      console.error('Phone lookup error:', error);
      setFoundUser(null);
    } finally {
      setPhoneLookupLoading(false);
    }
  };

  // Trigger phone lookup when phone number changes
  useEffect(() => {
    if (phone && phone.length >= 10) {
      const timeoutId = setTimeout(() => {
        handlePhoneLookup(phone);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setFoundUser(null);
    }
  }, [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAuthUserId) {
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

    // Secure phone number validation
    const { validateAndSanitize, phoneSchema } = await import('@/lib/inputValidation');
    const phoneValidation = validateAndSanitize(phoneSchema, phone);
    if (!phoneValidation.success) {
      toast({
        title: 'Invalid phone number',
        description: phoneValidation.error,
        variant: 'destructive',
      });
      return;
    }

    // Secure amount validation
    const amountNum = parseFloat(amount);
    const { amountSchema } = await import('@/lib/inputValidation');
    const amountValidation = validateAndSanitize(amountSchema, amountNum);
    if (!amountValidation.success) {
      toast({
        title: 'Invalid amount',
        description: amountValidation.error,
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
      
      // Check if user is found
      if (!foundUser) {
        setShowInviteDialog(true);
        setLoading(false);
        return;
      }

      // Create contract with found user
      await client.createContract({
        borrower_id: currentAuthUserId,
        lender_id: foundUser.id,
        amount: amountNum,
        due_at: due.toISOString(),
        reason: reason || null,
        attachment_url: filePreview || null,
      });

      toast({
        title: 'Loan request sent!',
        description: `Your request has been sent to ${foundUser.name}`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Create contract error:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to create loan request';
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message?.includes('400')) {
        errorMessage = 'Invalid request. Please check your data and try again.';
      } else if (error.message?.includes('401')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message?.includes('403')) {
        errorMessage = 'Permission denied. Please check your account status.';
      } else if (error.message) {
        errorMessage = `Failed to create loan request: ${error.message}`;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Import file validation
    const { validateFile } = await import('@/lib/fileValidation');
    
    // Validate file security
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: 'Invalid file',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }
    
    // Use sanitized file
    const secureFile = validation.sanitizedFile || file;
    setAttachedFile(secureFile);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      setFilePreview(result);
    };
    reader.readAsDataURL(secureFile);
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
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    required
                    className={foundUser ? 'border-green-500' : foundUser === false ? 'border-red-500' : ''}
                  />
                  {phoneLookupLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                  )}
                </div>
                
                {/* Show found user info */}
                {foundUser && (
                  <div className="rounded-md bg-green-50 border border-green-200 p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-green-700">
                          {foundUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-900">{foundUser.name}</p>
                        <p className="text-xs text-green-700">{foundUser.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show not found message */}
                {!foundUser && phone.length > 10 && !phoneLookupLoading && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-3">
                    <p className="text-sm text-red-700">
                      No user found with this phone number. 
                      <button 
                        type="button"
                        onClick={() => setShowInviteDialog(true)}
                        className="ml-1 text-red-600 underline hover:text-red-800"
                      >
                        Invite them to join
                      </button>
                    </p>
                  </div>
                )}
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
      
      {/* Invite Dialog */}
      {showInviteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Invite to LenTrust</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The person with phone number <strong>{phone}</strong> is not registered on LenTrust. 
              You can invite them to join the platform.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => {
                  const phoneNumber = phone.replace(/\D/g, '');
                  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=Hi! I'd like to invite you to join LenTrust, a secure platform for lending and borrowing money. Sign up at: https://lentrust.app`;
                  window.open(whatsappUrl, '_blank');
                  setShowInviteDialog(false);
                }}
                className="w-full"
              >
                Send WhatsApp Invite
              </Button>
              
              <Button
                onClick={() => {
                  const phoneNumber = phone.replace(/\D/g, '');
                  const smsUrl = `sms:${phoneNumber}?body=Hi! I'd like to invite you to join LenTrust, a secure platform for lending and borrowing money. Sign up at: https://lentrust.app`;
                  window.open(smsUrl, '_blank');
                  setShowInviteDialog(false);
                }}
                variant="outline"
                className="w-full"
              >
                Send SMS Invite
              </Button>
              
              <Button
                onClick={() => setShowInviteDialog(false)}
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
