/**
 * Browser Notification Service
 * Handles browser push notifications for LenTrust app
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  private constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Check if notifications are supported
   */
  public isNotificationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if we're on iOS (which has limited notification support)
   */
  public isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * Check if we're on iOS Safari (better notification support than Chrome)
   */
  public isIOSSafari(): boolean {
    return this.isIOS() && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  }

  /**
   * Get current permission status
   */
  public getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  /**
   * Request notification permission from user
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return 'denied';
    }

    // iOS Chrome has limited notification support
    if (this.isIOS() && !this.isIOSSafari()) {
      console.warn('iOS Chrome has limited notification support. Consider using Safari for better experience.');
      this.permission = 'denied';
      return 'denied';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      this.permission = 'denied';
      return 'denied';
    }
  }

  /**
   * Show a browser notification
   */
  public async showNotification(options: NotificationOptions): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported');
      return false;
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/icon-192x192.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        timestamp: options.timestamp || Date.now()
      });

      // Auto-close notification after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  /**
   * Show payment reminder notification
   */
  public async showPaymentReminder(contractId: string, borrowerName: string, amount: number, daysLeft: number): Promise<boolean> {
    const title = daysLeft === 0 ? 'Payment Due Today!' : `Payment Due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
    const body = `${borrowerName} owes you ₹${amount.toLocaleString()}`;

    return this.showNotification({
      title,
      body,
      tag: `payment-reminder-${contractId}`,
      requireInteraction: daysLeft === 0, // Require interaction for due today
      icon: '/icon-192x192.png'
    });
  }

  /**
   * Show loan request notification
   */
  public async showLoanRequest(contractId: string, borrowerName: string, amount: number): Promise<boolean> {
    return this.showNotification({
      title: 'New Loan Request',
      body: `${borrowerName} wants to borrow ₹${amount.toLocaleString()}`,
      tag: `loan-request-${contractId}`,
      requireInteraction: true,
      icon: '/icon-192x192.png'
    });
  }

  /**
   * Show contract status change notification
   */
  public async showContractStatusChange(contractId: string, status: string, amount: number): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      'ACTIVE': 'Loan has been disbursed',
      'DUE': 'Payment is now due',
      'SETTLED': 'Contract has been settled',
      'REJECTED': 'Loan request was rejected'
    };

    const message = statusMessages[status] || 'Contract status updated';

    return this.showNotification({
      title: 'Contract Update',
      body: `${message} - ₹${amount.toLocaleString()}`,
      tag: `contract-${contractId}`,
      requireInteraction: status === 'SETTLED' || status === 'DUE',
      icon: '/icon-192x192.png'
    });
  }

  /**
   * Show extension request notification
   */
  public async showExtensionRequest(contractId: string, borrowerName: string, days: number): Promise<boolean> {
    return this.showNotification({
      title: 'Extension Request',
      body: `${borrowerName} wants to extend payment by ${days} days`,
      tag: `extension-${contractId}`,
      requireInteraction: true,
      icon: '/icon-192x192.png'
    });
  }

  /**
   * Show payment proof notification
   */
  public async showPaymentProof(contractId: string, type: 'disbursal' | 'settlement', amount: number): Promise<boolean> {
    const title = type === 'disbursal' ? 'Payment Proof Uploaded' : 'Settlement Proof Uploaded';
    const body = `Please verify the payment proof for ₹${amount.toLocaleString()}`;

    return this.showNotification({
      title,
      body,
      tag: `proof-${contractId}`,
      requireInteraction: true,
      icon: '/icon-192x192.png'
    });
  }

  /**
   * Show review notification
   */
  public async showReviewNotification(contractId: string, borrowerName: string): Promise<boolean> {
    return this.showNotification({
      title: 'Rate & Review',
      body: `Please rate and review ${borrowerName}`,
      tag: `review-${contractId}`,
      requireInteraction: true,
      icon: '/icon-192x192.png'
    });
  }

  /**
   * Show overdue payment notification
   */
  public async showOverdueNotification(contractId: string, borrowerName: string, amount: number, daysOverdue: number): Promise<boolean> {
    return this.showNotification({
      title: 'Payment Overdue!',
      body: `${borrowerName} is ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue - ₹${amount.toLocaleString()}`,
      tag: `overdue-${contractId}`,
      requireInteraction: true,
      icon: '/icon-192x192.png'
    });
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
