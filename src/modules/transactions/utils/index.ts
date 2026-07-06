import { Transaction, TransactionStats, TransactionFilters } from '@/modules/transactions/types';

export function calculateStats(transactions: Transaction[]): TransactionStats {
  const stats: TransactionStats = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    cashFlow: 0,
    partnerDue: 0,
    totalLoans: 0,
    totalInvestments: 0,
    totalSavings: 0,
    transactionCount: transactions.length,
  };

  transactions.forEach((t) => {
    switch (t.type) {
      case 'income':
        stats.totalIncome += t.amount;
        break;
      case 'expense':
      case 'split_bills':
      case 'adjustment':
      case 'recurring':
      case 'installments':
      case 'emi':
      case 'upi_settlement':
        stats.totalExpense += t.amount;
        break;
      case 'loan':
        if (!t.isPaid) stats.totalLoans += t.amount;
        break;
      case 'borrow':
        if (!t.isPaid) stats.partnerDue += t.amount;
        break;
      case 'investment':
        stats.totalInvestments += t.amount;
        break;
      case 'saving':
        stats.totalSavings += t.amount;
        break;
      case 'transfer':
        break;
    }
  });

  stats.balance = stats.totalIncome - stats.totalExpense;
  stats.cashFlow = stats.totalIncome - stats.totalExpense;

  return stats;
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  return transactions.filter((t) => {
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(t.type)) return false;
    }

    if (filters.categoryId && t.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.partnerId && t.partnerId !== filters.partnerId) {
      return false;
    }

    if (filters.dateFrom) {
      if (new Date(t.date) < new Date(filters.dateFrom)) return false;
    }

    if (filters.dateTo) {
      if (new Date(t.date) > new Date(filters.dateTo)) return false;
    }

    if (filters.minAmount !== undefined) {
      if (t.amount < filters.minAmount) return false;
    }

    if (filters.maxAmount !== undefined) {
      if (t.amount > filters.maxAmount) return false;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesDescription = t.description.toLowerCase().includes(searchLower);
      const matchesNotes = t.notes?.toLowerCase().includes(searchLower);
      const matchesTags = t.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
      if (!matchesDescription && !matchesNotes && !matchesTags) return false;
    }

    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((tag) => t.tags?.includes(tag))) return false;
    }

    return true;
  });
}

export function sortByDate(transactions: Transaction[], descending = true): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return descending ? dateB - dateA : dateA - dateB;
  });
}
