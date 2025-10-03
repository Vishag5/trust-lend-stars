import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SettleUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (proofUrl: string) => void;
}

export function SettleUpDialog({ open, onOpenChange, onUpload }: SettleUpDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!previewUrl) return;
    onUpload(previewUrl);
    setPreviewUrl(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    setPreviewUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
          <DialogDescription>
            Upload a screenshot or receipt of your repayment. This will be sent to the lender for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="repay-proof">Repayment Proof *</Label>
            <input
              id="repay-proof"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            {previewUrl && (
              <img src={previewUrl} alt="Repayment proof preview" className="mt-2 max-h-48 w-full rounded-md object-contain border" />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!previewUrl}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


