export interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'user' | 'approver' | 'admin';
  created_at: string;
}

export interface CostCenter {
  center_id: string;
  name: string;
  code: string;
  active: boolean;
  created_at: string;
}

export interface ExpenseCategory {
  category_id: string;
  name: string;
  active: boolean;
  order: number;
  created_at: string;
}

export interface Trip {
  trip_id: string;
  name: string;
  creator_id: string;
  cost_center_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'closed';
  participants: string[];
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  closed_by?: string;
  closed_at?: string;
}

export interface Expense {
  expense_id: string;
  trip_id: string;
  user_id: string;
  amount: number;
  date: string;
  establishment: string;
  category_id: string;
  receipt_image: string;
  notes?: string;
  created_at: string;
  modified_at: string;
  modified_by: string;
}

export interface AuditLog {
  log_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id: string;
  changes: any;
  timestamp: string;
}
