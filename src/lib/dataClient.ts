import { User, Contract, Extension, Review, Reminder } from './types';

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

export interface Extension {
  id: string;
  contract_id: string;
  new_due_at: string;
  reason?: string | null;
  approved: boolean | null;
  decided_at: string | null;
  created_at: string;
  extra_days?: number;
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

export interface DataClient {
  // Users
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User>;
  getUserByPhone(phone: string): Promise<User | null>;
  createUser(data: {
    name: string;
    phone: string;
    trust_reliability_cached?: number;
  }): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  updateUserReliability(id: string, score: number): Promise<User>;
  
  // Contracts
  getContractsForUser(userId: string): Promise<Contract[]>;
  getContractById(id: string): Promise<Contract>;
  createContract(data: {
    borrower_id: string;
    lender_id: string;
    amount: number;
    due_at: string;
    reason: string | null;
    attachment_url?: string | null;
  }): Promise<Contract>;
  updateContract(id: string, data: Partial<Contract>): Promise<Contract>;
  
  // Extensions
  getExtensionsForContract(contractId: string): Promise<Extension[]>;
  createExtension(data: {
    contract_id: string;
    new_due_at: string;
    reason?: string | null;
    extra_days?: number;
  }): Promise<Extension>;
  approveExtension(id: string, approved: boolean): Promise<Extension>;
  
  // Reviews
  getReviewsForUser(userId: string): Promise<Review[]>;
  createReview(data: {
    contract_id: string;
    reviewer_id: string;
    reviewee_id: string;
    stars: number;
    text: string | null;
  }): Promise<Review>;
  markReviewResolved(id: string): Promise<Review>;
  
  // Reminders
  getRemindersForContract(contractId: string): Promise<Reminder[]>;
  createReminder(data: {
    contract_id: string;
    type: 'DUE' | 'OVERDUE';
  }): Promise<Reminder>;
}

class MockDataClient implements DataClient {
  private getStore<T>(key: string): T[] {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  private setStore<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private ensureDemoData(): void {
    console.log('ensureDemoData called');
    const users = this.getStore<User>('users');
    console.log('Current users in store:', users);
    
    if (users.length === 0) {
      console.log('No users found, seeding demo data...');
      const demoUsers: User[] = [
        {
          id: 'borrower-a',
          name: 'Borrower A',
          phone: '+919000011111',
          trust_reliability_cached: 90,
          created_at: new Date().toISOString(),
        },
        {
          id: 'borrower-b',
          name: 'Borrower B',
          phone: '+919000033333',
          trust_reliability_cached: 67,
          created_at: new Date().toISOString(),
        },
        {
          id: 'lender-l1',
          name: 'Lender L1',
          phone: '+919000022222',
          trust_reliability_cached: 0,
          created_at: new Date().toISOString(),
        }
      ];
      this.setStore('users', demoUsers);
      console.log('Demo users created and stored:', demoUsers);
    } else {
      console.log('Users already exist:', users);
    }
  }

  async getUsers(): Promise<User[]> {
    console.log('getUsers called');
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    console.log('Returning users:', users);
    return users;
  }

  async getUserById(id: string): Promise<User> {
    console.log('getUserById called with ID:', id);
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    console.log('All users in store:', users);
    console.log('Looking for user with ID:', id);
    
    const user = users.find(u => u.id === id);
    console.log('Found user:', user);
    
    if (!user) {
      console.error('User not found for ID:', id);
      console.log('Available user IDs:', users.map(u => u.id));
      console.log('Available user names:', users.map(u => u.name));
      throw new Error(`User not found with ID: ${id}. Available users: ${users.map(u => `${u.name}(${u.id})`).join(', ')}`);
    }
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    console.log('getUserByPhone called with phone:', phone);
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    const user = users.find(u => u.phone === phone);
    console.log('Found user by phone:', user);
    return user || null;
  }

  async createUser(data: {
    name: string;
    phone: string;
    trust_reliability_cached?: number;
  }): Promise<User> {
    console.log('createUser called with data:', data);
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    
    // Check if user with this phone already exists
    const existingUser = users.find(u => u.phone === data.phone);
    if (existingUser) {
      console.log('User already exists, returning existing user:', existingUser);
      return existingUser;
    }
    
    const user: User = {
      id: generateUUID(),
      ...data,
      created_at: new Date().toISOString(),
    };
    users.push(user);
    this.setStore('users', users);
    console.log('User created:', user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    console.log('updateUser called with ID:', id, 'data:', data);
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...data };
    this.setStore('users', users);
    console.log('User updated:', users[index]);
    return users[index];
  }

  async updateUserReliability(id: string, score: number): Promise<User> {
    console.log('updateUserReliability called with ID:', id, 'score:', score);
    this.ensureDemoData();
    const users = this.getStore<User>('users');
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], trust_reliability_cached: score };
    this.setStore('users', users);
    console.log('User reliability updated:', users[index]);
    return users[index];
  }

