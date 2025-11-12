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
import { ArrowLeft, Package, Camera, X } from 'lucide-react';

export default function CreateItemContract() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { currentUserId: prodCurrentUserId } = useProductionAuthStore();
  const { currentMode } = useModeManager();
  const { toast } = useToast();
  
  const isDemoMode = currentMode === 'demo';
  const currentAuthUserId = isDemoMode ? currentUserId : prodCurrentUserId;
  
  const [phone, setPhone] = useState('+91 ');
  const [itemTitle, setItemTitle] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [conditionPhotos, setConditionPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!currentAuthUserId) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create an item contract',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [currentAuthUserId, navigate, toast]);
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (conditionPhotos.length + files.length > 5) {
      toast({
        title: 'Too Many Photos',
        description: 'Maximum 5 condition photos allowed',
        variant: 'destructive',
      });
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConditionPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removePhoto = (index: number) => {
    setConditionPhotos(prev => prev.filter((_, i) => i !== index));
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
    
    if (!itemTitle.trim()) {
      toast({
        title: 'Item Title Required',
        description: 'Please enter the item title',
        variant: 'destructive',
      });
      return false;
    }
    
    const valueNum = parseFloat(estimatedValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      toast({
        title: 'Invalid Estimated Value',
        description: 'Please enter a valid estimated value',
        variant: 'destructive',
      });
      return false;
    }
    
    if (!returnDate) {
      toast({
        title: 'Return Date Required',
        description: 'Please select a return date',
        variant: 'destructive',
      });
      return false;
    }
    
    if (conditionPhotos.length === 0) {
      toast({
        title: 'Photos Required',
        description: 'Please upload at least one condition photo',
        variant: 'destructive',
      });
      return false;
    }
    
    const returnDateTime = new Date(`${returnDate}T${time}`);
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    if (returnDateTime < minDate || returnDateTime > maxDate) {
      toast({
        title: 'Invalid Return Date',
        description: 'Return date must be between 24 hours and 90 days from now',
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
      
      let lender = await client.getUserByPhone(cleanPhone);
      if (!lender) {
        toast({
          title: 'User Not Found',
          description: 'The lender must have an account. Please ask them to sign up first.',
          variant: 'destructive',
        });
        return;
      }
      
      const returnDateTime = new Date(`${returnDate}T${time}`);
      
      await client.createContract({
        borrower_id: currentAuthUserId,
        lender_id: lender.id,
        amount: parseFloat(estimatedValue),
        due_at: returnDateTime.toISOString(),
        reason: reason || null,
        status: 'REQUESTED',
        contract_type: 'ITEM',
        item_title: itemTitle,
        item_estimated_value: parseFloat(estimatedValue),
        item_condition_photos: conditionPhotos,
      });
      
      toast({
        title: 'Success!',
        description: 'Item lending request created successfully',
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
          <div className="p-3 rounded-lg bg-blue-50">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Item Lending Request</h1>
            <p className="text-sm text-muted-foreground">Create a request to borrow an item</p>
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
            <Label htmlFor="itemTitle">Item Title *</Label>
            <Input
              id="itemTitle"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="e.g., Laptop, Camera, Bicycle"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="estimatedValue">Estimated Value (₹) *</Label>
            <Input
              id="estimatedValue"
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="Approximate market value"
              min="1"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              This helps establish the item's worth for the agreement
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="returnDate">Return Date *</Label>
              <Input
                id="returnDate"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
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
            <Label htmlFor="reason">Purpose (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need to borrow this item?"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="photos">Item Condition Photos *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload 1-5 photos showing the item's current condition (before handover)
            </p>
            <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              disabled={conditionPhotos.length >= 5}
            />
            
            {conditionPhotos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {conditionPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Condition ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {conditionPhotos.length}/5 photos uploaded
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-1">📸 Photo Tips:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Take clear photos from multiple angles</li>
              <li>• Show any existing damage or wear</li>
              <li>• Include serial numbers or unique identifiers</li>
              <li>• These photos protect both parties</li>
            </ul>
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
