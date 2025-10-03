import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProofViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null | undefined;
  title?: string;
}

export function ProofViewerDialog({ open, onOpenChange, imageUrl, title = 'Payment Proof' }: ProofViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {imageUrl ? (
          <img src={imageUrl} alt="Payment proof" className="w-full max-h-[70vh] rounded-md object-contain border" />
        ) : (
          <p className="text-sm text-muted-foreground">No proof uploaded yet.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}