  async getContractsForUser(userId: string): Promise<Contract[]> {
    console.log('getContractsForUser called with userId:', userId);
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const users = this.getStore<User>('users');
    
    const userContracts = contracts
      .filter(c => c.borrower_id === userId || c.lender_id === userId)
      .map(contract => ({
        ...contract,
        borrower: users.find(u => u.id === contract.borrower_id),
        lender: users.find(u => u.id === contract.lender_id),
      }));
    
    console.log('Returning contracts for user:', userContracts);
    return userContracts;
  }

  async getContractById(id: string): Promise<Contract> {
    console.log('getContractById called with ID:', id);
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const contract = contracts.find(c => c.id === id);
    if (!contract) throw new Error('Contract not found');
    
    const users = this.getStore<User>('users');
    const extensions = this.getStore<Extension>('extensions');
    const extensionsCount = extensions.filter(e => e.contract_id === id).length;
    
    const fullContract = {
      ...contract,
      borrower: users.find(u => u.id === contract.borrower_id),
      lender: users.find(u => u.id === contract.lender_id),
      extensions_count: extensionsCount,
    };
    
    console.log('Returning contract:', fullContract);
    return fullContract;
  }

  async createContract(data: {
    borrower_id: string;
    lender_id: string;
    amount: number;
    due_at: string;
    reason: string | null;
    attachment_url?: string | null;
  }): Promise<Contract> {
    console.log('createContract called with data:', data);
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const contract: Contract = {
      id: generateUUID(),
      ...data,
      status: 'REQUESTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      extensions_count: 0,
    };
    contracts.push(contract);
    this.setStore('contracts', contracts);
    console.log('Contract created:', contract);
    return contract;
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    console.log('updateContract called with ID:', id, 'data:', data);
    this.ensureDemoData();
    const contracts = this.getStore<Contract>('contracts');
    const index = contracts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contract not found');
    
    const oldStatus = contracts[index].status;
    contracts[index] = { ...contracts[index], ...data, updated_at: new Date().toISOString() };
    this.setStore('contracts', contracts);
    console.log('Contract updated:', contracts[index]);
    
    // Update borrower's reliability when contract is settled
    if (data.status === 'SETTLED' && oldStatus !== 'SETTLED') {
      console.log('Contract settled, updating borrower reliability');
      await this.updateBorrowerReliability(contracts[index].borrower_id);
    }
    
    return contracts[index];
  }

  async getExtensionsForContract(contractId: string): Promise<Extension[]> {
    console.log('getExtensionsForContract called with contractId:', contractId);
    this.ensureDemoData();
    const extensions = this.getStore<Extension>('extensions');
    const contractExtensions = extensions.filter(e => e.contract_id === contractId);
    console.log('Returning extensions for contract:', contractExtensions);
    return contractExtensions;
  }

  async createExtension(data: {
    contract_id: string;
    new_due_at: string;
    reason?: string | null;
    extra_days?: number;
  }): Promise<Extension> {
    console.log('createExtension called with data:', data);
    this.ensureDemoData();
    const extensions = this.getStore<Extension>('extensions');
    const extension: Extension = {
      id: generateUUID(),
      ...data,
      approved: null,
      decided_at: null,
      created_at: new Date().toISOString(),
    };
    extensions.push(extension);
    this.setStore('extensions', extensions);
    console.log('Extension created:', extension);
    return extension;
  }

