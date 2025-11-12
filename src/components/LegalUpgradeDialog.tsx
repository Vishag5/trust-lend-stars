import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, FileSignature, Stamp, Loader2 } from 'lucide-react';
import { legalProvider, LegalMode } from '@/lib/legalProvider';
import { useToast } from '@/hooks/use-toast';

interface LegalUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  onUpgradeComplete: (providerRef: string, mode: LegalMode) => void;
}

export function LegalUpgradeDialog({
  open,
  onOpenChange,
  contractId,
  onUpgradeComplete,
}: LegalUpgradeDialogProps) {
  const [selectedMode, setSelectedMode] = useState<'ESIGN' | 'ESTAMP' | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleModeToggle = (mode: 'ESIGN' | 'ESTAMP') => {
    if (selectedMode === mode) {
      setSelectedMode(null);
    } else {
      setSelectedMode(mode);
    }
  };
  
  const getFinalMode = (): LegalMode | null => {
    if (!selectedMode) return null;
    return selectedMode;
  };
  
  const handleProceed = async () => {
    const mode = getFinalMode();
    if (!mode) {
      toast({
        title: 'Selection Required',
        description: 'Please select at least one legal upgrade option',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const { provider_ref } = await legalProvider.createSession(contractId, mode);
      
      toast({
        title: 'Legal Upgrade Initiated',
        description: 'Your agreement is being upgraded with legal strength',
      });
      
      onUpgradeComplete(provider_ref, mode);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Legal upgrade error:', error);
      toast({
        title: 'Upgrade Failed',
        description: error.message || 'Failed to initiate legal upgrade',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-green-600" />
            <DialogTitle>Upgrade to Legal Strength</DialogTitle>
          </div>
          <DialogDescription>
            Make this agreement legally enforceable with electronic signatures and stamps
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMode === 'ESIGN' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleModeToggle('ESIGN')}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedMode === 'ESIGN'}
                onCheckedChange={() => handleModeToggle('ESIGN')}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileSignature className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-semibold">e-Sign</Label>
                  <Badge variant="secondary">Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add legally valid electronic signatures from both parties. 
                  Uses Aadhaar-based authentication for verification.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  ✓ Legally recognized under IT Act 2000<br />
                  ✓ Court admissible evidence<br />
                  ✓ Completes in ~5 minutes
                </div>
              </div>
            </div>
          </div>
          
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMode === 'ESTAMP' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleModeToggle('ESTAMP')}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedMode === 'ESTAMP'}
                onCheckedChange={() => handleModeToggle('ESTAMP')}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Stamp className="h-5 w-5 text-purple-600" />
                  <Label className="text-base font-semibold">e-Stamp</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add a government-issued electronic stamp to your agreement. 
                  Provides additional legal validity and stamp duty compliance.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  ✓ Government authorized<br />
                  ✓ Stamp duty compliant<br />
                  ✓ Additional nominal fee applies
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>When to upgrade:</strong> Consider legal upgrade for high-value agreements 
              (₹10,000+), long-term commitments, or if disputes are anticipated. Both parties 
              will be notified and must complete the verification process.
            </p>
          </div>
          
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Privacy Note:</strong> Your Aadhaar details are processed securely by 
              authorized government platforms. LenTrust does not store or access your Aadhaar number.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!selectedMode || loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Proceed with Upgrade
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
