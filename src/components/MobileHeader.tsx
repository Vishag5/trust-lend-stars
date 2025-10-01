import { useAuthStore } from '@/store/authStore';
import { UserSwitcher } from './UserSwitcher';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function MobileHeader() {
  const { currentUser } = useAuthStore();
  const { toast } = useToast();

  const handleInvite = () => {
    if (currentUser) {
      const inviteLink = `${window.location.origin}?ref=${encodeURIComponent(currentUser.phone)}`;
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: 'Invite link copied!',
        description: 'Share this link so they can receive your request on LenTrust.',
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-xl font-bold text-primary">LenTrust</h1>
          {currentUser && (
            <p className="text-xs text-muted-foreground">
              {currentUser.name} • {currentUser.phone}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleInvite}>
            <Share2 className="h-4 w-4" />
          </Button>
          <UserSwitcher />
        </div>
      </div>
    </header>
  );
}
