import { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const inviteLink = useMemo(() => {
    // Use production URL for sharing
    const base = 'https://lentrust.app'; // Production URL
    const code = 'abc123';
    return `${base}/invite/${code}`;
  }, []);

  const share = async (platform: 'whatsapp' | 'sms' | 'facebook' | 'instagram') => {
    const text = `Join me on LenTrust: ${inviteLink}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'LenTrust Invite', text, url: inviteLink });
        return;
      }
    } catch {/* ignore */}

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'sms') {
      window.open(`sms:?&body=${encodeURIComponent(text)}`);
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`, '_blank');
    } else if (platform === 'instagram') {
      await navigator.clipboard.writeText(inviteLink);
      alert('Link copied. Open Instagram and paste it in a DM or story.');
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(inviteLink);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Invite Friends to LenTrust</DialogTitle>
          <DialogDescription>
            Share LenTrust with friends to start building a trusted lending network.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input value={inviteLink} readOnly className="flex-1" />
            <Button onClick={copy}>Copy</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => share('whatsapp')}>WhatsApp</Button>
            <Button variant="outline" onClick={() => share('sms')}>Messages</Button>
            <Button variant="outline" onClick={() => share('instagram')}>Instagram</Button>
            <Button variant="outline" onClick={() => share('facebook')}>Facebook</Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


