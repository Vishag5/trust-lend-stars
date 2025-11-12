export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  trust_reliability_cached?: number;
  created_at: string;
  updated_at?: string;
}

export interface Contract {
  id: string;
  borrower_id: string;
  lender_id: string;
  amount: number;
  due_at: string;
  reason: string | null;
  attachment_url?: string | null;
  status: 'REQUESTED' | 'PENDING_DISBURSAL' | 'ACTIVE' | 'DUE' | 'PENDING_SETTLEMENT' | 'SETTLED' | 'REJECTED';
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
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at?: string;
  approved: boolean;
  decided_at?: string;
  extra_days?: number;
} // Extension interface

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string;
  contract_id: string;
  created_at: string;
  updated_at?: string;
  resolved?: boolean;
}

export interface Reminder {
  id: string;
  contract_id: string;
  type: string;
  message?: string;
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
}