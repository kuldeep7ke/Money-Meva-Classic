export const APP_NAME = 'Money Meva';
export const APP_VERSION = '2.0.1';

export const STORAGE_KEYS = {
  TRANSACTIONS: 'money_meva_transactions',
  PARTNERS: 'money_meva_partners',
  CATEGORIES: 'money_meva_categories',
  USERS: 'money_meva_users',
  BUSINESS: 'money_meva_business',
  AUDIT: 'money_meva_audit',
  SETTINGS: 'money_meva_settings',
  AUTH: 'money_meva_auth',
  ACCOUNTS: 'money_meva_accounts',
} as const;

export const TRANSACTION_TYPES = [
  'income',
  'expense',
  'transfer',
  'adjustment',
  'loan',
  'borrow',
  'investment',
  'saving',
  'recurring',
  'split_bills',
  'installments',
  'emi',
  'upi_settlement',
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
  adjustment: 'Adjustment',
  loan: 'Loan',
  borrow: 'Borrow',
  investment: 'Investment',
  saving: 'Saving',
  recurring: 'Recurring',
  split_bills: 'Split Bills',
  installments: 'Installments',
  emi: 'EMI',
  upi_settlement: 'UPI Settlement',
};

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  income: '#22c55e',
  expense: '#ef4444',
  transfer: '#3b82f6',
  adjustment: '#f59e0b',
  loan: '#8b5cf6',
  borrow: '#ec4899',
  investment: '#06b6d4',
  saving: '#10b981',
  recurring: '#6366f1',
  split_bills: '#f97316',
  installments: '#14b8a6',
  emi: '#a855f7',
  upi_settlement: '#0ea5e9',
};

export const RECURRING_FREQUENCIES = [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
  'yearly',
] as const;

export type RecurringFrequency = (typeof RECURRING_FREQUENCIES)[number];

export const PARTNER_TYPES = [
  'customer',
  'vendor',
  'friend',
  'family',
  'worker',
  'farm_partner',
  'company',
] as const;

export type PartnerType = (typeof PARTNER_TYPES)[number];

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  customer: 'Customer',
  vendor: 'Vendor',
  friend: 'Friend',
  family: 'Family',
  worker: 'Worker',
  farm_partner: 'Farm Partner',
  company: 'Company',
};
