'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Account } from '@/modules/accounts/types';
import { accountService } from '@/modules/accounts/services/storage';
import { storage } from '@/modules/transactions/services/storage';
import { Transaction } from '@/modules/transactions/types';
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS } from '@/constants';
import { formatCurrency, formatDate } from '@/utils';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';

function LedgerContent() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get('id');
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!accountId) return;
    const acc = accountService.getById(accountId);
    if (acc) setAccount(acc);
    const allTx = storage.transactions.getAll();
    const filtered = allTx.filter((t) => t.fromAccountId === accountId || t.toAccountId === accountId);
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(filtered);
  }, [accountId]);

  const runningBalance = useMemo(() => {
    const sorted = [...transactions].reverse();
    let balance = 0;
    const balances: Record<string, number> = {};
    sorted.forEach((t) => {
      if (t.toAccountId === accountId) balance += t.amount;
      if (t.fromAccountId === accountId) balance -= t.amount;
      balances[t.id] = balance;
    });
    return balances;
  }, [transactions, accountId]);

  if (!accountId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>No account selected. <Link href="/accounts" className="underline" style={{ color: 'var(--brand)' }}>Go to Accounts</Link></p>
      </div>
    );
  }

  const getFlowInfo = (t: Transaction) => {
    const isFrom = t.fromAccountId === accountId;
    const isTo = t.toAccountId === accountId;
    if (isFrom && isTo) return { label: 'Internal Transfer', color: '#3b82f6', icon: <ArrowLeftRight className="w-3.5 h-3.5" />, sign: 0 };
    if (isTo) return { label: 'Money In', color: '#22c55e', icon: <ArrowDownRight className="w-3.5 h-3.5" />, sign: 1 };
    return { label: 'Money Out', color: '#ef4444', icon: <ArrowUpRight className="w-3.5 h-3.5" />, sign: -1 };
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/accounts" className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{account?.name || 'Account'} — Ledger</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{transactions.length} transaction(s)</p>
          </div>
        </div>

        {account && (
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Current Balance</p>
                <p className="text-2xl font-bold" style={{ color: account.balance >= 0 ? '#22c55e' : '#ef4444' }}>{formatCurrency(account.balance)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Account Type</p>
                <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{account.type}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {transactions.map((t) => {
            const flow = getFlowInfo(t);
            const bal = runningBalance[t.id] || 0;
            const typeColor = TRANSACTION_TYPE_COLORS[t.type];
            return (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${flow.color}18` }}>
                    <span style={{ color: flow.color }}>{flow.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.description}</p>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white" style={{ backgroundColor: typeColor }}>{TRANSACTION_TYPE_LABELS[t.type]}</span>
                      <span>{formatDate(t.date)}</span>
                      <span>·</span>
                      <span style={{ color: flow.color }}>{flow.label}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: flow.sign >= 0 ? '#22c55e' : '#ef4444' }}>
                    {flow.sign > 0 ? '+' : flow.sign < 0 ? '-' : ''}{formatCurrency(t.amount)}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Bal: {formatCurrency(bal)}</p>
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <p>No transactions for this account</p>
              <p className="text-xs mt-1">Transactions will appear here when you select this account as source or destination</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LedgerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>Loading...</div>}>
      <LedgerContent />
    </Suspense>
  );
}
