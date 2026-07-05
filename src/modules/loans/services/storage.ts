import { Loan, LoanStats } from '@/modules/loans/types';
import { idbStorage } from '@/lib/idbStorage';

function calculateNextEmiDate(currentDate: string): string {
  const date = new Date(currentDate);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
}

export const loanService = {
  getAll: () => idbStorage.getAll<Loan>('loans'),

  getById: (id: string) => idbStorage.getById<Loan>('loans', id),

  getByType: (type: string) => idbStorage.getAll<Loan>('loans').filter((l) => l.type === type),

  getActive: () => idbStorage.getAll<Loan>('loans').filter((l) => l.status === 'active'),

  create: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>) => {
    return idbStorage.create<Loan>('loans', 'loans', loan);
  },

  update: (id: string, updates: Partial<Loan>) => {
    return idbStorage.update<Loan>('loans', 'loans', id, updates);
  },

  delete: (id: string) => {
    return idbStorage.delete('loans', 'loans', id);
  },

  recordPayment: (id: string) => {
    const loan = loanService.getById(id);
    if (!loan || loan.paidEmis >= loan.totalEmis) return null;
    return loanService.update(id, {
      paidEmis: loan.paidEmis + 1,
      nextPaymentDate: calculateNextEmiDate(loan.nextPaymentDate),
      status: loan.paidEmis + 1 >= loan.totalEmis ? 'closed' : 'active',
    });
  },

  getStats: (): LoanStats => {
    const loans = idbStorage.getAll<Loan>('loans');
    const active = loans.filter((l) => l.status === 'active');
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return {
      totalGiven: active.filter((l) => l.type === 'given').reduce((s, l) => s + (l.principalAmount - l.paidEmis * l.emiAmount), 0),
      totalTaken: active.filter((l) => l.type === 'taken').reduce((s, l) => s + (l.principalAmount - l.paidEmis * l.emiAmount), 0),
      totalInvested: active.filter((l) => l.type === 'investment').reduce((s, l) => s + l.principalAmount, 0),
      totalSaved: active.filter((l) => l.type === 'savings').reduce((s, l) => s + l.principalAmount, 0),
      activeLoans: active.length,
      monthlyEmiDue: active.reduce((s, l) => {
        const dueDate = new Date(l.nextPaymentDate);
        if (dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear) {
          return s + l.emiAmount;
        }
        return s;
      }, 0),
    };
  },

  seedDefaults: () => {
    // No-op: users create loans manually
  },

  clear: () => {
    idbStorage.clear('loans', 'loans');
  },
};
