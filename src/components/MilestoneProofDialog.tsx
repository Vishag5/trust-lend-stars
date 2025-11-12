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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { ServiceMilestone } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';

interface MilestoneProofDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: ServiceMilestone;
  mode: 'upload' | 'view' | 'approve';
  onProofUpload?: (milestoneId: string, proofUrl: string, notes?: string) => Promise<void>;
  onProofApprove?: (milestoneId: string, approved: boolean, notes?: string) => Promise<void>;
}

export function MilestoneProofDialog({
  open,
  onOpenChange,
  milestone,
  mode,
  onProofUpload,
  onProofApprove,
}: MilestoneProofDialogProps) {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofFile(file);
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUpload = async () => {
    if (!proofPreview || !onProofUpload) return;
    
    setLoading(true);
    try {
      await onProofUpload(milestone.id, proofPreview, notes || undefined);
      
      toast({
        title: 'Proof Uploaded',
        description: 'Milestone proof has been submitted for approval',
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Upload proof error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload proof',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproval = async (approved: boolean) => {
    if (!onProofApprove) return;
    
    setLoading(true);
    try {
      await onProofApprove(milestone.id, approved, notes || undefined);
      
      toast({
        title: approved ? 'Milestone Approved' : 'Milestone Rejected',
        description: approved 
          ? 'The milestone has been marked as complete'
          : 'The milestone has been rejected and requires rework',
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Approval error:', error);
      toast({
        title: 'Action Failed',
        description: error.message || 'Failed to process approval',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setProofFile(null);
    setProofPreview(null);
    setNotes('');
  };
  
  const getStatusBadge = () => {
    if (milestone.approved === true) {
      return <Badge className="bg-green-500">Approved</Badge>;
    } else if (milestone.approved === false) {
      return <Badge variant="destructive">Rejected</Badge>;
    } else {
      return <Badge variant="secondary">Pending Review</Badge>;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'upload' && <Upload className="h-5 w-5" />}
            {mode === 'view' && <FileText className="h-5 w-5" />}
            {mode === 'approve' && <CheckCircle className="h-5 w-5" />}
            {mode === 'upload' ? 'Upload Milestone Proof' : 
             mode === 'view' ? 'View Milestone Proof' : 'Review Milestone'}
          </DialogTitle>
          <DialogDescription>
            {milestone.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Due Date</Label>
              <p className="text-sm font-medium">
                {new Date(milestone.due_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Amount</Label>
              <p className="text-sm font-medium">₹{milestone.amount.toFixed(2)}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>
          </div>
          
          {mode === 'upload' && (
            <>
              <div>
                <Label htmlFor="proof">Upload Proof *</Label>
                <Input
                  id="proof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                {proofPreview && (
                  <div className="mt-3">
                    {proofFile?.type.startsWith('image/') ? (
                      <img
                        src={proofPreview}
                        alt="Proof preview"
                        className="w-full max-h-64 object-contain rounded border"
                      />
                    ) : (
                      <div className="p-4 bg-muted rounded border text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm">{proofFile?.name}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any comments about this milestone completion..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </>
          )}
          
          {(mode === 'view' || mode === 'approve') && milestone.proof_url && (
            <div>
              <Label>Submitted Proof</Label>
              <div className="mt-2">
                {milestone.proof_url.startsWith('data:image') ? (
                  <img
                    src={milestone.proof_url}
                    alt="Milestone proof"
                    className="w-full max-h-96 object-contain rounded border"
                  />
                ) : (
                  <div className="p-4 bg-muted rounded border text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">Proof document attached</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {mode === 'approve' && (
            <div>
              <Label htmlFor="approvalNotes">Review Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add comments about your decision..."
                rows={3}
                className="mt-1"
              />
            </div>
          )}
          
          {!milestone.proof_url && mode !== 'upload' && (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No proof uploaded yet</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {mode === 'upload' && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!proofPreview || loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Proof
                  </>
                )}
              </Button>
            </>
          )}
          
          {mode === 'view' && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          )}
          
          {mode === 'approve' && milestone.approved === null && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleApproval(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
              <Button
                onClick={() => handleApproval(true)}
                disabled={loading}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
