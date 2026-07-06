'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { usePinGuard } from '@/components/PinGuard';
import { storage } from '@/modules/transactions/services/storage';
import { accountService } from '@/modules/accounts/services/storage';
import { partnerService } from '@/modules/partners/services/storage';
import { loanService } from '@/modules/loans/services/storage';
import { categoryService } from '@/modules/categories/services/storage';
import { authService } from '@/modules/auth/services/storage';
import { ROLE_LABELS, ROLE_COLORS } from '@/modules/auth/types';
import { formatCurrency } from '@/utils';
import {
      BarChart3, CreditCard, Shield, Archive, Database, Download,
      ArrowLeft, TrendingUp, TrendingDown, Users,
      PieChart, Activity, Clock
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export default function MorePage() {
  const { hasPermission } = useAuth();
  const { requestPin, PinModal } = usePinGuard();
  const headerHidden = useScrollDirection();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const transactions = useMemo(() => storage.transactions.getAll(), [mounted]);
  const accounts = useMemo(() => accountService.getAll(), [mounted]);
  const partners = useMemo(() => partnerService.getAll(), [mounted]);
  const loans = useMemo(() => loanService.getAll(), [mounted]);
  const categories = useMemo(() => categoryService.getAll(), [mounted]);

  const activeLoans = loans.filter((l) => l.status === 'active');
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense' || t.type === 'split_bills').reduce((s, t) => s + t.amount, 0);

  const topCategories = useMemo(() => {
    const catMap = new Map<string, { name: string; color: string; total: number; count: number }>();
    transactions.forEach((t) => {
      if ((t.type === 'expense' || t.type === 'split_bills') && t.categoryId) {
        const cat = categories.find((c) => c.id === t.categoryId);
        if (cat) {
          const existing = catMap.get(t.categoryId);
          if (existing) { existing.total += t.amount; existing.count++; }
          else catMap.set(t.categoryId, { name: cat.name, color: cat.color, total: t.amount, count: 1 });
        }
      }
    });
    return Array.from(catMap.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [transactions, categories]);

  const recentActivity = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [transactions]);

  const users = useMemo(() => authService.getUsers(), [mounted]);

  const userActivity = useMemo(() => {
    return users.map((u) => {
      const userTx = transactions.filter((t) => t.createdBy === u.id || t.updatedBy === u.id);
      const lastTx = userTx.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
      return {
        ...u,
        transactionCount: userTx.length,
        lastActive: lastTx?.updatedAt || u.lastLogin || u.createdAt,
      };
    }).sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
  }, [users, transactions]);

  function getTimeAgo(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 30) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  }

  const tools: { href: string; icon: React.ReactNode; label: string; desc: string; color: string; count?: number }[] = [
    { href: '/reports', icon: <BarChart3 className="w-6 h-6" />, label: 'Reports', desc: 'Financial insights & analytics', color: '#06b6d4' },
    ...(hasPermission('users.read') ? [{ href: '/users', icon: <Shield className="w-6 h-6" />, label: 'Users', desc: 'Manage user accounts & roles', color: '#ef4444', count: users.length }] : []),
    { href: '/archive', icon: <Archive className="w-6 h-6" />, label: 'Archive', desc: 'Restore or permanently delete', color: '#f97316' },
    { href: '/backup', icon: <Database className="w-6 h-6" />, label: 'Backup', desc: 'Export & import your data', color: '#6366f1' },
    { href: '/install', icon: <Download className="w-6 h-6" />, label: 'Install App', desc: 'Add to your device for offline access', color: '#22c55e' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-40 px-4 sm:px-6 py-4 transition-transform duration-300" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', transform: headerHidden ? 'translateY(-100%)' : 'translateY(0)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </Link>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>More</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#22c55e18' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#22c55e' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Income</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(totalIncome)}</p>
          </div>
          <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ef444418' }}>
                <TrendingDown className="w-5 h-5" style={{ color: '#ef4444' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Expense</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: '#ef4444' }}>{formatCurrency(totalExpense)}</p>
          </div>
          <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8b5cf618' }}>
                <Users className="w-5 h-5" style={{ color: '#8b5cf6' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Partners</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: '#8b5cf6' }}>{partners.length}</p>
          </div>
          <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ec489918' }}>
                <CreditCard className="w-5 h-5" style={{ color: '#ec4899' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loans</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: '#ec4899' }}>{activeLoans.length}</p>
          </div>
        </div>

        {topCategories.length > 0 && (
          <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <PieChart className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Top Spending</span>
              </div>
              <Link href="/reports" className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>Details</Link>
            </div>
            <div className="space-y-4">
              {topCategories.map((cat, i) => {
                const pct = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: 'var(--border-color)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recentActivity.length > 0 && (
          <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Recent Activity</span>
              </div>
              <Link href="/transactions" className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>View All</Link>
            </div>
            <div className="space-y-3">
              {recentActivity.map((t) => {
                const isIncome = t.type === 'income';
                return (
                  <div key={t.id} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: isIncome ? '#22c55e18' : '#ef444418' }}>
                        {isIncome ? <TrendingUp className="w-5 h-5" style={{ color: '#22c55e' }} /> : <TrendingDown className="w-5 h-5" style={{ color: '#ef4444' }} />}
                      </div>
                      <div>
                        <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{t.description}</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.date}</p>
                      </div>
                    </div>
                    <span className="text-base font-bold" style={{ color: isIncome ? '#22c55e' : '#ef4444' }}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/reports" className="p-6 rounded-2xl hover:opacity-90 transition-all" style={{ backgroundColor: '#06b6d412', border: '1px solid #06b6d422' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#06b6d418' }}>
                <BarChart3 className="w-7 h-7" style={{ color: '#06b6d4' }} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>View Reports</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Analytics & insights</p>
              </div>
            </div>
          </Link>
          <Link href="/loans" className="p-6 rounded-2xl hover:opacity-90 transition-all" style={{ backgroundColor: '#ec489912', border: '1px solid #ec489922' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#ec489918' }}>
                <CreditCard className="w-7 h-7" style={{ color: '#ec4899' }} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Loan Summary</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{activeLoans.length} active loans</p>
              </div>
            </div>
          </Link>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>Tools & Management</p>
          <div className="space-y-3">
            {tools.map((item, i) => (
              <Link key={i} href={item.href} className="flex items-center gap-4 p-5 rounded-2xl hover:opacity-90 transition-all" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    {item.count !== undefined && (
                      <span className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ backgroundColor: `${item.color}18`, color: item.color }}>{item.count}</span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
                <ArrowLeft className="w-5 h-5 rotate-180" style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        </div>

        {userActivity.length > 0 && (
          <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>User Activity</span>
              </div>
              {hasPermission('users.read') && (
                <Link href="/users" className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>Manage</Link>
              )}
            </div>
            <div className="space-y-3">
              {userActivity.map((u) => {
                const timeAgo = getTimeAgo(u.lastActive);
                return (
                  <div key={u.id} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold" style={{ backgroundColor: ROLE_COLORS[u.role] }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                          <span className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ backgroundColor: `${ROLE_COLORS[u.role]}18`, color: ROLE_COLORS[u.role] }}>{ROLE_LABELS[u.role]}</span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{u.transactionCount} txns · {timeAgo}</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: u.isActive ? '#22c55e' : '#ef4444' }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
      {PinModal}
    </div>
  );
}
