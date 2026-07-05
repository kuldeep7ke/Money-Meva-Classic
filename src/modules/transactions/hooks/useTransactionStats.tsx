'use client';

import { useTransactions } from './useTransactions';
import { TransactionType } from '@/constants';
import { useMemo } from 'react';

export function useTransactionStats() {
  const { transactions, stats } = useTransactions();

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    });

    let income = 0;
    let expense = 0;

    monthlyTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
    });

    return {
      income,
      expense,
      balance: income - expense,
      count: monthlyTransactions.length,
    };
  }, [transactions]);

  const dailyStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const dailyTransactions = transactions.filter((t) => t.date.startsWith(today));

    let income = 0;
    let expense = 0;

    dailyTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
    });

    return {
      income,
      expense,
      balance: income - expense,
      count: dailyTransactions.length,
    };
  }, [transactions]);

  const typeBreakdown = useMemo(() => {
    const breakdown: Record<TransactionType, number> = {} as Record<TransactionType, number>;
    transactions.forEach((t) => {
      breakdown[t.type] = (breakdown[t.type] || 0) + t.amount;
    });
    return breakdown;
  }, [transactions]);

  return {
    stats,
    monthlyStats,
    dailyStats,
    typeBreakdown,
  };
}
