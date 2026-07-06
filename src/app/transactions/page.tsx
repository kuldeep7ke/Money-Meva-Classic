'use client';

import { useState, useEffect } from 'react';
import { TransactionProvider, useTransactions } from '@/modules/transactions/hooks/useTransactions';
import { useTransactionStats } from '@/modules/transactions/hooks/useTransactionStats';
import { TransactionList } from '@/modules/transactions/components/TransactionList';
import { TransactionFilters } from '@/modules/transactions/components/TransactionFilters';
import { TransactionForm } from '@/modules/transactions/components/TransactionForm';
import { formatCurrency } from '@/utils';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowRightLeft, Home, RefreshCw, Archive } from 'lucide-react';
import { usePinGuard } from '@/components/PinGuard';
import { archiveService } from '@/modules/archive/services/storage';
import dynamic from 'next/dynamic';

const RecurringPanel = dynamic(() => import('@/modules/transactions/components/RecurringPanel'), { ssr: false });

function TransactionsContent() {
  const router = useRouter();
  const { filteredTransactions, filters, setFilters, addTransaction, deleteTransaction, bulkDeleteTransactions } = useTransactions();
  const { stats, monthlyStats, dailyStats } = useTransactionStats();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recurring'>('all');
  const [hasArchived, setHasArchived] = useState(false);
  const { requestPin, PinModal } = usePinGuard();

  useEffect(() => {
    setHasArchived(archiveService.getStats().transactions > 0);
  }, []);

  const handleCreate = (data: Parameters<typeof addTransaction>[0]) => {
    addTransaction(data);
    setShowForm(false);
  };

  const handleEdit = (id: string) => {
    requestPin(() => router.push(`/transactions/edit?id=${id}`));
  };

  const handleView = (id: string) => {
    router.push(`/transactions/detail?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    requestPin(() => deleteTransaction(id));
  };

  const handleBulkDelete = async (ids: string[]) => {
    requestPin(() => bulkDeleteTransactions(ids));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {PinModal}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Transactions</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your financial transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}
            >
              <Home className="w-5 h-5" /> Home
            </button>
            {hasArchived && (
              <button
                onClick={() => router.push('/archive')}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
                style={{ borderColor: '#f97316', color: '#f97316', backgroundColor: '#f9731608' }}
              >
                <Archive className="w-5 h-5" /> Archive
              </button>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Plus className="w-5 h-5" /> Add Transaction
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#22c55e' }}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Income</p>
                <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{formatCurrency(stats.totalIncome)}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#ef4444' }}>
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Expense</p>
                <p className="text-lg font-bold" style={{ color: '#ef4444' }}>{formatCurrency(stats.totalExpense)}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--brand)' }}>
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Balance</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(stats.balance)}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#FFCF9A' }}>
                <ArrowRightLeft className="w-5 h-5" style={{ color: '#1B1B1D' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Today</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(dailyStats.balance)}</p>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <TransactionForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('all')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: activeTab === 'all' ? 'var(--brand)' : 'var(--bg-card)', color: activeTab === 'all' ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <ArrowRightLeft className="w-4 h-4" /> All Transactions
          </button>
          <button onClick={() => setActiveTab('recurring')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: activeTab === 'recurring' ? 'var(--brand)' : 'var(--bg-card)', color: activeTab === 'recurring' ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <RefreshCw className="w-4 h-4" /> Recurring
          </button>
        </div>

        {activeTab === 'recurring' ? (
          <RecurringPanel />
        ) : (
          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <TransactionFilters filters={filters} onFiltersChange={setFilters} />
            <div className="mt-6">
              <TransactionList
                transactions={filteredTransactions}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onBulkDelete={handleBulkDelete}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <TransactionProvider>
      <TransactionsContent />
    </TransactionProvider>
  );
}
