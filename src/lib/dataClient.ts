// Data client factory - switches between mock (Demo) and Supabase (Live) based on DEMO_MODE env

export type ContractStatus = 'REQUESTED' | 'ACTIVE' | 'SETTLE_PENDING' | 'SETTLED';

export interface User {
  id: string;
  phone: string;
  name: string;
  trust_reliability_cached: number | null;
  created_at: string;
}

export interface Contract {
  id: string;
  borrower_id: string;
  lender_id: string;
  amount: number;
  due_at: string;
  reason: string | null;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
  borrower?: User;
  lender?: User;
  disbursal_proof_url?: string | null;
  repayment_proof_url?: string | null;
}

export interface Extension {
  id: string;
  contract_id: string;
  new_due_at: string;
  approved: boolean | null;
  decided_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  contract_id: string;
  reviewer_id: string;
  reviewee_id: string;
  stars: number;
  text: string | null;
  resolved: boolean;
  created_at: string;
  reviewer?: User;
}

export interface Reminder {
  id: string;
  contract_id: string;
  kind: string;
  scheduled_at: string;
  sent_at: string | null;
}

export interface DataClient {
  // Users
  getUserByPhone(phone: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  createUser(data: { phone: string; name: string }): Promise<User>;
  updateUserReliability(userId: string, reliability: number): Promise<void>;
  
  // Contracts
  getContractsForUser(userId: string): Promise<Contract[]>;
  getContractById(id: string): Promise<Contract | null>;
  createContract(data: {
    borrower_id: string;
    lender_id: string;
    amount: number;
    due_at: string;
    reason: string | null;
  }): Promise<Contract>;
  updateContract(id: string, data: Partial<Contract>): Promise<Contract>;
  
  // Extensions
  getExtensionsForContract(contractId: string): Promise<Extension[]>;
  createExtension(data: {
    contract_id: string;
    new_due_at: string;
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
    kind: string;
    scheduled_at: string;
  }): Promise<Reminder>;
  markReminderSent(id: string): Promise<void>;
}

// Mock implementation using localStorage
class MockDataClient implements DataClient {
  private getStore<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setStore<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const users = this.getStore<User>('users');
    return users.find(u => u.phone === phone) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const users = this.getStore<User>('users');
    return users.find(u => u.id === id) || null;
  }

  async createUser(data: { phone: string; name: string }): Promise<User> {
    const users = this.getStore<User>('users');
    const user: User = {
      id: crypto.randomUUID(),
      phone: data.phone,
      name: data.name,
      trust_reliability_cached: null,
      created_at: new Date().toISOString(),
    };
    users.push(user);
    this.setStore('users', users);
    return user;
  }

  async updateUserReliability(userId: string, reliability: number): Promise<void> {
    const users = this.getStore<User>('users');
    const user = users.find(u => u.id === userId);
    if (user) {
      user.trust_reliability_cached = reliability;
      this.setStore('users', users);
    }
  }

  async getContractsForUser(userId: string): Promise<Contract[]> {
    const contracts = this.getStore<Contract>('contracts');
    const users = this.getStore<User>('users');
    return contracts
      .filter(c => c.borrower_id === userId || c.lender_id === userId)
      .map(c => ({
        ...c,
        borrower: users.find(u => u.id === c.borrower_id),
        lender: users.find(u => u.id === c.lender_id),
      }));
  }

  async getContractById(id: string): Promise<Contract | null> {
    const contracts = this.getStore<Contract>('contracts');
    const users = this.getStore<User>('users');
    const contract = contracts.find(c => c.id === id);
    if (!contract) return null;
    return {
      ...contract,
      borrower: users.find(u => u.id === contract.borrower_id),
      lender: users.find(u => u.id === contract.lender_id),
    };
  }

