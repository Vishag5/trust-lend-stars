import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Download, ZoomIn } from 'lucide-react';
import { useState } from 'react';

interface ValidateProofDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proofUrl: string;
  proofType: 'disbursal' | 'settlement';
  userName: string;
  amount: number;
  onValidate: (approved: boolean) => void;
  isLoading?: boolean;
  viewOnly?: boolean; // For viewing your own uploaded proof
}

export function ValidateProofDialog({
  open,
  onOpenChange,
  proofUrl,
  proofType,
  userName,
  amount,
  onValidate,
  isLoading = false,
  viewOnly = false,
}: ValidateProofDialogProps) {
  const [showFullScreen, setShowFullScreen] = useState(false);

  const title = viewOnly
    ? (proofType === 'disbursal' ? '💳 Your Uploaded Payment Proof' : '💰 Your Uploaded Settlement Proof')
    : (proofType === 'disbursal' ? '💳 Payment Proof - Loan Disbursal' : '💰 Payment Proof - Loan Settlement');
  
  const description = viewOnly
    ? `This is the proof you uploaded. Waiting for ${userName} to verify.`
    : (proofType === 'disbursal'
        ? `${userName} has uploaded proof of sending ₹${amount.toLocaleString('en-IN')} to you.`
        : `${userName} has uploaded proof of repaying ₹${amount.toLocaleString('en-IN')} to you.`);

  const handleDownload = () => {
    // Create a link to download the image
    const link = document.createElement('a');
    link.href = proofUrl;
    link.download = `payment-proof-${proofType}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative border rounded-lg overflow-hidden bg-muted/30">
              <img
                src={proofUrl}
                alt="Payment proof"
                className="w-full h-auto max-h-[400px] object-contain cursor-zoom-in"
                onClick={() => setShowFullScreen(true)}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setShowFullScreen(true)}
              >
                <ZoomIn className="h-4 w-4 mr-1" />
                View Full Screen
              </Button>
            </div>

            {/* Instructions */}
            {!viewOnly && (
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                <p className="text-sm font-medium mb-1">Please verify:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Payment amount matches: ₹{amount.toLocaleString('en-IN')}</li>
                  <li>Payment screenshot is clear and readable</li>
                  {proofType === 'disbursal' ? (
                    <li>You have received the money in your account</li>
                  ) : (
                    <li>You have received the repayment in your account</li>
                  )}
                  <li>Transaction details are visible (date, time, reference)</li>
                </ul>
              </div>
            )}

            {/* Download Option */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Proof for Records
            </Button>
          </div>

          {!viewOnly && (
            <DialogFooter className="flex gap-2 sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={() => onValidate(false)}
                disabled={isLoading}
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => onValidate(true)}
                disabled={isLoading}
                className="flex-1 bg-success hover:bg-success/90"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {proofType === 'disbursal' ? 'Confirm & Activate' : 'Confirm & Complete'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Screen Image Viewer */}
      <Dialog open={showFullScreen} onOpenChange={setShowFullScreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
          <div className="relative w-full h-full flex items-center justify-center bg-black/90 rounded-lg">
            <img
              src={proofUrl}
              alt="Payment proof full screen"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setShowFullScreen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

