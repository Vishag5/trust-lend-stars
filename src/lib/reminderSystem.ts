import { Contract, ContractStatus } from './dataClient';

export interface Reminder {
  id: string;
  contractId: string;
  userId: string;
  type: 'payment_due' | 'overdue' | 'weekly_overdue';
  scheduledFor: string; // ISO string
  status: 'pending' | 'sent' | 'cancelled';
  channel: 'in_app' | 'sms' | 'whatsapp';
  message: string;
  createdAt: string;
  sentAt?: string;
  cancelledAt?: string;
}

export interface ReminderRule {
  type: 'payment_due' | 'overdue' | 'weekly_overdue';
  daysBefore: number;
  time: string; // HH:MM format
  message: string;
}

class ReminderSystem {
  private reminders: Reminder[] = [];
  private readonly TIMEZONE = 'Asia/Kolkata';
  
  // Reminder rules based on your specifications
  private readonly REMINDER_RULES: ReminderRule[] = [
    {
      type: 'payment_due',
      daysBefore: 3,
      time: '09:00',
      message: 'Payment reminder: Your loan of ₹{amount} is due in 3 days on {dueDate}. Please prepare for repayment.'
    },
    {
      type: 'payment_due',
      daysBefore: 2,
      time: '13:00',
      message: 'Payment reminder: Your loan of ₹{amount} is due in 2 days on {dueDate}. Please prepare for repayment.'
    },
    {
      type: 'payment_due',
      daysBefore: 1,
      time: '19:00',
      message: 'Payment reminder: Your loan of ₹{amount} is due tomorrow on {dueDate}. Please prepare for repayment.'
    },
    {
      type: 'payment_due',
      daysBefore: 0,
      time: '09:00',
      message: 'Payment due today: Your loan of ₹{amount} is due today on {dueDate}. Please make the payment.'
    }
  ];

  constructor() {
    this.loadReminders();
  }

  private loadReminders() {
    const stored = localStorage.getItem('reminders');
    if (stored) {
      this.reminders = JSON.parse(stored);
    }
  }

  private saveReminders() {
    localStorage.setItem('reminders', JSON.stringify(this.reminders));
  }

