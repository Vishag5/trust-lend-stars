import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { useModeManager } from '@/hooks/useModeManager';
import { Share2, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InviteDialog } from '@/components/InviteDialog';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function MobileHeader({ title, showBack = false, rightElement }: MobileHeaderProps) {
  const { currentUser, logout } = useAuthStore();
  const { currentUser: prodCurrentUser, logout: prodLogout } = useProductionAuthStore();
  const { currentMode } = useModeManager();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [inviteOpen, setInviteOpen] = useState(false);
  
  // Use appropriate auth store based on mode
  const isDemoMode = currentMode === 'demo';
  const currentAuthUser = isDemoMode ? currentUser : prodCurrentUser;
  const currentLogout = isDemoMode ? logout : prodLogout;

  const handleInvite = () => {
    setInviteOpen(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    await currentLogout();
    navigate('/');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  const isDashboard = location.pathname === '/dashboard';

  return (
    <header className="sticky top-0 z-40 bg-primary pt-safe">
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
            {isDashboard && currentAuthUser && (
              <p className="text-xs text-white/80">
                {currentAuthUser.name} • {currentAuthUser.phone}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {rightElement && (
            <div className="flex-shrink-0">
              {rightElement}
            </div>
          )}
          {isDashboard && (
            <Button 
              size="sm" 
              className="bg-success hover:bg-success/90 text-white text-xs px-2 py-1"
              onClick={handleInvite}
            >
              <Share2 className="h-3 w-3" />
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-white hover:bg-white/10 p-1"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </header>
  );
}
