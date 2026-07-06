'use client';

import { Transaction } from '@/modules/transactions/types';
import { TransactionCard } from './TransactionCard';
import { groupByDate, groupByWeek, groupByMonth, formatCurrency } from '@/utils';
import { useState, useMemo } from 'react';
import { Trash2, Calendar, ChevronDown } from 'lucide-react';

type GroupBy = 'day' | 'week' | 'month';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
}: TransactionListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [showGroupMenu, setShowGroupMenu] = useState(false);

  const groupedTransactions = useMemo(() => {
    switch (groupBy) {
      case 'week': return groupByWeek(transactions);
      case 'month': return groupByMonth(transactions);
      default: return groupByDate(transactions);
    }
  }, [transactions, groupBy]);

  const handleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((t) => t.id));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length > 0 && onBulkDelete) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
      setIsSelectMode(false);
    }
  };

  const groupLabel = { day: 'Day', week: 'Week', month: 'Month' };

  const getGroupStats = (items: Transaction[]) => {
    const income = items.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense, count: items.length };
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <p className="text-lg">No transactions found</p>
        <p className="text-sm mt-2">Add your first transaction to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSelectMode(!isSelectMode)}
            className="px-3 py-1.5 text-sm border rounded-lg"
            style={{ borderColor: 'var(--border-color)', color: isSelectMode ? 'var(--brand)' : 'var(--text-primary)', backgroundColor: isSelectMode ? 'var(--brand)11' : 'var(--bg-card)' }}
          >
            {isSelectMode ? 'Cancel' : 'Select'}
          </button>
          {isSelectMode && (
            <>
              <button onClick={handleSelectAll} className="px-3 py-1.5 text-sm border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                {selectedIds.length === transactions.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedIds.length > 0 && (
                <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm text-white rounded-lg flex items-center gap-1" style={{ backgroundColor: '#ef4444' }}>
                  <Trash2 className="w-4 h-4" /> Delete ({selectedIds.length})
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowGroupMenu(!showGroupMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}
            >
              <Calendar className="w-3.5 h-3.5" />
              Group: {groupLabel[groupBy]}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showGroupMenu && (
              <div className="absolute right-0 top-full mt-1 border rounded-lg shadow-lg z-10 min-w-[100px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                {(['day', 'week', 'month'] as GroupBy[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => { setGroupBy(g); setShowGroupMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:opacity-80 first:rounded-t-lg last:rounded-b-lg"
                    style={{ color: groupBy === g ? 'var(--brand)' : 'var(--text-primary)', fontWeight: groupBy === g ? 600 : 400 }}
                  >
                    By {groupLabel[g]}
                  </button>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>

      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {transactions.length} transactions · {Object.keys(groupedTransactions).length} groups
      </div>

      {Object.entries(groupedTransactions).map(([period, periodTransactions]) => {
        const stats = getGroupStats(periodTransactions);
        return (
          <div key={period}>
            <div className="flex items-center justify-between mb-2 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{period}</h3>
                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{stats.count}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {stats.income > 0 && <span style={{ color: '#22c55e' }}>+{formatCurrency(stats.income)}</span>}
                {stats.expense > 0 && <span style={{ color: '#ef4444' }}>-{formatCurrency(stats.expense)}</span>}
                <span className="font-semibold" style={{ color: stats.net >= 0 ? '#22c55e' : '#ef4444' }}>
                  {stats.net >= 0 ? '+' : ''}{formatCurrency(stats.net)}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              {periodTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  selected={selectedIds.includes(transaction.id)}
                  onSelect={handleSelect}
                  showCheckbox={isSelectMode}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
