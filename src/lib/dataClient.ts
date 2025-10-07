import { User, Contract, Extension, Review, Reminder } from './types.js';
import { reminderSystem } from './reminderSystem';
import { notificationService } from './notificationService';
import { rateLimit, RATE_LIMITS } from './rateLimiter';
import { supabase } from '@/integrations/supabase/client';

export type ContractStatus = 'REQUESTED' | 'PENDING_DISBURSAL' | 'ACTIVE' | 'DUE' | 'PENDING_SETTLEMENT' | 'SETTLED' | 'REJECTED';

// UUID generator that works in all contexts (HTTP and HTTPS)
function generateUUID(): string {
  // Try to use crypto.randomUUID if available (HTTPS/localhost)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for non-secure contexts (HTTP over network)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface Contract {
  id: string;
  borrower_id: string;
  lender_id: string;
  amount: number;
  due_at: string;
  reason: string | null;
  attachment_url?: string | null;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
  borrower?: User;
  lender?: User;
  disbursal_proof_url?: string | null;
  repayment_proof_url?: string | null;
  settlement_pending?: boolean;
  extensions_count?: number;
  extension_pending?: boolean;
}


export interface Review {
  id: string;
  contract_id: string;
  reviewer_id: string;
  reviewee_id: string;
  stars: number;
  text: string | null;
  created_at: string;
  resolved: boolean;
}

export interface Reminder {
  id: string;
  contract_id: string;
  type: 'DUE' | 'OVERDUE';
  sent_at: string;
  created_at: string;
}

export class MockDataClient {
  private getStore<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setStore<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private ensureDemoData(): void {
    let users = this.getStore<User>('users');
    
    // Always ensure admin user exists
    const adminUser = users.find(u => u.phone === '+917012938275');
    if (!adminUser) {
      const newAdminUser: User = {
        id: 'admin-user',
        name: 'Admin User',
        phone: '+917012938275',
        email: 'info.vishag@gmail.com',
        trust_reliability_cached: 0,
        created_at: new Date().toISOString(),
      };
      users.push(newAdminUser);
      this.setStore('users', users);
      users = this.getStore<User>('users');
    }
    
    // Ensure other demo users exist if the store was initially empty or if they are missing
    const demoUsersToAdd: User[] = [
      { id: 'borrower-a', name: 'Borrower A', phone: '+919000011111', trust_reliability_cached: 90, created_at: new Date().toISOString() },
      { id: 'borrower-b', name: 'Borrower B', phone: '+919000033333', trust_reliability_cached: 67, created_at: new Date().toISOString() },
      { id: 'lender-l1', name: 'Lender L1', phone: '+919000022222', trust_reliability_cached: 0, created_at: new Date().toISOString() }
    ];

    let usersModified = false;
    demoUsersToAdd.forEach(demoUser => {
      if (!users.some(u => u.id === demoUser.id)) {
        users.push(demoUser);
        usersModified = true;
      }
    });

    if (usersModified) {
      this.setStore('users', users);
    }
  }

  async getUsers(): Promise<User[]> {
    this.ensureDemoData();
    return this.getStore<User>('users');
  }

  async getUserById(id: string): Promise<User | null> {
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    const user = users.find(u => u.id === id);
    return user || null;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    const user = users.find(u => u.phone === phone);
    return user || null;
  }

  async createUser(data: { name: string; phone: string; email?: string }): Promise<User> {
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    
    // Check if user already exists
    const existingUser = users.find(u => u.phone === data.phone);
    if (existingUser) {
      return existingUser;
    }

    const user: User = {
      id: generateUUID(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      trust_reliability_cached: 0,
      created_at: new Date().toISOString(),
    };

    users.push(user);
    this.setStore('users', users);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...data, updated_at: new Date().toISOString() };
    this.setStore('users', users);
    return users[index];
  }

  async updateUserReliability(id: string, score: number): Promise<User | null> {
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) return null;
    
