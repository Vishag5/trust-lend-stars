import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface PaymentProofDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (proofUrl: string, notes?: string) => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function PaymentProofDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  isLoading = false,
}: PaymentProofDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !previewUrl) return;
    
    setUploading(true);
    
    // In a real app, you'd upload to a server/cloud storage
    // For now, we'll use the data URL (base64) directly
    // Note: This is for demo purposes only - in production, use proper file storage
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Pass the data URL as the proof URL
      onSubmit(previewUrl, notes || undefined);
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setNotes('');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading && !isLoading) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setNotes('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="proof-upload">Payment Screenshot</Label>
            <div className="flex flex-col gap-3">
              <input
                id="proof-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!previewUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={() => document.getElementById('proof-upload')?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Tap to upload payment screenshot
                    </span>
                  </div>
                </Button>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Payment proof preview"
                    className="w-full h-48 object-contain rounded-md border"
                  />
                  <div className="absolute top-2 right-2 bg-success text-success-foreground rounded-full p-1">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => document.getElementById('proof-upload')?.click()}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Change Screenshot
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a screenshot of your payment confirmation
            </p>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="proof-notes">Additional Notes (Optional)</Label>
            <Textarea
              id="proof-notes"
              placeholder="e.g., Transaction ID, UPI reference, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploading || isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || uploading || isLoading}
          >
            {uploading || isLoading ? 'Uploading...' : 'Submit Proof'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

