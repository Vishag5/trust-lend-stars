import { useAuthStore } from '@/store/authStore';
import { UserSwitcher } from './UserSwitcher';
import { Share2, ArrowLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
}

export function MobileHeader({ title, showBack = false }: MobileHeaderProps) {
  const { currentUser } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleBack = () => {
    navigate(-1);
  };

  const isDashboard = location.pathname === '/dashboard';

  return (
    <header className="sticky top-0 z-40 bg-primary">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {showBack ? (
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : null}
          <div>
            <h1 className="text-xl font-bold text-white">
              {title || (isDashboard ? 'LenTrust 🧡' : 'LenTrust')}
            </h1>
            {isDashboard && currentUser && (
              <p className="text-xs text-white/80">
                {currentUser.name} • {currentUser.phone}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDashboard && (
            <Button 
              size="sm" 
              className="bg-success hover:bg-success/90 text-white"
              onClick={handleInvite}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Invite Friends
            </Button>
          )}
          <UserSwitcher />
        </div>
      </div>
    </header>
  );
}
