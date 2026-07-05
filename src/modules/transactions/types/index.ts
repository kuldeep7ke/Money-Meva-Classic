import { TransactionType, RecurringFrequency } from '@/constants';

export interface Transaction {
  id: string;
  businessId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  partnerId?: string;
  tags?: string[];
  notes?: string;
  attachments?: string[];
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  recurringEndDate?: string;
  source?: string;
  vendor?: string;
  paymentMethod?: string;
  fromAccountId?: string;
  toAccountId?: string;
  reason?: string;
  adjustmentType?: 'increase' | 'decrease';
  loanPartnerId?: string;
  borrowPartnerId?: string;
  interestRate?: number;
  dueDate?: string;
  isPaid?: boolean;
  investmentType?: string;
  expectedReturn?: number;
  maturityDate?: string;
  goalName?: string;
  targetAmount?: number;
  nextDueDate?: string;
  splitDetails?: SplitDetail[];
  totalAmount?: number;
  installmentCount?: number;
  currentInstallment?: number;
  installmentAmount?: number;
  startDate?: string;
  endDate?: string;
  emiAmount?: number;
  totalEmis?: number;
  paidEmis?: number;
  upiId?: string;
  utrNumber?: string;
  settlementStatus?: 'pending' | 'completed' | 'failed';
  counterpartyUpiId?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SplitDetail {
  partnerId: string;
  amount: number;
  isPaid: boolean;
}

export interface TransactionFilters {
  type?: TransactionType[];
  categoryId?: string;
  partnerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  tags?: string[];
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  cashFlow: number;
  partnerDue: number;
  totalLoans: number;
  totalInvestments: number;
  totalSavings: number;
  transactionCount: number;
}
