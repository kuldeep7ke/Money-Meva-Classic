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
import { auditService } from '@/modules/transactions/services/audit';
import { authService } from '@/modules/auth/services/storage';
import { ROLE_LABELS, ROLE_COLORS } from '@/modules/auth/types';
import { formatCurrency } from '@/utils';
import {
      Tag, BarChart3, CreditCard, Shield, Archive, FileText, Database,
      ArrowLeft, ChevronRight, TrendingUp, TrendingDown, Users, Wallet,
      PieChart, Activity, Clock, AlertTriangle, User as UserIcon
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export default function MorePage() {
  const { hasPermission } = useAuth();
  const { requestPin, PinModal } = usePinGuard();
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
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const topCategories = useMemo(() => {
    const catMap = new Map<string, { name: string; color: string; total: number; count: number }>();
    transactions.forEach((t) => {
      if (t.type === 'expense' && t.categoryId) {
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
  const auditLogs = useMemo(() => auditService.getLogs().slice(0, 10), [mounted]);

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
    { href: '/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Reports', desc: 'Financial insights & analytics', color: '#06b6d4' },
    ...(hasPermission('users.read') ? [{ href: '/users', icon: <Shield className="w-5 h-5" />, label: 'Users', desc: 'Manage user accounts & roles', color: '#ef4444', count: users.length }] : []),
    { href: '/backup', icon: <Database className="w-5 h-5" />, label: 'Backup', desc: 'Export & import your data', color: '#6366f1' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-40 px-4 py-3" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          </Link>
          <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>More</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#22c55e18' }}>
                <TrendingUp className="w-3 h-3" style={{ color: '#22c55e' }} />
              </div>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Income</span>
            </div>
            <p className="text-sm font-bold" style={{ color: '#22c55e' }}>{formatCurrency(totalIncome)}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#ef444418' }}>
                <TrendingDown className="w-3 h-3" style={{ color: '#ef4444' }} />
              </div>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Expense</span>
            </div>
            <p className="text-sm font-bold" style={{ color: '#ef4444' }}>{formatCurrency(totalExpense)}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#8b5cf618' }}>
                <Users className="w-3 h-3" style={{ color: '#8b5cf6' }} />
              </div>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Partners</span>
            </div>
            <p className="text-sm font-bold" style={{ color: '#8b5cf6' }}>{partners.length}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#ec489918' }}>
                <CreditCard className="w-3 h-3" style={{ color: '#ec4899' }} />
              </div>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Loans</span>
            </div>
            <p className="text-sm font-bold" style={{ color: '#ec4899' }}>{activeLoans.length}</p>
          </div>
        </div>

        {topCategories.length > 0 && (
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Top Spending Categories</span>
              </div>
              <Link href="/reports" className="text-[11px] font-medium" style={{ color: 'var(--brand)' }}>Details</Link>
            </div>
            <div className="space-y-2">
              {topCategories.map((cat, i) => {
                const pct = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-color)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recentActivity.length > 0 && (
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Recent Activity</span>
              </div>
              <Link href="/transactions" className="text-[11px] font-medium" style={{ color: 'var(--brand)' }}>View All</Link>
            </div>
            <div className="space-y-2">
              {recentActivity.map((t) => {
                const isIncome = t.type === 'income';
                return (
                  <div key={t.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: isIncome ? '#22c55e18' : '#ef444418' }}>
                        {isIncome ? <TrendingUp className="w-3 h-3" style={{ color: '#22c55e' }} /> : <TrendingDown className="w-3 h-3" style={{ color: '#ef4444' }} />}
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{t.description}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.date}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold" style={{ color: isIncome ? '#22c55e' : '#ef4444' }}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {auditLogs.length > 0 && (
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Recent Changes</span>
              </div>
              <Link href="/audit" className="text-[11px] font-medium" style={{ color: 'var(--brand)' }}>View All</Link>
            </div>
            <div className="space-y-2">
              {auditLogs.slice(0, 5).map((log) => {
                const actionColor = log.action === 'Created' ? '#22c55e' : log.action === 'Updated' ? '#f59e0b' : log.action === 'Deleted' ? '#ef4444' : '#3b82f6';
                return (
                  <div key={log.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: actionColor }} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{log.details || log.action}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{log.entity} · {new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: `${actionColor}18`, color: actionColor }}>{log.action}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/reports" className="p-4 rounded-xl hover:opacity-90 transition-all" style={{ backgroundColor: '#06b6d412', border: '1px solid #06b6d422' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#06b6d418' }}>
                <BarChart3 className="w-5 h-5" style={{ color: '#06b6d4' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>View Reports</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Daily, monthly, category-wise analytics</p>
              </div>
            </div>
          </Link>
          <Link href="/loans" className="p-4 rounded-xl hover:opacity-90 transition-all" style={{ backgroundColor: '#ec489912', border: '1px solid #ec489922' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ec489918' }}>
                <CreditCard className="w-5 h-5" style={{ color: '#ec4899' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Loan Summary</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{activeLoans.length} active loans & EMIs</p>
              </div>
            </div>
          </Link>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Tools & Management</p>
          <div className="space-y-2">
            {tools.map((item, i) => (
              <Link key={i} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:opacity-90 transition-all" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    {item.count !== undefined && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: `${item.color}18`, color: item.color }}>{item.count}</span>
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        </div>

        {userActivity.length > 0 && (
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>User Activity</span>
              </div>
              {hasPermission('users.read') && (
                <Link href="/users" className="text-[11px] font-medium" style={{ color: 'var(--brand)' }}>Manage</Link>
              )}
            </div>
            <div className="space-y-2">
              {userActivity.map((u) => {
                const timeAgo = getTimeAgo(u.lastActive);
                return (
                  <div key={u.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: ROLE_COLORS[u.role] }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                          <span className="text-[8px] px-1 py-0.5 rounded font-bold" style={{ backgroundColor: `${ROLE_COLORS[u.role]}18`, color: ROLE_COLORS[u.role] }}>{ROLE_LABELS[u.role]}</span>
                        </div>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{u.transactionCount} txns · {timeAgo}</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: u.isActive ? '#22c55e' : '#ef4444' }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {hasPermission('danger.clean_all') && (
          <button onClick={() => requestPin(() => router.push('/danger'))} className="w-full flex items-center gap-3 p-3 rounded-xl hover:opacity-90 transition-all text-left" style={{ backgroundColor: '#ef444410', border: '1px solid #ef444422' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ef444418' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#ef4444' }}>Danger Zone</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Clear data, reset settings</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#ef4444' }} />
          </button>
        )}
      </main>
      {PinModal}
    </div>
  );
}