  async createContract(data: {
    borrower_id: string;
    lender_id: string;
    amount: number;
    due_at: string;
    reason: string | null;
  }): Promise<Contract> {
    const contracts = this.getStore<Contract>('contracts');
    const contract: Contract = {
      id: crypto.randomUUID(),
      ...data,
      status: 'REQUESTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    contracts.push(contract);
    this.setStore('contracts', contracts);
    return contract;
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    const contracts = this.getStore<Contract>('contracts');
    const index = contracts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contract not found');
    contracts[index] = { ...contracts[index], ...data, updated_at: new Date().toISOString() };
    this.setStore('contracts', contracts);
    return contracts[index];
  }

  async getExtensionsForContract(contractId: string): Promise<Extension[]> {
    const extensions = this.getStore<Extension>('extensions');
    return extensions.filter(e => e.contract_id === contractId);
  }

  async createExtension(data: { contract_id: string; new_due_at: string }): Promise<Extension> {
    const extensions = this.getStore<Extension>('extensions');
    const extension: Extension = {
      id: crypto.randomUUID(),
      ...data,
      approved: null,
      decided_at: null,
      created_at: new Date().toISOString(),
    };
    extensions.push(extension);
    this.setStore('extensions', extensions);
    return extension;
  }

  async approveExtension(id: string, approved: boolean): Promise<Extension> {
    const extensions = this.getStore<Extension>('extensions');
    const index = extensions.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Extension not found');
    extensions[index].approved = approved;
    extensions[index].decided_at = new Date().toISOString();
    this.setStore('extensions', extensions);
    return extensions[index];
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    const reviews = this.getStore<Review>('reviews');
    const users = this.getStore<User>('users');
    return reviews
      .filter(r => r.reviewee_id === userId)
      .map(r => ({
        ...r,
        reviewer: users.find(u => u.id === r.reviewer_id),
      }));
  }

  async createReview(data: {
    contract_id: string;
    reviewer_id: string;
    reviewee_id: string;
    stars: number;
    text: string | null;
  }): Promise<Review> {
    const reviews = this.getStore<Review>('reviews');
    const review: Review = {
      id: crypto.randomUUID(),
      ...data,
      resolved: false,
      created_at: new Date().toISOString(),
    };
    reviews.push(review);
    this.setStore('reviews', reviews);
    return review;
  }

  async markReviewResolved(id: string): Promise<Review> {
    const reviews = this.getStore<Review>('reviews');
    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Review not found');
    reviews[index].resolved = true;
    this.setStore('reviews', reviews);
    return reviews[index];
  }

  async getRemindersForContract(contractId: string): Promise<Reminder[]> {
    const reminders = this.getStore<Reminder>('reminders');
    return reminders.filter(r => r.contract_id === contractId);
  }

  async createReminder(data: {
    contract_id: string;
    kind: string;
    scheduled_at: string;
  }): Promise<Reminder> {
    const reminders = this.getStore<Reminder>('reminders');
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      ...data,
      sent_at: null,
    };
    reminders.push(reminder);
    this.setStore('reminders', reminders);
    return reminder;
  }

  async markReminderSent(id: string): Promise<void> {
    const reminders = this.getStore<Reminder>('reminders');
    const index = reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      reminders[index].sent_at = new Date().toISOString();
      this.setStore('reminders', reminders);
    }
  }
}

// Supabase implementation for Live mode
import { supabase } from '@/integrations/supabase/client';

class SupabaseDataClient implements DataClient {
  async getUserByPhone(phone: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  async createUser(data: { phone: string; name: string }): Promise<User> {
    const { data: user, error } = await supabase
      .from('users')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return user;
  }

  async updateUserReliability(userId: string, reliability: number): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ trust_reliability_cached: reliability })
      .eq('id', userId);
    
    if (error) throw error;
  }

  async getContractsForUser(userId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        borrower:borrower_id(id, phone, name, trust_reliability_cached, created_at),
        lender:lender_id(id, phone, name, trust_reliability_cached, created_at)
      `)
      .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Contract[];
  }

  async getContractById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        borrower:borrower_id(id, phone, name, trust_reliability_cached, created_at),
        lender:lender_id(id, phone, name, trust_reliability_cached, created_at)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as Contract | null;
  }

  async createContract(data: {
    borrower_id: string;
    lender_id: string;
    amount: number;
    due_at: string;
    reason: string | null;
  }): Promise<Contract> {
    const { data: contract, error } = await supabase
      .from('contracts')
      .insert({ ...data, status: 'REQUESTED' })
      .select()
      .single();
    
    if (error) throw error;
    return contract;
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    const { data: contract, error } = await supabase
      .from('contracts')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return contract;
  }

  async getExtensionsForContract(contractId: string): Promise<Extension[]> {
    const { data, error } = await supabase
      .from('extensions')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createExtension(data: {
    contract_id: string;
    new_due_at: string;
  }): Promise<Extension> {
    const { data: extension, error } = await supabase
      .from('extensions')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return extension;
  }

  async approveExtension(id: string, approved: boolean): Promise<Extension> {
    const { data: extension, error } = await supabase
      .from('extensions')
      .update({ approved, decided_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return extension;
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, phone, name, trust_reliability_cached, created_at)
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Review[];
  }

  async createReview(data: {
    contract_id: string;
    reviewer_id: string;
    reviewee_id: string;
    stars: number;
    text: string | null;
  }): Promise<Review> {
    const { data: review, error } = await supabase
      .from('reviews')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return review;
  }

  async markReviewResolved(id: string): Promise<Review> {
    const { data: review, error } = await supabase
      .from('reviews')
      .update({ resolved: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return review;
  }

  async getRemindersForContract(contractId: string): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('contract_id', contractId)
      .order('scheduled_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async createReminder(data: {
    contract_id: string;
    kind: string;
    scheduled_at: string;
  }): Promise<Reminder> {
    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return reminder;
  }

  async markReminderSent(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }
}

// Factory function
export function getDataClient(): DataClient {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  return isDemoMode ? new MockDataClient() : new SupabaseDataClient();
}