    users[index].trust_reliability_cached = score;
    this.setStore('users', users);
    return users[index];
  }

  async getContractsForUser(userId: string): Promise<Contract[]> {
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const userContracts = contracts.filter(c => c.borrower_id === userId || c.lender_id === userId);
    
    // Add user details to contracts
    const users = this.getStore<User>('users');
    const userContractsWithDetails = userContracts.map(contract => ({
      ...contract,
      borrower: users.find(u => u.id === contract.borrower_id),
      lender: users.find(u => u.id === contract.lender_id),
    }));
    
    return userContractsWithDetails;
  }

  async getContractById(id: string): Promise<Contract | null> {
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const contract = contracts.find(c => c.id === id);
    
    if (!contract) return null;
    
    // Add user details
    const users = this.getStore<User>('users');
    const fullContract = {
      ...contract,
      borrower: users.find(u => u.id === contract.borrower_id),
      lender: users.find(u => u.id === contract.lender_id),
    };
    
    return fullContract;
  }

  async createContract(data: {
    borrower_id: string;
    lender_id: string;
    amount: number;
    due_at: string;
    reason?: string;
    attachment_url?: string;
  }): Promise<Contract> {
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    
    const contract: Contract = {
      id: generateUUID(),
      borrower_id: data.borrower_id,
      lender_id: data.lender_id,
      amount: data.amount,
      due_at: data.due_at,
      reason: data.reason || null,
      attachment_url: data.attachment_url || null,
      status: 'REQUESTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    contracts.push(contract);
    this.setStore('contracts', contracts);
    
    // Schedule payment reminders
    if (contract.status === 'ACTIVE') {
      reminderSystem.schedulePaymentReminder(contract.id, new Date(contract.due_at));
    }
    
    return contract;
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract | null> {
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const index = contracts.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    const oldStatus = contracts[index].status;
    contracts[index] = { ...contracts[index], ...data, updated_at: new Date().toISOString() };
    this.setStore('contracts', contracts);
    
    // Handle status changes
    if (oldStatus !== contracts[index].status) {
      if (contracts[index].status === 'ACTIVE') {
        reminderSystem.schedulePaymentReminder(contracts[index].id, new Date(contracts[index].due_at));
      } else if (contracts[index].status === 'DUE') {
        reminderSystem.scheduleOverdueReminder(contracts[index].id);
      } else if (contracts[index].status === 'SETTLED') {
        reminderSystem.cancelAllReminders(contracts[index].id);
      } else if (contracts[index].status === 'REJECTED') {
        reminderSystem.cancelAllReminders(contracts[index].id);
      }
    }
    
    // Update borrower reliability if contract is settled
    if (contracts[index].status === 'SETTLED') {
      await this.updateBorrowerReliability(contracts[index].borrower_id, contracts[index].amount);
    }
    
    return contracts[index];
  }

  async getExtensionsForContract(contractId: string): Promise<Extension[]> {
    this.ensureDemoData();
    const extensions = this.getStore<Extension>('extensions');
    const contractExtensions = extensions.filter(e => e.contract_id === contractId);
    return contractExtensions;
  }

  async createExtension(data: {
    contract_id: string;
    new_due_at: string;
    reason?: string;
  }): Promise<Extension> {
    this.ensureDemoData();
    const extensions = this.getStore<Extension>('extensions');
    
    const extension: Extension = {
      id: generateUUID(),
      contract_id: data.contract_id,
      new_due_at: data.new_due_at,
      reason: data.reason || null,
      approved: null,
      decided_at: null,
      created_at: new Date().toISOString(),
    };

    extensions.push(extension);
    this.setStore('extensions', extensions);
    return extension;
  }

  async approveExtension(id: string): Promise<Extension | null> {
    this.ensureDemoData();
    const extensions = this.getStore<Extension>('extensions');
    const index = extensions.findIndex(e => e.id === id);
    
    if (index === -1) return null;
    
    extensions[index].approved = true;
    extensions[index].status = 'APPROVED';
    extensions[index].decided_at = new Date().toISOString();
    this.setStore('extensions', extensions);
    
    // Update the contract's due date
    const contract = await this.getContractById(extensions[index].contract_id);
    if (contract) {
      await this.updateContract(contract.id, { due_at: extensions[index].new_due_at });
      
      // Reschedule reminders for the new due date
      if (contract.status === 'ACTIVE') {
        reminderSystem.schedulePaymentReminder(contract.id, new Date(extensions[index].new_due_at));
      }
    }
    
    return extensions[index];
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    this.ensureDemoData();
    const reviews = this.getStore<Review>('reviews');
    const userReviews = reviews.filter(r => r.reviewer_id === userId || r.reviewee_id === userId);
    return userReviews;
  }

  async createReview(data: {
    reviewer_id: string;
    reviewed_user_id: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    this.ensureDemoData();
    const reviews = this.getStore<Review>('reviews');
    
    const review: Review = {
      id: generateUUID(),
      reviewer_id: data.reviewer_id,
      reviewed_user_id: data.reviewed_user_id,
      rating: data.rating,
      comment: data.comment,
      created_at: new Date().toISOString(),
      resolved: false,
    };

    reviews.push(review);
    this.setStore('reviews', reviews);
    
    // Update borrower reliability based on review
    await this.updateBorrowerReliability(data.reviewed_user_id, 0);
    
    return review;
  }

  async updateBorrowerReliability(borrowerId: string, amount: number): Promise<void> {
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    const userIndex = users.findIndex(u => u.id === borrowerId);
    
    if (userIndex === -1) return;
    
    // Get all reviews for this borrower
    const reviews = this.getStore<Review>('reviews');
    const borrowerReviews = reviews.filter(r => r.reviewee_id === borrowerId && r.resolved);
    
    // Get all contracts for this borrower
    const contracts = this.getStore<Contract>('contracts');
    const borrowerContracts = contracts.filter(c => c.borrower_id === borrowerId);
    
    // Calculate reliability score
    let totalScore = 0;
    let reviewCount = 0;
    
    borrowerReviews.forEach(review => {
      totalScore += review.stars;
      reviewCount++;
    });
    
    // Add points for settled contracts
    const settledContracts = borrowerContracts.filter(c => c.status === 'SETTLED');
    totalScore += settledContracts.length * 10; // 10 points per settled contract
    reviewCount += settledContracts.length;
    
    // Add points for amount borrowed (higher amounts = higher trust)
    const totalBorrowed = borrowerContracts.reduce((sum, c) => sum + c.amount, 0);
    totalScore += Math.min(totalBorrowed / 1000, 50); // Max 50 points for amount
    reviewCount += 1;
    
    const averageScore = reviewCount > 0 ? totalScore / reviewCount : 0;
    const reliabilityScore = Math.min(Math.max(averageScore, 0), 100);
    
    users[userIndex].trust_reliability_cached = Math.round(reliabilityScore);
    this.setStore('users', users);
  }

  async markReviewResolved(id: string): Promise<Review | null> {
    this.ensureDemoData();
    const reviews = this.getStore<Review>('reviews');
    const index = reviews.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    reviews[index].resolved = true;
    this.setStore('reviews', reviews);
    return reviews[index];
  }

  async getRemindersForContract(contractId: string): Promise<Reminder[]> {
    this.ensureDemoData();
    const reminders = this.getStore<Reminder>('reminders');
    const contractReminders = reminders.filter(r => r.contract_id === contractId);
    return contractReminders;
  }

  async createReminder(data: {
    contract_id: string;
    type: 'DUE' | 'OVERDUE';
  }): Promise<Reminder> {
    this.ensureDemoData();
    const reminders = this.getStore<Reminder>('reminders');
    
    const reminder: Reminder = {
      id: generateUUID(),
      contract_id: data.contract_id,
      type: data.type,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    reminders.push(reminder);
    this.setStore('reminders', reminders);
    return reminder;
  }

  // ===== SETTLEMENT & PAYMENT PROOF SYSTEM =====
  async settleContract(contractId: string, proofUrl: string): Promise<Contract | null> {
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const index = contracts.findIndex(c => c.id === contractId);
    
    if (index === -1) return null;
    
    contracts[index] = {
      ...contracts[index],
      status: 'PENDING_SETTLEMENT',
      repayment_proof_url: proofUrl,
      settlement_pending: true,
      updated_at: new Date().toISOString()
    };
    
    this.setStore('contracts', contracts);
    return contracts[index];
  }

  async approveSettlement(contractId: string): Promise<Contract | null> {
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const index = contracts.findIndex(c => c.id === contractId);
    
    if (index === -1) return null;
    
    contracts[index] = {
      ...contracts[index],
      status: 'SETTLED',
      settlement_pending: false,
      updated_at: new Date().toISOString()
    };
    
    // Update borrower reliability
    await this.updateBorrowerReliability(contracts[index].borrower_id, contracts[index].amount);
    
    this.setStore('contracts', contracts);
    return contracts[index];
  }

  async rejectSettlement(contractId: string): Promise<Contract | null> {
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const index = contracts.findIndex(c => c.id === contractId);
    
    if (index === -1) return null;
    
    contracts[index] = {
      ...contracts[index],
      status: 'ACTIVE',
      settlement_pending: false,
      repayment_proof_url: null,
      updated_at: new Date().toISOString()
    };
    
    this.setStore('contracts', contracts);
    return contracts[index];
  }

  async getPaymentProofs(contractId: string): Promise<string[]> {
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const contract = contracts.find(c => c.id === contractId);
    
    if (!contract || !contract.repayment_proof_url) return [];
    return [contract.repayment_proof_url];
  }

  // ===== EXTENSION MANAGEMENT =====
  async rejectExtension(id: string): Promise<Extension | null> {
    this.ensureDemoData();
    const extensions = this.getStore<Extension>('extensions');
    const index = extensions.findIndex(e => e.id === id);
    
    if (index === -1) return null;
    
    extensions[index] = {
      ...extensions[index],
      status: 'REJECTED',
      updated_at: new Date().toISOString()
    };
    
    this.setStore('extensions', extensions);
    return extensions[index];
  }

  async getExtensionsForUser(userId: string): Promise<Extension[]> {
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const userContracts = contracts.filter(c => 
      c.borrower_id === userId || c.lender_id === userId
    );
    
    const contractIds = userContracts.map(c => c.id);
    const extensions = this.getStore<Extension>('extensions');
    
    return extensions.filter(e => contractIds.includes(e.contract_id));
  }

  // ===== REVIEW SYSTEM =====
  async updateReview(id: string, data: Partial<Review>): Promise<Review | null> {
    this.ensureDemoData();
    const reviews = this.getStore<Review>('reviews');
    const index = reviews.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    reviews[index] = { ...reviews[index], ...data, updated_at: new Date().toISOString() };
    this.setStore('reviews', reviews);
    return reviews[index];
  }

  async deleteReview(id: string): Promise<boolean> {
    this.ensureDemoData();
    const reviews = this.getStore<Review>('reviews');
    const index = reviews.findIndex(r => r.id === id);
    
    if (index === -1) return false;
    
    reviews.splice(index, 1);
    this.setStore('reviews', reviews);
    return true;
  }

  // ===== RELIABILITY SYSTEM =====
  async updateBorrowerReliability(userId: string, amount: number): Promise<User | null> {
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return null;
    
    const currentReliability = users[index].trust_reliability_cached || 0;
    const amountBonus = Math.min(amount / 1000, 10);
    const newReliability = Math.min(currentReliability + amountBonus + 5, 100);
    
    users[index] = {
      ...users[index],
      trust_reliability_cached: newReliability,
      updated_at: new Date().toISOString()
    };
    
    this.setStore('users', users);
    return users[index];
  }

  async calculateReliabilityScore(userId: string): Promise<number> {
    this.ensureDemoData();
    const reviews = this.getStore<Review>('reviews');
    const userReviews = reviews.filter(r => r.reviewed_user_id === userId);
    
    if (userReviews.length === 0) return 0;
    
    const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / userReviews.length;
    
    return Math.min(averageRating * 20, 100);
  }

  async getReliabilityHistory(userId: string): Promise<{ date: string; score: number }[]> {
    this.ensureDemoData();
    const reviews = this.getStore<Review>('reviews');
    const userReviews = reviews
      .filter(r => r.reviewed_user_id === userId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    let runningSum = 0;
    return userReviews.map((review, index) => {
      runningSum += review.rating;
      const average = runningSum / (index + 1);
      return {
        date: review.created_at,
        score: average * 20
      };
    });
  }

  // ===== SEARCH & DISCOVERY =====
  async searchUsers(query: string): Promise<User[]> {
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    
    return users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.phone.includes(query)
    );
  }

  async getUserSuggestions(userId: string, limit: number = 10): Promise<User[]> {
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    
    return users
      .filter(u => u.id !== userId)
      .sort((a, b) => (b.trust_reliability_cached || 0) - (a.trust_reliability_cached || 0))
      .slice(0, limit);
  }

  async getUserStats(userId: string): Promise<{
    totalContracts: number;
    successfulSettlements: number;
    averageRating: number;
    totalLent: number;
    totalBorrowed: number;
  }> {
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const reviews = this.getStore<Review>('reviews');
    
    const userContracts = contracts.filter(c => 
      c.borrower_id === userId || c.lender_id === userId
    );
    
    const totalContracts = userContracts.length;
    const successfulSettlements = userContracts.filter(c => c.status === 'SETTLED').length;
    
    const totalLent = userContracts
      .filter(c => c.lender_id === userId)
      .reduce((sum, c) => sum + c.amount, 0);
    
    const totalBorrowed = userContracts
      .filter(c => c.borrower_id === userId)
      .reduce((sum, c) => sum + c.amount, 0);
    
    const userReviews = reviews.filter(r => r.reviewed_user_id === userId);
    const averageRating = userReviews.length > 0 
      ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
      : 0;
    
    return {
      totalContracts,
      successfulSettlements,
      averageRating,
      totalLent,
      totalBorrowed
    };
  }

  // ===== NOTIFICATION SYSTEM =====
  async sendNotification(data: {
    user_id: string;
    title: string;
    message: string;
    type: string;
    contract_id?: string;
  }): Promise<boolean> {
    this.ensureDemoData();
    const notifications = this.getStore<any>('notifications');
    
    const notification = {
      id: generateUUID(),
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      contract_id: data.contract_id || null,
      read: false,
      created_at: new Date().toISOString()
    };
    
    notifications.push(notification);
    this.setStore('notifications', notifications);
    return true;
  }

  async getNotifications(userId: string): Promise<any[]> {
    this.ensureDemoData();
    const notifications = this.getStore<any>('notifications');
    
    return notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    this.ensureDemoData();
    const notifications = this.getStore<any>('notifications');
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index === -1) return false;
    
    notifications[index] = {
      ...notifications[index],
      read: true,
      updated_at: new Date().toISOString()
    };
    
    this.setStore('notifications', notifications);
    return true;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    this.ensureDemoData();
    const notifications = this.getStore<any>('notifications');
    
    notifications.forEach(notification => {
      if (notification.user_id === userId && !notification.read) {
        notification.read = true;
        notification.updated_at = new Date().toISOString();
      }
    });
    
    this.setStore('notifications', notifications);
    return true;
  }
}

// Production data client that uses Supabase
class ProductionDataClient {
  async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();
      
      if (error) return null;
      return data as User;
    } catch (error) {
      return null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) return null;
      return data as User;
    } catch (error) {
      return null;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) return [];
      return data as User[];
    } catch (error) {
      return [];
    }
  }

  async createUser(data: { name: string; phone: string; email?: string }): Promise<User> {
    const user: User = {
      id: generateUUID(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      trust_reliability_cached: 0,
      created_at: new Date().toISOString(),
    };

    const { data: createdUser, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return createdUser as User;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return updatedUser as User;
  }

  async getContractsForUser(userId: string): Promise<Contract[]> {
    try {
      // Step 1: Get contracts for the user
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      if (contractsError || !contracts) return [];
      
      // Step 2: Get all unique user IDs from contracts
      const userIds = new Set<string>();
      contracts.forEach(contract => {
        userIds.add(contract.borrower_id);
        userIds.add(contract.lender_id);
      });
      
      // Step 3: Fetch all users in one query
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', Array.from(userIds));
      
      if (usersError || !users) return [];
      
      // Step 4: Map users to contracts (same as demo mode)
      const userContractsWithDetails = contracts.map(contract => ({
        ...contract,
        borrower: users.find(u => u.id === contract.borrower_id),
        lender: users.find(u => u.id === contract.lender_id),
      }));
      
      return userContractsWithDetails as Contract[];
    } catch (error) {
      console.error('Error in getContractsForUser:', error);
      return [];
    }
  }

  async getContractById(id: string): Promise<Contract | null> {
    try {
      // Step 1: Get the contract
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (contractError || !contract) return null;
      
      // Step 2: Get borrower and lender users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', [contract.borrower_id, contract.lender_id]);
      
      if (usersError || !users) return null;
      
      // Step 3: Map users to contract (same as demo mode)
      const contractWithUsers = {
        ...contract,
        borrower: users.find(u => u.id === contract.borrower_id),
        lender: users.find(u => u.id === contract.lender_id),
      };
      
      return contractWithUsers as Contract;
    } catch (error) {
      console.error('Error in getContractById:', error);
      return null;
    }
  }

  async createContract(data: {
    borrower_id: string;
    lender_id: string;
    amount: number;
    due_at: string;
    reason?: string;
    attachment_url?: string;
  }): Promise<Contract> {
    const contract: Contract = {
      id: generateUUID(),
      borrower_id: data.borrower_id,
      lender_id: data.lender_id,
      amount: data.amount,
      due_at: data.due_at,
      reason: data.reason || null,
      attachment_url: data.attachment_url || null,
      status: 'REQUESTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Retry mechanism for network issues
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        const { data: createdContract, error } = await supabase
          .from('contracts')
          .insert(contract)
          .select()
          .single();

        if (error) {
          throw error;
        }
        
        return createdContract as Contract;
      } catch (error) {
        lastError = error;
        retries--;
        
        if (retries > 0 && error.message?.includes('Failed to fetch')) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract | null> {
    const { data: updatedContract, error } = await supabase
      .from('contracts')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return updatedContract as Contract;
  }

  async getExtensionsForContract(contractId: string): Promise<Extension[]> {
    try {
      const { data, error } = await supabase
        .from('extensions')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });
      
      if (error) return [];
      return data as Extension[];
    } catch (error) {
      return [];
    }
  }

  async createExtension(data: {
    contract_id: string;
    new_due_at: string;
    reason?: string;
  }): Promise<Extension> {
    const extension: Extension = {
      id: generateUUID(),
      contract_id: data.contract_id,
      new_due_at: data.new_due_at,
      reason: data.reason || null,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    const { data: createdExtension, error } = await supabase
      .from('extensions')
      .insert(extension)
      .select()
      .single();

    if (error) throw error;
    return createdExtension as Extension;
  }

  async approveExtension(id: string): Promise<Extension | null> {
    const { data: updatedExtension, error } = await supabase
      .from('extensions')
      .update({ status: 'APPROVED', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return updatedExtension as Extension;
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) return [];
      return data as Review[];
    } catch (error) {
      return [];
    }
  }

  async createReview(data: {
    reviewer_id: string;
    reviewed_user_id: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const review: Review = {
      id: generateUUID(),
      reviewer_id: data.reviewer_id,
      reviewed_user_id: data.reviewed_user_id,
      rating: data.rating,
      comment: data.comment,
      created_at: new Date().toISOString(),
    };

    const { data: createdReview, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return createdReview as Review;
  }

  async updateUserReliability(userId: string, reliability: number): Promise<User | null> {
    return this.updateUser(userId, { trust_reliability_cached: reliability });
  }

  async markReviewResolved(id: string): Promise<Review | null> {
    const { data: updatedReview, error } = await supabase
      .from('reviews')
      .update({ resolved: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return updatedReview as Review;
  }

  async getRemindersForContract(contractId: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });
      
      if (error) return [];
      return data as Reminder[];
    } catch (error) {
      return [];
    }
  }

  async createReminder(data: {
    contract_id: string;
    type: string;
    message: string;
    scheduled_for: string;
  }): Promise<Reminder> {
    const reminder: Reminder = {
      id: generateUUID(),
      contract_id: data.contract_id,
      type: data.type,
      message: data.message,
      scheduled_for: data.scheduled_for,
      created_at: new Date().toISOString(),
    };

    const { data: createdReminder, error } = await supabase
      .from('reminders')
      .insert(reminder)
      .select()
      .single();

    if (error) throw error;
    return createdReminder as Reminder;
  }

  // ===== SETTLEMENT & PAYMENT PROOF SYSTEM =====
  async settleContract(contractId: string, proofUrl: string): Promise<Contract | null> {
    try {
      // Update contract with settlement info
      const { data: updatedContract, error } = await supabase
        .from('contracts')
        .update({
          status: 'PENDING_SETTLEMENT',
          repayment_proof_url: proofUrl,
          settlement_pending: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .select()
        .single();

      if (error) throw error;
      return updatedContract as Contract;
    } catch (error) {
      console.error('Error settling contract:', error);
      return null;
    }
  }

  async approveSettlement(contractId: string): Promise<Contract | null> {
    try {
      const { data: updatedContract, error } = await supabase
        .from('contracts')
        .update({
          status: 'SETTLED',
          settlement_pending: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .select()
        .single();

      if (error) throw error;
      
      // Update borrower reliability after successful settlement
      const contract = await this.getContractById(contractId);
      if (contract) {
        await this.updateBorrowerReliability(contract.borrower_id, contract.amount);
      }
      
      return updatedContract as Contract;
    } catch (error) {
      console.error('Error approving settlement:', error);
      return null;
    }
  }

  async rejectSettlement(contractId: string): Promise<Contract | null> {
    try {
      const { data: updatedContract, error } = await supabase
        .from('contracts')
        .update({
          status: 'ACTIVE',
          settlement_pending: false,
          repayment_proof_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .select()
        .single();

      if (error) throw error;
      return updatedContract as Contract;
    } catch (error) {
      console.error('Error rejecting settlement:', error);
      return null;
    }
  }

  async getPaymentProofs(contractId: string): Promise<string[]> {
    try {
      const { data: contract, error } = await supabase
        .from('contracts')
        .select('repayment_proof_url')
        .eq('id', contractId)
        .single();

      if (error || !contract) return [];
      
      return contract.repayment_proof_url ? [contract.repayment_proof_url] : [];
    } catch (error) {
      console.error('Error getting payment proofs:', error);
      return [];
    }
  }

  // ===== EXTENSION MANAGEMENT =====
  async rejectExtension(id: string): Promise<Extension | null> {
    try {
      const { data: updatedExtension, error } = await supabase
        .from('extensions')
        .update({ 
          status: 'REJECTED', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return null;
      return updatedExtension as Extension;
    } catch (error) {
      console.error('Error rejecting extension:', error);
      return null;
    }
  }

  async getExtensionsForUser(userId: string): Promise<Extension[]> {
    try {
      // Get contracts where user is borrower or lender
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('id')
        .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`);

      if (contractsError || !contracts) return [];

      const contractIds = contracts.map(c => c.id);
      
      const { data: extensions, error } = await supabase
        .from('extensions')
        .select('*')
        .in('contract_id', contractIds)
        .order('created_at', { ascending: false });

      if (error) return [];
      return extensions as Extension[];
    } catch (error) {
      console.error('Error getting extensions for user:', error);
      return [];
    }
  }

  // ===== REVIEW SYSTEM =====
  async updateReview(id: string, data: Partial<Review>): Promise<Review | null> {
    try {
      const { data: updatedReview, error } = await supabase
        .from('reviews')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return null;
      return updatedReview as Review;
    } catch (error) {
      console.error('Error updating review:', error);
      return null;
    }
  }

  async deleteReview(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  // ===== RELIABILITY SYSTEM =====
  async updateBorrowerReliability(userId: string, amount: number): Promise<User | null> {
    try {
      // Get current reliability
      const user = await this.getUserById(userId);
      if (!user) return null;

      // Calculate new reliability based on successful payment
      const currentReliability = user.trust_reliability_cached || 0;
      const amountBonus = Math.min(amount / 1000, 10); // Max 10 points for amount
      const newReliability = Math.min(currentReliability + amountBonus + 5, 100); // Max 100

      return await this.updateUserReliability(userId, newReliability);
    } catch (error) {
      console.error('Error updating borrower reliability:', error);
      return null;
    }
  }

  async calculateReliabilityScore(userId: string): Promise<number> {
    try {
      // Get all reviews for user
      const reviews = await this.getReviewsForUser(userId);
      if (reviews.length === 0) return 0;

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Get successful settlements
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('amount')
        .eq('borrower_id', userId)
        .eq('status', 'SETTLED');

      if (error) return averageRating * 20; // Convert 1-5 rating to 0-100

      const totalSettled = contracts.reduce((sum, contract) => sum + contract.amount, 0);
      const settlementBonus = Math.min(totalSettled / 10000, 20); // Max 20 points for settlements

      return Math.min(averageRating * 20 + settlementBonus, 100);
    } catch (error) {
      console.error('Error calculating reliability score:', error);
      return 0;
    }
  }

  async getReliabilityHistory(userId: string): Promise<{ date: string; score: number }[]> {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating, created_at')
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: true });

      if (error || !reviews) return [];

      // Calculate running average
      let runningSum = 0;
      return reviews.map((review, index) => {
        runningSum += review.rating;
        const average = runningSum / (index + 1);
        return {
          date: review.created_at,
          score: average * 20 // Convert to 0-100 scale
        };
      });
    } catch (error) {
      console.error('Error getting reliability history:', error);
      return [];
    }
  }

  // ===== SEARCH & DISCOVERY =====
  async searchUsers(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(20);

      if (error) return [];
      return data as User[];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  async getUserSuggestions(userId: string, limit: number = 10): Promise<User[]> {
    try {
      // Get users with high reliability scores
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', userId)
        .order('trust_reliability_cached', { ascending: false })
        .limit(limit);

      if (error) return [];
      return data as User[];
    } catch (error) {
      console.error('Error getting user suggestions:', error);
      return [];
    }
  }

  async getUserStats(userId: string): Promise<{
    totalContracts: number;
    successfulSettlements: number;
    averageRating: number;
    totalLent: number;
    totalBorrowed: number;
  }> {
    try {
      // Get contract stats
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('status, amount, borrower_id, lender_id')
        .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`);

      if (contractsError || !contracts) {
        return { totalContracts: 0, successfulSettlements: 0, averageRating: 0, totalLent: 0, totalBorrowed: 0 };
      }

      const totalContracts = contracts.length;
      const successfulSettlements = contracts.filter(c => c.status === 'SETTLED').length;
      
      const totalLent = contracts
        .filter(c => c.lender_id === userId)
        .reduce((sum, c) => sum + c.amount, 0);
      
      const totalBorrowed = contracts
        .filter(c => c.borrower_id === userId)
        .reduce((sum, c) => sum + c.amount, 0);

      // Get average rating
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_user_id', userId);

      const averageRating = reviewsError || !reviews || reviews.length === 0 
        ? 0 
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      return {
        totalContracts,
        successfulSettlements,
        averageRating,
        totalLent,
        totalBorrowed
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { totalContracts: 0, successfulSettlements: 0, averageRating: 0, totalLent: 0, totalBorrowed: 0 };
    }
  }

  // ===== NOTIFICATION SYSTEM =====
  async sendNotification(data: {
    user_id: string;
    title: string;
    message: string;
    type: string;
    contract_id?: string;
  }): Promise<boolean> {
    try {
      const notification = {
        id: generateUUID(),
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type,
        contract_id: data.contract_id || null,
        read: false,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('notifications')
        .insert(notification);

      return !error;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  async getNotifications(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) return [];
      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      return !error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}

export const getDataClient = () => {
  // Always use ProductionDataClient for real users
  // Only use MockDataClient in development with specific demo flags
  const isDemoMode = import.meta.env.VITE_ENABLE_GUEST_ACCESS === 'true' && 
                     import.meta.env.MODE === 'development';
  
  if (isDemoMode) {
    return new MockDataClient();
  } else {
    return new ProductionDataClient();
  }
};