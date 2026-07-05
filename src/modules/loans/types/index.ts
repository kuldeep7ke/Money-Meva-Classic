export type LoanType = 'given' | 'taken' | 'emi' | 'investment' | 'savings';

export interface Loan {
  id: string;
  businessId: string;
  partnerId?: string;
  partnerName: string;
  type: LoanType;
  title: string;
  principalAmount: number;
  interestRate: number;
  emiAmount: number;
  totalEmis: number;
  paidEmis: number;
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  status: 'active' | 'closed' | 'defaulted';
  notes?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanStats {
  totalGiven: number;
  totalTaken: number;
  totalInvested: number;
  totalSaved: number;
  activeLoans: number;
  monthlyEmiDue: number;
}

export const LOAN_TYPES: { value: LoanType; label: string; color: string }[] = [
  { value: 'given', label: 'Loan Given', color: '#8b5cf6' },
  { value: 'taken', label: 'Loan Taken', color: '#ec4899' },
  { value: 'emi', label: 'EMI', color: '#a855f7' },
  { value: 'investment', label: 'Investment', color: '#06b6d4' },
  { value: 'savings', label: 'Savings', color: '#10b981' },
];
