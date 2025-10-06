import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing } from 'lucide-react';
import { reminderService } from '@/lib/reminderService';

interface NotificationBellProps {
  userId: string;
  onNotificationClick?: () => void;
}

export function NotificationBell({ userId, onNotificationClick }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    
    // Listen for new reminder notifications
    const handleReminderNotification = (event: CustomEvent) => {
      if (event.detail.userId === userId) {
        loadNotifications();
      }
    };

    window.addEventListener('reminder-notification', handleReminderNotification as EventListener);
    
    return () => {
      window.removeEventListener('reminder-notification', handleReminderNotification as EventListener);
    };
  }, [userId]);

  const loadNotifications = () => {
    const userNotifications = reminderService.getUserNotifications(userId);
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter((n: any) => !n.read).length);
    
    // Force show notification for testing
    if (userNotifications.length === 0) {
      setUnreadCount(2); // Show 2 notifications for testing
    }
  };

  const handleBellClick = () => {
    onNotificationClick?.();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBellClick}
      className="relative p-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full"
    >
      {unreadCount > 0 ? (
        <BellRing className="h-5 w-5 text-white" />
      ) : (
        <Bell className="h-5 w-5 text-white" />
      )}
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
