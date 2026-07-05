'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Transaction, TransactionFilters, TransactionStats } from '@/modules/transactions/types';
import { storage } from '@/modules/transactions/services/storage';
import { auditService } from '@/modules/transactions/services/audit';
import { calculateStats, filterTransactions, sortByDate } from '@/modules/transactions/utils';
import { useState, useCallback, useMemo } from 'react';
import { partnerService } from '@/modules/partners/services/storage';
import { accountService } from '@/modules/accounts/services/storage';
import { useConfirm } from '@/components/ConfirmDialog';

function updatePartnerBalance(transaction: Transaction, delta: number) {
  if (!transaction.partnerId) return;
  const partner = partnerService.getById(transaction.partnerId);
  if (!partner) return;
  const amountDelta = transaction.type === 'income' ? delta : -delta;
  partnerService.updateBalance(transaction.partnerId, amountDelta);
}

function updateAccountBalances(transaction: Transaction, multiplier: number) {
  if (transaction.fromAccountId) {
    accountService.updateBalance(transaction.fromAccountId, -transaction.amount * multiplier);
  }
  if (transaction.toAccountId) {
    accountService.updateBalance(transaction.toAccountId, transaction.amount * multiplier);
  }
}

interface TransactionContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  stats: TransactionStats;
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Transaction | null;
  deleteTransaction: (id: string) => Promise<boolean>;
  bulkDeleteTransactions: (ids: string[]) => Promise<boolean>;
  getTransactionById: (id: string) => Transaction | undefined;
  refreshTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.transactions.getAll());
  const [filters, setFilters] = useState<TransactionFilters>({});
  const { confirm } = useConfirm();

  const refreshTransactions = useCallback(() => {
    setTransactions(storage.transactions.getAll());
  }, []);

  const filteredTransactions = useMemo(() => {
    const filtered = filterTransactions(transactions, filters);
    return sortByDate(filtered);
  }, [transactions, filters]);

  const stats = useMemo(() => calculateStats(transactions), [transactions]);

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newTransaction = storage.transactions.create(transaction);
      auditService.logTransaction('Created', newTransaction.id, transaction.userId, transaction.businessId, transaction.description);
      updatePartnerBalance(newTransaction as Transaction, newTransaction.amount);
      updateAccountBalances(newTransaction as Transaction, 1);
      refreshTransactions();
      return newTransaction;
    },
    [refreshTransactions]
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      const old = storage.transactions.getById(id);
      const updated = storage.transactions.update(id, updates);
      if (updated && old) {
        auditService.logTransaction('Updated', id, updated.userId, updated.businessId, `Updated: ${Object.keys(updates).join(', ')}`);
        if (old.partnerId && old.partnerId !== updated.partnerId) {
          updatePartnerBalance(old, -old.amount);
          updatePartnerBalance(updated as Transaction, updated.amount);
        } else if (old.partnerId) {
          const delta = updated.amount - old.amount;
          if (delta !== 0) updatePartnerBalance(updated as Transaction, delta);
        }
        if (old.fromAccountId !== updated.fromAccountId || old.toAccountId !== updated.toAccountId || old.amount !== updated.amount) {
          updateAccountBalances(old, -1);
          updateAccountBalances(updated as Transaction, 1);
        }
        refreshTransactions();
      }
      return updated;
    },
    [refreshTransactions]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const transaction = storage.transactions.getById(id);
      if (transaction) {
        const ok = await confirm({
          title: 'Delete Transaction',
          message: `Delete "${transaction.description}"? It will be moved to archive and can be restored later.`,
          confirmText: 'Delete',
          variant: 'danger',
        });
        if (!ok) return false;
        storage.transactions.delete(id);
        auditService.logTransaction('Archived', id, transaction.userId, transaction.businessId, transaction.description);
        updatePartnerBalance(transaction, -transaction.amount);
        updateAccountBalances(transaction, -1);
        refreshTransactions();
        return true;
      }
      return false;
    },
    [refreshTransactions, confirm]
  );

  const bulkDeleteTransactions = useCallback(
    async (ids: string[]) => {
      const ok = await confirm({
        title: 'Delete Transactions',
        message: `Archive ${ids.length} transactions? They can be restored from the Archive page.`,
        confirmText: `Delete ${ids.length}`,
        variant: 'danger',
      });
      if (!ok) return false;
      storage.transactions.bulkDelete(ids);
      ids.forEach((id) => {
        const t = transactions.find((tx) => tx.id === id);
        if (t) {
          auditService.logTransaction('Archived', id, t.userId, t.businessId, 'Bulk archive');
          updateAccountBalances(t, -1);
        }
      });
      refreshTransactions();
      return true;
    },
    [transactions, refreshTransactions, confirm]
  );

  const getTransactionById = useCallback(
    (id: string) => {
      return transactions.find((t) => t.id === id);
    },
    [transactions]
  );

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        filteredTransactions,
        stats,
        filters,
        setFilters,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        bulkDeleteTransactions,
        getTransactionById,
        refreshTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
