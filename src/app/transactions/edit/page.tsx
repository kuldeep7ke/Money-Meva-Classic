'use client';

import { useSearchParams } from 'next/navigation';
import { TransactionProvider, useTransactions } from '@/modules/transactions/hooks/useTransactions';
import { TransactionForm } from '@/modules/transactions/components/TransactionForm';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

function EditTransactionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { getTransactionById, updateTransaction } = useTransactions();

  const transaction = id ? getTransactionById(id) : undefined;

  const handleSubmit = (data: Parameters<typeof updateTransaction>[1]) => {
    if (id) {
      updateTransaction(id, data);
      router.push('/transactions');
    }
  };

  if (!transaction) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="p-6 rounded-lg border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <p style={{ color: 'var(--text-muted)' }}>Transaction not found</p>
            <button
              onClick={() => router.push('/transactions')}
              className="mt-4 px-4 py-2 text-white rounded-lg"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              Back to Transactions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <TransactionForm
            transaction={transaction}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </div>
      </div>
    </div>
  );
}

export default function EditTransactionPage() {
  return (
    <TransactionProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <EditTransactionContent />
      </Suspense>
    </TransactionProvider>
  );
}
