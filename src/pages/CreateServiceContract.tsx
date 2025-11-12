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
import { getDataClient, ServiceMilestone } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Briefcase, Plus, Trash2 } from 'lucide-react';

export default function CreateServiceContract() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { currentUserId: prodCurrentUserId } = useProductionAuthStore();
  const { currentMode } = useModeManager();
  const { toast } = useToast();
  
  const isDemoMode = currentMode === 'demo';
  const currentAuthUserId = isDemoMode ? currentUserId : prodCurrentUserId;
  
  const [phone, setPhone] = useState('+91 ');
  const [serviceDescription, setServiceDescription] = useState('');
  const [milestones, setMilestones] = useState<Array<{
    id: string;
    title: string;
    due_at: string;
    time: string;
    amount: number | string;
  }>>([
    { id: '1', title: '', due_at: '', time: '10:00', amount: '' }
  ]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!currentAuthUserId) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a service contract',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [currentAuthUserId, navigate, toast]);
  
  const addMilestone = () => {
    if (milestones.length >= 10) {
      toast({
        title: 'Maximum Milestones Reached',
        description: 'You can add up to 10 milestones',
        variant: 'destructive',
      });
      return;
    }
    
    setMilestones([
      ...milestones,
      { id: Date.now().toString(), title: '', due_at: '', time: '10:00', amount: '' }
    ]);
  };
  
  const removeMilestone = (id: string) => {
    if (milestones.length === 1) {
      toast({
        title: 'Cannot Remove',
        description: 'At least one milestone is required',
        variant: 'destructive',
      });
      return;
    }
    setMilestones(milestones.filter(m => m.id !== id));
  };
  
  const updateMilestone = (id: string, field: string, value: any) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };
  
  const calculateTotalAmount = () => {
    return milestones.reduce((sum, m) => {
      const amt = parseFloat(m.amount as string);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
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
    
    if (!serviceDescription.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please describe the service work',
        variant: 'destructive',
      });
      return false;
    }
    
    if (milestones.length === 0) {
      toast({
        title: 'Milestones Required',
        description: 'Please add at least one milestone',
        variant: 'destructive',
      });
      return false;
    }
    
    for (const milestone of milestones) {
      if (!milestone.title.trim()) {
        toast({
          title: 'Milestone Title Required',
          description: 'All milestones must have a title',
          variant: 'destructive',
        });
        return false;
      }
      
      if (!milestone.due_at) {
        toast({
          title: 'Milestone Due Date Required',
          description: 'All milestones must have a due date',
          variant: 'destructive',
        });
        return false;
      }
      
      const amt = parseFloat(milestone.amount as string);
      if (isNaN(amt) || amt <= 0) {
        toast({
          title: 'Invalid Milestone Amount',
          description: 'All milestones must have a valid amount',
          variant: 'destructive',
        });
        return false;
      }
      
      const dueDateTime = new Date(`${milestone.due_at}T${milestone.time}`);
      const now = new Date();
      if (dueDateTime < now) {
        toast({
          title: 'Invalid Due Date',
          description: 'Milestone due dates must be in the future',
          variant: 'destructive',
        });
        return false;
      }
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
      
      let counterparty = await client.getUserByPhone(cleanPhone);
      if (!counterparty) {
        toast({
          title: 'User Not Found',
          description: 'The client must have an account. Please ask them to sign up first.',
          variant: 'destructive',
        });
        return;
      }
      
      // Convert milestones to proper format
      const serviceMilestones: ServiceMilestone[] = milestones.map(m => ({
        id: m.id,
        title: m.title,
        due_at: new Date(`${m.due_at}T${m.time}`).toISOString(),
        amount: parseFloat(m.amount as string),
        proof_url: null,
        approved: null,
      }));
      
      // Find last milestone date as the contract due_at
      const lastMilestone = serviceMilestones.reduce((latest, m) => 
        new Date(m.due_at) > new Date(latest.due_at) ? m : latest
      );
      
      await client.createContract({
        borrower_id: currentAuthUserId, // Service provider
        lender_id: counterparty.id,      // Client
        amount: calculateTotalAmount(),
        due_at: lastMilestone.due_at,
        reason: null,
        status: 'REQUESTED',
        contract_type: 'SERVICE',
        service_description: serviceDescription,
        service_milestones: serviceMilestones,
      });
      
      toast({
        title: 'Success!',
        description: 'Service agreement created successfully',
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
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
          <div className="p-3 rounded-lg bg-purple-50">
            <Briefcase className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Service Agreement</h1>
            <p className="text-sm text-muted-foreground">Create a work/service contract with milestones</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="phone">Client Phone Number *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="serviceDescription">Service Description *</Label>
            <Textarea
              id="serviceDescription"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Describe the service or work to be done..."
              rows={4}
              required
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Milestones *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
                disabled={milestones.length >= 10}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            </div>
            
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <Card key={milestone.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium">Milestone {index + 1}</h4>
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                        placeholder="e.g., Design mockups, First draft, Final delivery"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Due Date *</Label>
                        <Input
                          type="date"
                          value={milestone.due_at}
                          onChange={(e) => updateMilestone(milestone.id, 'due_at', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={milestone.time}
                          onChange={(e) => updateMilestone(milestone.id, 'time', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Amount (₹) *</Label>
                      <Input
                        type="number"
                        value={milestone.amount}
                        onChange={(e) => updateMilestone(milestone.id, 'amount', e.target.value)}
                        placeholder="Payment for this milestone"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="mt-3 p-3 bg-muted rounded-lg flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-xl font-bold">₹{calculateTotalAmount().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-1">💡 Service Agreement Tips:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Break down work into clear, deliverable milestones</li>
              <li>• Set realistic due dates for each milestone</li>
              <li>• Each milestone requires approval before payment</li>
              <li>• You can request extensions if needed (max 3 per agreement)</li>
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
              {loading ? 'Creating...' : 'Create Agreement'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
