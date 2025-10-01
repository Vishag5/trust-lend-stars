import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { getDataClient } from '@/lib/dataClient';
import { DEMO_USERS } from '@/lib/seedData';
import { useToast } from '@/hooks/use-toast';
import { User, Check, Menu } from 'lucide-react';

export function UserSwitcher() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuthStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const users = [
    DEMO_USERS.BORROWER_A,
    DEMO_USERS.BORROWER_B,
    DEMO_USERS.LENDER_L1,
  ];

  const handleUserSelect = async (phone: string, name: string) => {
    try {
      const client = getDataClient();
      const user = await client.getUserByPhone(phone);
      
      if (user) {
        setCurrentUser(user);
        setOpen(false);
        toast({
          title: `Switched to ${name}`,
          description: phone,
        });
        // Refresh the current page
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to switch user',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" className="h-10 w-10 rounded-full bg-success hover:bg-success/90">
          <Menu className="h-5 w-5 text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Switch User</SheetTitle>
          <SheetDescription>Select a demo user to switch to</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {users.map((user) => (
            <Button
              key={user.phone}
              variant={currentUser?.phone === user.phone ? 'default' : 'outline'}
              className="w-full justify-between h-auto py-4"
              onClick={() => handleUserSelect(user.phone, user.name)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-xs opacity-80">{user.phone}</div>
                </div>
              </div>
              {currentUser?.phone === user.phone && <Check className="h-5 w-5" />}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
