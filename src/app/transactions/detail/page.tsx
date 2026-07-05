'use client';

import { use } from 'react';
import { TransactionProvider, useTransactions } from '@/modules/transactions/hooks/useTransactions';
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS } from '@/constants';
import { formatCurrency, formatDate, formatDateTime } from '@/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

function TransactionDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { getTransactionById, deleteTransaction } = useTransactions();
  const transaction = getTransactionById(id);

  const handleDelete = () => {
    const ok = window.confirm('Are you sure you want to delete this transaction?');
    if (ok) {
      deleteTransaction(id);
      router.push('/transactions');
    }
  };

  if (!transaction) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="p-6 rounded-lg border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <p style={{ color: 'var(--text-muted)' }}>Transaction not found</p>
            <button onClick={() => router.push('/transactions')} className="mt-4 px-4 py-2 text-white rounded-lg" style={{ backgroundColor: 'var(--brand)' }}>Back to Transactions</button>
          </div>
        </div>
      </div>
    );
  }

  const amountColor = transaction.type === 'income' || transaction.type === 'investment'
    ? '#22c55e' : transaction.type === 'expense' || transaction.type === 'loan'
    ? '#ef4444' : 'var(--text-primary)';
  const amountPrefix = transaction.type === 'income' || transaction.type === 'investment'
    ? '+' : transaction.type === 'expense' || transaction.type === 'loan'
    ? '-' : '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Transaction Details</h1>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: `${TRANSACTION_TYPE_COLORS[transaction.type] || '#666'}20`, color: TRANSACTION_TYPE_COLORS[transaction.type] || '#666' }}>
                {TRANSACTION_TYPE_LABELS[transaction.type] || transaction.type}
              </span>
              {transaction.isRecurring && (
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#FF8A3D20', color: '#FF8A3D' }}>Recurring</span>
              )}
            </div>

            <div>
              <p className="text-3xl font-bold" style={{ color: amountColor }}>{amountPrefix}{formatCurrency(transaction.amount)}</p>
            </div>

            <div className="space-y-3">
              <DetailRow label="Description" value={transaction.description} />
              <DetailRow label="Date" value={formatDate(transaction.date)} />
              <DetailRow label="Created" value={formatDateTime(transaction.createdAt)} />
              {transaction.updatedAt !== transaction.createdAt && (
                <DetailRow label="Updated" value={formatDateTime(transaction.updatedAt)} />
              )}
              {transaction.categoryId && <DetailRow label="Category" value={transaction.categoryId} />}
              {transaction.partnerId && <DetailRow label="Partner" value={transaction.partnerId} />}
              {transaction.fromAccountId && <DetailRow label="From Account" value={transaction.fromAccountId} />}
              {transaction.toAccountId && <DetailRow label="To Account" value={transaction.toAccountId} />}
              {transaction.tags && transaction.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {transaction.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {transaction.notes && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Notes</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{transaction.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button onClick={() => router.push(`/transactions/edit?id=${id}`)} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--brand)', color: 'white' }}>
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-80" style={{ backgroundColor: '#ef4444' }}>
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

export default function TransactionDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  return (
    <TransactionProvider>
      <TransactionDetailContent id={id} />
    </TransactionProvider>
  );
}
