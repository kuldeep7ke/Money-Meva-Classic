'use client';

import { TransactionProvider, useTransactions } from '@/modules/transactions/hooks/useTransactions';
import { TransactionForm } from '@/modules/transactions/components/TransactionForm';
import { useRouter } from 'next/navigation';

function NewTransactionContent() {
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const handleSubmit = (data: Parameters<typeof addTransaction>[0]) => {
    addTransaction(data);
    router.push('/transactions');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <TransactionForm onSubmit={handleSubmit} onCancel={() => router.back()} />
        </div>
      </div>
    </div>
  );
}

export default function NewTransactionPage() {
  return (
    <TransactionProvider>
      <NewTransactionContent />
    </TransactionProvider>
  );
}
