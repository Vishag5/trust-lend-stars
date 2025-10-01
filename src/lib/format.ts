// Formatting utilities for Indian context

export function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatPhone(phone: string, mask: boolean = false): string {
  if (mask) {
    // Show only last 4 digits: +91 XXXXX 1234
    return phone.replace(/(\+91\s?)(\d{5})(\d{4})/, '$1XXXXX $3');
  }
  // Format as +91 90000 11111
  return phone.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 $3');
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function getTimeUntilDue(dueAt: string): string {
  const now = new Date();
  const due = new Date(dueAt);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else {
    return `${diffDays} days left`;
  }
}
