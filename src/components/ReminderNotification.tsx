import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Reminder } from '@/lib/reminderSystem';
import { formatDistanceToNow } from 'date-fns';

interface ReminderNotificationProps {
  reminder: Reminder;
  onMarkAsRead: (reminderId: string) => void;
  onDismiss: (reminderId: string) => void;
}

export function ReminderNotification({ 
  reminder, 
  onMarkAsRead, 
  onDismiss 
}: ReminderNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  const getReminderIcon = () => {
    switch (reminder.type) {
      case 'payment_due':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'weekly_overdue':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getReminderBadge = () => {
    switch (reminder.type) {
      case 'payment_due':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Payment Due</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'weekly_overdue':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Weekly Overdue</Badge>;
      default:
        return <Badge variant="outline">Reminder</Badge>;
    }
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(reminder.id);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    onDismiss(reminder.id);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Card className="p-4 mb-3 border-l-4 border-l-blue-500 bg-blue-50/50">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getReminderIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getReminderBadge()}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reminder.scheduledFor), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-800 mb-2">{reminder.message}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Channel: {reminder.channel}</span>
              <span>•</span>
              <span>Contract ID: {reminder.contractId.slice(-8)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMarkAsRead}
            className="h-8 w-8 p-0"
            title="Mark as read"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
            title="Dismiss"
          >
            <XCircle className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
