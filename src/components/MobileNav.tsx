import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-around px-2 py-3">
        <Button
          variant={isActive('/dashboard') ? 'default' : 'ghost'}
          size="sm"
          className="flex-col h-auto py-2 gap-1"
          onClick={() => navigate('/dashboard')}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Dashboard</span>
        </Button>

        <Button
          variant={isActive('/create-contract') ? 'default' : 'ghost'}
          size="sm"
          className="flex-col h-auto py-2 gap-1"
          onClick={() => navigate('/create-contract')}
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs">Create</span>
        </Button>

        <Button
          variant={isActive('/contracts') ? 'default' : 'ghost'}
          size="sm"
          className="flex-col h-auto py-2 gap-1"
          onClick={() => navigate('/contracts')}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs">Contracts</span>
        </Button>

        <Button
          variant={isActive('/profile') ? 'default' : 'ghost'}
          size="sm"
          className="flex-col h-auto py-2 gap-1"
          onClick={() => navigate('/profile')}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Profile</span>
        </Button>
      </div>
    </nav>
  );
}