  private generateId(): string {
    return `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatMessage(template: string, contract: Contract): string {
    const dueDate = new Date(contract.due_at).toLocaleDateString('en-IN', {
      timeZone: this.TIMEZONE,
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return template
      .replace('{amount}', contract.amount.toLocaleString())
      .replace('{dueDate}', dueDate)
      .replace('{borrowerName}', contract.borrower?.name || 'Borrower')
      .replace('{lenderName}', contract.lender?.name || 'Lender');
  }

  private getDateInTimezone(date: Date): Date {
    return new Date(date.toLocaleString('en-US', { timeZone: this.TIMEZONE }));
  }

  private scheduleReminder(contract: Contract, rule: ReminderRule, channel: 'in_app' | 'sms' | 'whatsapp' = 'in_app'): Reminder {
    const dueDate = new Date(contract.due_at);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(dueDate.getDate() - rule.daysBefore);
    
    // Set the specific time
    const [hours, minutes] = rule.time.split(':').map(Number);
    reminderDate.setHours(hours, minutes, 0, 0);

    const reminder: Reminder = {
      id: this.generateId(),
      contractId: contract.id,
      userId: contract.borrower_id,
      type: rule.type,
      scheduledFor: reminderDate.toISOString(),
      status: 'pending',
      channel,
      message: this.formatMessage(rule.message, contract),
      createdAt: new Date().toISOString()
    };

    this.reminders.push(reminder);
    this.saveReminders();
    return reminder;
  }

  // Schedule all payment due reminders for a contract
  schedulePaymentReminders(contract: Contract): Reminder[] {
    // Cancel any existing reminders for this contract
    this.cancelContractReminders(contract.id);

    const scheduledReminders: Reminder[] = [];

    // Schedule payment due reminders
    for (const rule of this.REMINDER_RULES) {
      if (rule.type === 'payment_due') {
        const reminder = this.scheduleReminder(contract, rule);
        scheduledReminders.push(reminder);
      }
    }

    return scheduledReminders;
  }

  // Schedule overdue reminders (daily for 14 days, then weekly)
  scheduleOverdueReminders(contract: Contract): Reminder[] {
    const scheduledReminders: Reminder[] = [];
    const dueDate = new Date(contract.due_at);
    const now = new Date();

    // Daily reminders for 14 days after due date
    for (let day = 1; day <= 14; day++) {
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(dueDate.getDate() + day);
      reminderDate.setHours(9, 0, 0, 0);

      // Only schedule if the reminder date is in the future
      if (reminderDate > now) {
        const reminder: Reminder = {
          id: this.generateId(),
          contractId: contract.id,
          userId: contract.borrower_id,
          type: 'overdue',
          scheduledFor: reminderDate.toISOString(),
          status: 'pending',
          channel: 'in_app',
          message: this.formatMessage(
            `Overdue payment reminder: Your loan of ₹{amount} was due on {dueDate} and is now ${day} day${day > 1 ? 's' : ''} overdue. Please make the payment immediately.`,
            contract
          ),
          createdAt: new Date().toISOString()
        };

        this.reminders.push(reminder);
        scheduledReminders.push(reminder);
      }
    }

    // Weekly reminders after 14 days
    for (let week = 3; week <= 12; week++) { // Up to 12 weeks
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(dueDate.getDate() + (week * 7));
      reminderDate.setHours(9, 0, 0, 0);

      if (reminderDate > now) {
        const reminder: Reminder = {
          id: this.generateId(),
          contractId: contract.id,
          userId: contract.borrower_id,
          type: 'weekly_overdue',
          scheduledFor: reminderDate.toISOString(),
          status: 'pending',
          channel: 'in_app',
          message: this.formatMessage(
            `Weekly overdue reminder: Your loan of ₹{amount} has been overdue for ${week} week${week > 1 ? 's' : ''}. Please contact your lender to resolve this matter.`,
            contract
          ),
          createdAt: new Date().toISOString()
        };

        this.reminders.push(reminder);
        scheduledReminders.push(reminder);
      }
    }

    this.saveReminders();
    return scheduledReminders;
  }

  // Cancel all reminders for a contract
  cancelContractReminders(contractId: string): void {
    this.reminders = this.reminders.map(reminder => {
      if (reminder.contractId === contractId && reminder.status === 'pending') {
        return {
          ...reminder,
          status: 'cancelled' as const,
          cancelledAt: new Date().toISOString()
        };
      }
      return reminder;
    });
    this.saveReminders();
  }

  // Reschedule reminders after extension approval
  rescheduleAfterExtension(contract: Contract): Reminder[] {
    // Cancel existing reminders
    this.cancelContractReminders(contract.id);
    
    // Schedule new reminders from the new due date
    return this.schedulePaymentReminders(contract);
  }

  // Get pending reminders for a user
  getUserReminders(userId: string): Reminder[] {
    return this.reminders.filter(reminder => 
      reminder.userId === userId && 
      reminder.status === 'pending'
    );
  }

  // Get reminders that are due to be sent
  getDueReminders(): Reminder[] {
    const now = new Date();
    return this.reminders.filter(reminder => {
      if (reminder.status !== 'pending') return false;
      
      const scheduledTime = new Date(reminder.scheduledFor);
      return scheduledTime <= now;
    });
  }

  // Mark reminder as sent
  markReminderSent(reminderId: string): void {
    this.reminders = this.reminders.map(reminder => {
      if (reminder.id === reminderId) {
        return {
          ...reminder,
          status: 'sent' as const,
          sentAt: new Date().toISOString()
        };
      }
      return reminder;
    });
    this.saveReminders();
  }

  // Check if we can send a reminder (rate limiting)
  canSendReminder(contractId: string, channel: string, date: string): boolean {
    const today = new Date(date).toDateString();
    const existingToday = this.reminders.filter(reminder => 
      reminder.contractId === contractId &&
      reminder.channel === channel &&
      reminder.status === 'sent' &&
      reminder.sentAt &&
      new Date(reminder.sentAt).toDateString() === today
    );

    return existingToday.length === 0; // Max 1 per day per channel per contract
  }

  // Get reminder statistics
  getReminderStats(userId: string): {
    total: number;
    pending: number;
    sent: number;
    cancelled: number;
  } {
    const userReminders = this.reminders.filter(reminder => reminder.userId === userId);
    
    return {
      total: userReminders.length,
      pending: userReminders.filter(r => r.status === 'pending').length,
      sent: userReminders.filter(r => r.status === 'sent').length,
      cancelled: userReminders.filter(r => r.status === 'cancelled').length
    };
  }

  // Clean up old reminders (older than 6 months)
  cleanupOldReminders(): void {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    this.reminders = this.reminders.filter(reminder => {
      const reminderDate = new Date(reminder.createdAt);
      return reminderDate > sixMonthsAgo;
    });

    this.saveReminders();
  }
}

// Export singleton instance
export const reminderSystem = new ReminderSystem();
