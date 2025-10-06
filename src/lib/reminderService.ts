import { reminderSystem } from './reminderSystem';
import { getDataClient } from './dataClient';
import { notificationService } from './notificationService';

class ReminderService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every minute

  start() {
    if (this.intervalId) {
      console.log('Reminder service already running');
      return;
    }

    console.log('Starting reminder service...');
    this.intervalId = setInterval(() => {
      this.processDueReminders();
    }, this.CHECK_INTERVAL);

    // Process immediately on start
    this.processDueReminders();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Reminder service stopped');
    }
  }

  private async processDueReminders() {
    try {
      const dueReminders = reminderSystem.getDueReminders();
      
      if (dueReminders.length === 0) {
        return;
      }

      console.log(`Processing ${dueReminders.length} due reminders...`);

      for (const reminder of dueReminders) {
        await this.sendReminder(reminder);
      }

      // Clean up old reminders periodically
      reminderSystem.cleanupOldReminders();
    } catch (error) {
      console.error('Error processing due reminders:', error);
    }
  }

  private async sendReminder(reminder: any) {
    try {
      // Check rate limiting
      const canSend = reminderSystem.canSendReminder(
        reminder.contractId,
        reminder.channel,
        new Date().toISOString()
      );

      if (!canSend) {
        console.log(`Rate limit reached for contract ${reminder.contractId}, channel ${reminder.channel}`);
        return;
      }

      // Send the reminder based on channel
      switch (reminder.channel) {
        case 'in_app':
          await this.sendInAppReminder(reminder);
          break;
        case 'sms':
          await this.sendSMSReminder(reminder);
          break;
        case 'whatsapp':
          await this.sendWhatsAppReminder(reminder);
          break;
        default:
          console.warn(`Unknown reminder channel: ${reminder.channel}`);
      }

      // Mark as sent
      reminderSystem.markReminderSent(reminder.id);
      console.log(`Reminder sent: ${reminder.id}`);

    } catch (error) {
      console.error(`Failed to send reminder ${reminder.id}:`, error);
    }
  }

  private async sendInAppReminder(reminder: any) {
    // For in-app reminders, we'll store them in localStorage for the UI to display
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    const notification = {
      id: `notif_${reminder.id}`,
      type: 'reminder',
      title: 'Payment Reminder',
      message: reminder.message,
      contractId: reminder.contractId,
      userId: reminder.userId,
      createdAt: new Date().toISOString(),
      read: false
    };

    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Trigger a custom event for the UI to listen to
    window.dispatchEvent(new CustomEvent('reminder-notification', {
      detail: notification
    }));

    // Show browser notification
    await this.showBrowserNotification(reminder);

    console.log('In-app reminder sent:', notification);
  }

  private async showBrowserNotification(reminder: any) {
    try {
      // Parse reminder message to extract relevant info
      const message = reminder.message;
      const contractId = reminder.contractId;
      
      // Try to get contract details for better notification
      const dataClient = getDataClient();
      const contract = dataClient.getContractById(contractId);
      
      if (contract) {
        const borrower = dataClient.getUserById(contract.borrower_id);
        const lender = dataClient.getUserById(contract.lender_id);
        
        // Determine if this is for borrower or lender
        const isForBorrower = reminder.userId === contract.borrower_id;
        const otherUser = isForBorrower ? lender : borrower;
        
        // Show appropriate notification based on reminder type
        if (message.includes('due today')) {
          await notificationService.showPaymentReminder(
            contractId, 
            otherUser?.name || 'User', 
            contract.amount, 
            0
          );
        } else if (message.includes('due in')) {
          const daysMatch = message.match(/due in (\d+)/);
          const daysLeft = daysMatch ? parseInt(daysMatch[1]) : 1;
          await notificationService.showPaymentReminder(
            contractId, 
            otherUser?.name || 'User', 
            contract.amount, 
            daysLeft
          );
        } else if (message.includes('overdue')) {
          const daysMatch = message.match(/(\d+) days overdue/);
          const daysOverdue = daysMatch ? parseInt(daysMatch[1]) : 1;
          await notificationService.showOverdueNotification(
            contractId, 
            otherUser?.name || 'User', 
            contract.amount, 
            daysOverdue
          );
        } else {
          // Generic reminder notification
          await notificationService.showNotification({
            title: 'Payment Reminder',
            body: message,
            tag: `reminder-${contractId}`,
            requireInteraction: message.includes('due today') || message.includes('overdue')
          });
        }
      } else {
        // Fallback to generic notification
        await notificationService.showNotification({
          title: 'Payment Reminder',
          body: message,
          tag: `reminder-${contractId}`
        });
      }
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  private async sendSMSReminder(reminder: any) {
    // In a real app, this would integrate with an SMS service like Twilio
    console.log('SMS reminder would be sent:', {
      to: reminder.userId,
      message: reminder.message
    });
    
    // For demo purposes, we'll just log it
    console.log(`SMS: ${reminder.message}`);
  }

  private async sendWhatsAppReminder(reminder: any) {
    // In a real app, this would integrate with WhatsApp Business API
    console.log('WhatsApp reminder would be sent:', {
      to: reminder.userId,
      message: reminder.message
    });
    
    // For demo purposes, we'll just log it
    console.log(`WhatsApp: ${reminder.message}`);
  }

  // Get notifications for a user
  getUserNotifications(userId: string) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    return notifications.filter((n: any) => n.userId === userId);
  }

  // Mark notification as read
  markNotificationRead(notificationId: string) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = notifications.map((n: any) => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
  }

  // Clear all notifications for a user
  clearUserNotifications(userId: string) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const filtered = notifications.filter((n: any) => n.userId !== userId);
    localStorage.setItem('notifications', JSON.stringify(filtered));
  }
}

// Export singleton instance
export const reminderService = new ReminderService();
