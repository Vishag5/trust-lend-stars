import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Bell, BellRing } from 'lucide-react';
import { notificationService } from '@/lib/notificationService';

interface InAppNotificationProps {
  userId: string;
}

export function InAppNotification({ userId }: InAppNotificationProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  useEffect(() => {
    // Check if browser notifications are supported and working
    const isNotificationWorking = notificationService.isNotificationSupported() && 
                                 notificationService.getPermissionStatus() === 'granted';

    // If notifications don't work (like iOS Chrome), show in-app notifications
    if (!isNotificationWorking) {
      // Listen for reminder notifications
      const handleReminderNotification = (event: CustomEvent) => {
        if (event.detail.userId === userId) {
          showInAppNotification(event.detail);
        }
      };

      window.addEventListener('reminder-notification', handleReminderNotification as EventListener);
      
      return () => {
        window.removeEventListener('reminder-notification', handleReminderNotification as EventListener);
      };
    }
  }, [userId]);

  const showInAppNotification = (notification: any) => {
    setCurrentNotification(notification);
    setShowNotification(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const dismissNotification = () => {
    setShowNotification(false);
    setCurrentNotification(null);
  };

  if (!showNotification || !currentNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="bg-primary text-white border-primary shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {currentNotification.type === 'reminder' ? (
              <BellRing className="h-5 w-5 text-white" />
            ) : (
              <Bell className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <AlertDescription className="text-white font-medium">
              {currentNotification.title}
            </AlertDescription>
            <p className="text-white/80 text-sm mt-1">
              {currentNotification.message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissNotification}
            className="text-white hover:bg-white/10 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}
