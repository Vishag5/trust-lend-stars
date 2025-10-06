import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Clock, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { Reminder, reminderSystem } from '@/lib/reminderSystem';
import { ReminderNotification } from './ReminderNotification';
import { formatDistanceToNow } from 'date-fns';

interface ReminderManagerProps {
  userId: string;
  onReminderAction?: (action: string, reminderId: string) => void;
}

export function ReminderManager({ userId, onReminderAction }: ReminderManagerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = () => {
    const userReminders = reminderSystem.getUserReminders(userId);
    setReminders(userReminders);
    setLoading(false);
  };

  const handleMarkAsRead = (reminderId: string) => {
    reminderSystem.markReminderSent(reminderId);
    loadReminders();
    onReminderAction?.('marked_read', reminderId);
  };

  const handleDismiss = (reminderId: string) => {
    // For now, we'll just remove from display
    // In a real app, you might want to mark as dismissed in the database
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    onReminderAction?.('dismissed', reminderId);
  };

  const getReminderStats = () => {
    const stats = reminderSystem.getReminderStats(userId);
    return stats;
  };

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const sentReminders = reminders.filter(r => r.status === 'sent');
  const cancelledReminders = reminders.filter(r => r.status === 'cancelled');

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  const stats = getReminderStats();

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Reminder Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <div className="text-xs text-muted-foreground">Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
            <div className="text-xs text-muted-foreground">Cancelled</div>
          </div>
        </div>
      </Card>

      {/* Reminders List */}
      <Card className="p-4">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingReminders.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Sent ({sentReminders.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Cancelled ({cancelledReminders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            {pendingReminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending reminders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReminders.map((reminder) => (
                  <ReminderNotification
                    key={reminder.id}
                    reminder={reminder}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-4">
            {sentReminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sent reminders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentReminders.map((reminder) => (
                  <Card key={reminder.id} className="p-4 bg-green-50/50">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-green-500 text-green-700">
                            Sent
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {reminder.sentAt && formatDistanceToNow(new Date(reminder.sentAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{reminder.message}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-4">
            {cancelledReminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No cancelled reminders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cancelledReminders.map((reminder) => (
                  <Card key={reminder.id} className="p-4 bg-gray-50/50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-gray-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-gray-500 text-gray-700">
                            Cancelled
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {reminder.cancelledAt && formatDistanceToNow(new Date(reminder.cancelledAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-through">{reminder.message}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
