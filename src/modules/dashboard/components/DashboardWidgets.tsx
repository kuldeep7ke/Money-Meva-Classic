'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { storage } from '@/modules/transactions/services/storage';
import { partnerService } from '@/modules/partners/services/storage';
import { loanService } from '@/modules/loans/services/storage';
import { accountService } from '@/modules/accounts/services/storage';
import { recurringService } from '@/modules/transactions/services/recurring';
import { LOAN_TYPES } from '@/modules/loans/types';
import { formatCurrency } from '@/utils';
import {
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight,
  ArrowRight, Clock, Bell, X, ChevronRight, Plus, RefreshCw, Target,
  PiggyBank, Landmark, CreditCard, AlertCircle, CalendarClock, FileWarning
} from 'lucide-react';

export default function DashboardWidgets() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => { setMounted(true); }, []);

  const transactions = useMemo(() => storage.transactions.getAll(), [mounted]);
  const accounts = useMemo(() => accountService.getAll(), [mounted]);
  const partners = useMemo(() => partnerService.getAll(), [mounted]);
  const loans = useMemo(() => loanService.getAll(), [mounted]);

  const totalIncome = useMemo(() => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpense;
  const totalAccountBalance = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts]);

  const recentTx = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const activeLoans = useMemo(() => loans.filter((l) => l.status === 'active'), [loans]);
  const loanStats = useMemo(() => loanService.getStats(), [loans]);
  const overdueCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return activeLoans.filter((l) => l.nextPaymentDate < today).length;
  }, [activeLoans]);

  const upcomingRecurring = useMemo(() => recurringService.getUpcoming(7), [transactions]);
  const recurringStats = useMemo(() => recurringService.getStats(), [transactions]);

  const investments = useMemo(() => activeLoans.filter((l) => l.type === 'investment'), [activeLoans]);
  const savings = useMemo(() => activeLoans.filter((l) => l.type === 'savings'), [activeLoans]);
  const goals = useMemo(() => activeLoans.filter((l) => l.type === 'emi'), [activeLoans]);

  const notifications = useMemo(() => {
    const notifs: { id: string; type: 'danger' | 'warning' | 'info'; text: string; href: string; icon: React.ReactNode }[] = [];

    if (overdueCount > 0) {
      notifs.push({ id: 'overdue', type: 'danger', text: `${overdueCount} overdue EMI payment(s)`, href: '/loans', icon: <AlertCircle className="w-5 h-5" /> });
    }

    if (upcomingRecurring.length > 0) {
      notifs.push({ id: 'recurring', type: 'info', text: `${upcomingRecurring.length} recurring payment(s) due this week`, href: '/transactions', icon: <CalendarClock className="w-5 h-5" /> });
    }

    const today = new Date().toISOString().split('T')[0];
    const overdueLoans = activeLoans.filter((l) => l.nextPaymentDate < today);
    overdueLoans.forEach((l) => {
      notifs.push({ id: `emi-${l.id}`, type: 'danger', text: `EMI overdue: ${l.title} (${formatCurrency(l.emiAmount)})`, href: '/loans', icon: <FileWarning className="w-5 h-5" /> });
    });

    const upcomingLoans = activeLoans.filter((l) => {
      const d = new Date(l.nextPaymentDate);
      const now = new Date();
      const diff = d.getTime() - now.getTime();
      return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
    });
    upcomingLoans.forEach((l) => {
      notifs.push({ id: `upcoming-${l.id}`, type: 'warning', text: `EMI due soon: ${l.title} on ${l.nextPaymentDate}`, href: '/loans', icon: <Clock className="w-5 h-5" /> });
    });

    return notifs.filter((n) => !dismissed.includes(n.id));
  }, [overdueCount, upcomingRecurring, activeLoans, dismissed]);

  if (!mounted) return null;

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22c55e18' }}>
              <ArrowUpRight className="w-4 h-4" style={{ color: '#22c55e' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Income</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(totalIncome)}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ef444418' }}>
              <ArrowDownRight className="w-4 h-4" style={{ color: '#ef4444' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Expense</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#ef4444' }}>{formatCurrency(totalExpense)}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: balance >= 0 ? '#22c55e18' : '#ef444418' }}>
              <Wallet className="w-4 h-4" style={{ color: balance >= 0 ? '#22c55e' : '#ef4444' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Balance</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: balance >= 0 ? '#22c55e' : '#ef4444' }}>{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link key={n.id} href={n.href} className="flex items-center justify-between p-3 sm:p-4 rounded-xl" style={{ backgroundColor: n.type === 'danger' ? '#ef444412' : n.type === 'warning' ? '#f59e0b12' : '#3b82f612', border: `1px solid ${n.type === 'danger' ? '#ef444422' : n.type === 'warning' ? '#f59e0b22' : '#3b82f622'}` }}>
              <div className="flex items-center gap-3">
                <span style={{ color: n.type === 'danger' ? '#ef4444' : n.type === 'warning' ? '#f59e0b' : '#3b82f6' }}>{n.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.text}</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed((d) => [...d, n.id]); }} className="p-1"><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Accounts */}
      {accounts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Accounts</span>
            <Link href="/accounts" className="text-sm font-medium" style={{ color: 'var(--brand)' }}>View All</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {accounts.slice(0, 4).map((a) => (
              <Link key={a.id} href={`/accounts/ledger?id=${a.id}`} className="p-3 rounded-lg hover:opacity-80" style={{ backgroundColor: `${a.color}10` }}>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-muted)' }}>{a.name}</p>
                <p className="text-base sm:text-lg font-bold mt-1" style={{ color: a.balance >= 0 ? '#22c55e' : '#ef4444' }}>{formatCurrency(a.balance)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Goals, Investments, Savings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/loans" className="p-4 sm:p-5 rounded-xl hover:opacity-90 transition-all" style={{ backgroundColor: '#ec489910', border: '1px solid #ec489922' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ec489918' }}>
              <Target className="w-5 h-5" style={{ color: '#ec4899' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Goals</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{goals.length} active</p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#ec4899' }}>
            {formatCurrency(goals.reduce((s, l) => s + l.principalAmount, 0))}
          </p>
          {goals.length > 0 && (
            <div className="mt-2">
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#ec489920' }}>
                <div className="h-full rounded-full" style={{ backgroundColor: '#ec4899', width: `${Math.min(100, goals.reduce((s, l) => s + l.paidEmis, 0) / Math.max(1, goals.reduce((s, l) => s + l.totalEmis, 0)) * 100)}%` }} />
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{goals.reduce((s, l) => s + l.paidEmis, 0)}/{goals.reduce((s, l) => s + l.totalEmis, 0)} EMIs paid</p>
            </div>
          )}
        </Link>

        <Link href="/loans" className="p-4 sm:p-5 rounded-xl hover:opacity-90 transition-all" style={{ backgroundColor: '#06b6d410', border: '1px solid #06b6d422' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#06b6d418' }}>
              <Landmark className="w-5 h-5" style={{ color: '#06b6d4' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Investments</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{investments.length} active</p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#06b6d4' }}>
            {formatCurrency(loanStats.totalInvested)}
          </p>
          {investments.length > 0 && (
            <div className="mt-2 space-y-1">
              {investments.slice(0, 2).map((inv) => (
                <p key={inv.id} className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{inv.title}</p>
              ))}
            </div>
          )}
        </Link>

        <Link href="/loans" className="p-4 sm:p-5 rounded-xl hover:opacity-90 transition-all" style={{ backgroundColor: '#10b98110', border: '1px solid #10b98122' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b98118' }}>
              <PiggyBank className="w-5 h-5" style={{ color: '#10b981' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Savings</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{savings.length} active</p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#10b981' }}>
            {formatCurrency(loanStats.totalSaved)}
          </p>
          {savings.length > 0 && (
            <div className="mt-2 space-y-1">
              {savings.slice(0, 2).map((sv) => (
                <p key={sv.id} className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{sv.title}</p>
              ))}
            </div>
          )}
        </Link>
      </div>

      {/* Recurring Dues */}
      <div className="p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" style={{ color: '#6366f1' }} />
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Recurring Dues</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#6366f118', color: '#6366f1' }}>{recurringStats.activeCount} active</span>
            <Link href="/transactions" className="text-sm font-medium" style={{ color: 'var(--brand)' }}>View All</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#6366f110' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Monthly Estimate</p>
            <p className="text-base sm:text-lg font-bold mt-0.5" style={{ color: '#6366f1' }}>{formatCurrency(recurringStats.monthlyEstimate)}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#ef444410' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Due This Week</p>
            <p className="text-base sm:text-lg font-bold mt-0.5" style={{ color: '#ef4444' }}>{upcomingRecurring.length}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#22c55e10' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>EMI Due Monthly</p>
            <p className="text-base sm:text-lg font-bold mt-0.5" style={{ color: '#22c55e' }}>{formatCurrency(loanStats.monthlyEmiDue)}</p>
          </div>
        </div>
        {upcomingRecurring.length > 0 && (
          <div className="space-y-2">
            {upcomingRecurring.slice(0, 4).map((t) => (
              <div key={t.id + t.date} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: t.type === 'income' ? '#22c55e18' : '#ef444418' }}>
                    {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" style={{ color: '#22c55e' }} /> : <ArrowDownRight className="w-4 h-4" style={{ color: '#ef4444' }} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.description}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.date} · {t.recurringFrequency}</p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: t.type === 'income' ? '#22c55e' : '#ef4444' }}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
        {upcomingRecurring.length === 0 && (
          <p className="text-center text-sm py-4" style={{ color: 'var(--text-muted)' }}>No upcoming recurring dues</p>
        )}
      </div>

      {/* Recent Activity + Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Recent Activity</span>
            <Link href="/transactions" className="text-sm font-medium" style={{ color: 'var(--brand)' }}>View All</Link>
          </div>
          <div className="space-y-3">
            {recentTx.length > 0 ? recentTx.map((t) => {
              const isIncome = t.type === 'income';
              const fromAcc = t.fromAccountId ? accounts.find((a) => a.id === t.fromAccountId) : null;
              const toAcc = t.toAccountId ? accounts.find((a) => a.id === t.toAccountId) : null;
              return (
                <div key={t.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: isIncome ? '#22c55e18' : '#ef444418' }}>
                      {isIncome ? <ArrowUpRight className="w-4 h-4" style={{ color: '#22c55e' }} /> : <ArrowDownRight className="w-4 h-4" style={{ color: '#ef4444' }} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.description}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t.date}
                        {fromAcc && !toAcc && ` · ${fromAcc.name}`}
                        {!fromAcc && toAcc && ` · ${toAcc.name}`}
                        {fromAcc && toAcc && (
                          <> · <span style={{ color: fromAcc.color }}>{fromAcc.name}</span> → <span style={{ color: toAcc.color }}>{toAcc.name}</span></>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: isIncome ? '#22c55e' : '#ef4444' }}>
                    {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              );
            }) : (
              <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                <p className="text-sm">No transactions yet</p>
                <Link href="/transactions/new" className="inline-flex items-center gap-1 mt-2 text-sm font-medium" style={{ color: 'var(--brand)' }}>
                  <Plus className="w-4 h-4" /> Add First
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Overview</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Accounts', value: formatCurrency(totalAccountBalance), count: accounts.length, color: '#3b82f6', href: '/accounts' },
              { label: 'Partners', value: null, count: partners.length, color: '#8b5cf6', href: '/partners' },
              { label: 'Active Loans', value: null, count: activeLoans.length, color: '#ec4899', href: '/loans' },
              { label: 'Transactions', value: null, count: transactions.length, color: 'var(--brand)', href: '/transactions' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>}
                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${item.color}15`, color: item.color }}>{item.count}</span>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