  async approveExtension(id: string, approved: boolean): Promise<Extension> {
    console.log('approveExtension called with ID:', id, 'approved:', approved);
    this.ensureDemoData();
    const extensions = this.getStore<Extension>('extensions');
    const index = extensions.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Extension not found');
    extensions[index] = { 
      ...extensions[index], 
      approved, 
      decided_at: new Date().toISOString() 
    };
    this.setStore('extensions', extensions);
    console.log('Extension approved:', extensions[index]);
    return extensions[index];
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    console.log('getReviewsForUser called with userId:', userId);
    this.ensureDemoData();
    const reviews = this.getStore<Review>('reviews');
    const userReviews = reviews.filter(r => r.reviewee_id === userId);
    console.log('Returning reviews for user:', userReviews);
    return userReviews;
  }

  async createReview(data: {
    contract_id: string;
    reviewer_id: string;
    reviewee_id: string;
    stars: number;
    text: string | null;
  }): Promise<Review> {
    console.log('createReview called with data:', data);
    this.ensureDemoData();
    const reviews = this.getStore<Review>('reviews');
    const review: Review = {
      id: generateUUID(),
      ...data,
      created_at: new Date().toISOString(),
      resolved: false,
    };
    reviews.push(review);
    this.setStore('reviews', reviews);
    console.log('Review created:', review);
    
    // Update borrower's reliability score after adding review
    await this.updateBorrowerReliability(data.reviewee_id);
    
    return review;
  }
  
  // Helper method to recalculate and update borrower's reliability score
  private async updateBorrowerReliability(borrowerId: string): Promise<void> {
    console.log('updateBorrowerReliability called for borrower:', borrowerId);
    
    // Get all contracts for this borrower
    const contracts = await this.getContractsForUser(borrowerId);
    const borrowerContracts = contracts.filter(c => c.borrower_id === borrowerId);
    
    // Filter contracts from last 12 months only
    const twelveMonthsAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    const recentContracts = borrowerContracts.filter(c => {
      const contractDate = new Date(c.created_at).getTime();
      return contractDate >= twelveMonthsAgo;
    });
    
    // Count settled (repaid) contracts
    const settledContracts = recentContracts.filter(c => c.status === 'SETTLED');
    const totalContracts = recentContracts.filter(c => 
      c.status === 'SETTLED' || c.status === 'DUE' || c.status === 'ACTIVE'
    );
    
    // Calculate reliability percentage
    let reliabilityScore = 0;
    if (totalContracts.length > 0) {
      reliabilityScore = Math.round((settledContracts.length / totalContracts.length) * 100);
    }
    
    console.log('Reliability calculation:', {
      borrowerId,
      recentContracts: recentContracts.length,
      settledContracts: settledContracts.length,
      totalContracts: totalContracts.length,
      reliabilityScore
    });
    
    // Update user's cached reliability score
    const users = this.getStore<User>('users');
    const userIndex = users.findIndex(u => u.id === borrowerId);
    if (userIndex !== -1) {
      users[userIndex].trust_reliability_cached = reliabilityScore;
      this.setStore('users', users);
      console.log('Updated borrower reliability:', users[userIndex]);
    }
  }

  async markReviewResolved(id: string): Promise<Review> {
    console.log('markReviewResolved called with ID:', id);
    this.ensureDemoData();
    const reviews = this.getStore<Review>('reviews');
    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Review not found');
    reviews[index] = { ...reviews[index], resolved: true };
    this.setStore('reviews', reviews);
    console.log('Review marked as resolved:', reviews[index]);
    return reviews[index];
  }

  async getRemindersForContract(contractId: string): Promise<Reminder[]> {
    console.log('getRemindersForContract called with contractId:', contractId);
    this.ensureDemoData();
    const reminders = this.getStore<Reminder>('reminders');
    const contractReminders = reminders.filter(r => r.contract_id === contractId);
    console.log('Returning reminders for contract:', contractReminders);
    return contractReminders;
  }

  async createReminder(data: {
    contract_id: string;
    type: 'DUE' | 'OVERDUE';
  }): Promise<Reminder> {
    console.log('createReminder called with data:', data);
    this.ensureDemoData();
    const reminders = this.getStore<Reminder>('reminders');
    const reminder: Reminder = {
      id: generateUUID(),
      ...data,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    reminders.push(reminder);
    this.setStore('reminders', reminders);
    console.log('Reminder created:', reminder);
    return reminder;
  }
}

export const getDataClient = (): DataClient => {
  return new MockDataClient();
};