'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { storage } from '@/modules/transactions/services/storage';
import { formatCurrency } from '@/utils';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, ChevronRight, Calendar, BarChart3, CalendarDays, CalendarRange } from 'lucide-react';

type View = 'weekly' | 'monthly' | 'yearly';

export default function FinancialYearPage() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<View>('monthly');

  useEffect(() => { setMounted(true); }, []);

  const transactions = useMemo(() => storage.transactions.getAll(), [mounted]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const fyStartMonth = 3;
  const fyStartYear = currentMonth >= fyStartMonth ? currentYear : currentYear - 1;

  const fyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      const m = d.getMonth();
      const y = d.getFullYear();
      if (m >= fyStartMonth) return y === fyStartYear;
      return y === fyStartYear + 1;
    });
  }, [transactions, fyStartYear]);

  const fyIncome = useMemo(() => fyTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0), [fyTransactions]);
  const fyExpense = useMemo(() => fyTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [fyTransactions]);
  const fyNet = fyIncome - fyExpense;

  const monthlyData = useMemo(() => {
    let carry = 0;
    const months: { label: string; short: string; income: number; expense: number; net: number; carry: number; txCount: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 12; i++) {
      const m = (fyStartMonth + i) % 12;
      const y = fyStartMonth + i >= 12 ? fyStartYear + 1 : fyStartYear;
      const monthTx = fyTransactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === m && d.getFullYear() === y;
      });
      const inc = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const net = inc - exp;
      carry += net;
      months.push({ label: `${monthNames[m]} ${y}`, short: monthNames[m], income: inc, expense: exp, net, carry, txCount: monthTx.length });
    }
    return months;
  }, [fyTransactions, fyStartYear]);

  const weeklyData = useMemo(() => {
    const weeks: { label: string; income: number; expense: number; net: number; txCount: number }[] = [];
    const fyStart = new Date(fyStartYear, fyStartMonth, 1);
    const fyEnd = new Date(fyStartYear + 1, fyStartMonth, 0);
    let weekStart = new Date(fyStart);
    let weekNum = 1;

    while (weekStart <= fyEnd) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekTx = fyTransactions.filter((t) => {
        const d = new Date(t.date);
        return d >= weekStart && d <= weekEnd;
      });
      const inc = weekTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = weekTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const startStr = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      const endStr = `${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
      weeks.push({ label: `Week ${weekNum} (${startStr} - ${endStr})`, income: inc, expense: exp, net: inc - exp, txCount: weekTx.length });
      weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() + 1);
      weekNum++;
    }
    return weeks;
  }, [fyTransactions, fyStartYear]);

  const yearlyComparison = useMemo(() => {
    const years: { label: string; income: number; expense: number; net: number; txCount: number }[] = [];
    const allYears = new Set<number>();
    transactions.forEach((t) => allYears.add(new Date(t.date).getFullYear()));
    Array.from(allYears).sort().forEach((y) => {
      const yearTx = transactions.filter((t) => new Date(t.date).getFullYear() === y);
      const inc = yearTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = yearTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      years.push({ label: `FY ${y}-${(y + 1).toString().slice(-2)}`, income: inc, expense: exp, net: inc - exp, txCount: yearTx.length });
    });
    return years;
  }, [transactions]);

  if (!mounted) return null;

  const data = view === 'weekly' ? weeklyData : view === 'monthly' ? monthlyData : yearlyComparison;
  const maxAbs = Math.max(...data.map((d) => Math.max(Math.abs(d.income), Math.abs(d.expense), Math.abs(d.net))), 1);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/reports" className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Financial Year</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Apr {fyStartYear} — Mar {fyStartYear + 1}</p>
          </div>
        </div>

        {/* FY Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Income</span>
            </div>
            <p className="text-lg sm:text-xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(fyIncome)}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4" style={{ color: '#ef4444' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Expense</span>
            </div>
            <p className="text-lg sm:text-xl font-bold" style={{ color: '#ef4444' }}>{formatCurrency(fyExpense)}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4" style={{ color: fyNet >= 0 ? '#22c55e' : '#ef4444' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Net Profit</span>
            </div>
            <p className="text-lg sm:text-xl font-bold" style={{ color: fyNet >= 0 ? '#22c55e' : '#ef4444' }}>{formatCurrency(fyNet)}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Transactions</span>
            </div>
            <p className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{fyTransactions.length}</p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          {[
            { value: 'weekly' as View, label: 'Weekly', icon: <CalendarDays className="w-4 h-4" /> },
            { value: 'monthly' as View, label: 'Monthly', icon: <Calendar className="w-4 h-4" /> },
            { value: 'yearly' as View, label: 'Yearly', icon: <CalendarRange className="w-4 h-4" /> },
          ].map((tab) => (
            <button key={tab.value} onClick={() => setView(tab.value)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: view === tab.value ? 'var(--brand)' : 'transparent', color: view === tab.value ? 'white' : 'var(--text-muted)' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{view === 'weekly' ? 'Weekly' : view === 'monthly' ? 'Monthly' : 'Yearly'} Breakdown</h3>
          <div className="space-y-3">
            {data.map((d, i) => {
              const incPct = Math.abs(d.income) / maxAbs * 100;
              const expPct = Math.abs(d.expense) / maxAbs * 100;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.label}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span style={{ color: '#22c55e' }}>+{formatCurrency(d.income)}</span>
                      <span style={{ color: '#ef4444' }}>-{formatCurrency(d.expense)}</span>
                      <span className="font-bold" style={{ color: d.net >= 0 ? '#22c55e' : '#ef4444' }}>{formatCurrency(d.net)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 h-3">
                    <div className="rounded-l" style={{ width: `${incPct}%`, backgroundColor: '#22c55e', minWidth: d.income > 0 ? '2px' : '0' }} />
                    <div className="rounded-r" style={{ width: `${expPct}%`, backgroundColor: '#ef4444', minWidth: d.expense > 0 ? '2px' : '0' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} /> Income</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} /> Expense</div>
          </div>
        </div>

        {/* Carry Forward Table */}
        {view === 'monthly' && (
          <div className="p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Monthly Carry Forward</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th className="text-left py-3 pr-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Month</th>
                    <th className="text-right py-3 px-4 font-semibold" style={{ color: '#22c55e' }}>Income</th>
                    <th className="text-right py-3 px-4 font-semibold" style={{ color: '#ef4444' }}>Expense</th>
                    <th className="text-right py-3 px-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Net</th>
                    <th className="text-right py-3 pl-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Carry Forward</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((row, i) => {
                    const isCurrentMonth = i === monthlyData.findIndex((r) => r.short === ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentMonth]);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isCurrentMonth ? 'var(--brand)08' : 'transparent' }}>
                        <td className="py-3 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>{row.label}</td>
                        <td className="py-3 px-4 text-right" style={{ color: '#22c55e' }}>{formatCurrency(row.income)}</td>
                        <td className="py-3 px-4 text-right" style={{ color: '#ef4444' }}>{formatCurrency(row.expense)}</td>
                        <td className="py-3 px-4 text-right font-bold" style={{ color: row.net >= 0 ? '#22c55e' : '#ef4444' }}>
                          {row.net >= 0 ? '+' : ''}{formatCurrency(row.net)}
                        </td>
                        <td className="py-3 pl-4 text-right font-bold" style={{ color: row.carry >= 0 ? '#22c55e' : '#ef4444' }}>
                          {formatCurrency(row.carry)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: '2px solid var(--border-color)', fontWeight: 700 }}>
                    <td className="py-3 pr-4" style={{ color: 'var(--text-primary)' }}>Total</td>
                    <td className="py-3 px-4 text-right" style={{ color: '#22c55e' }}>{formatCurrency(fyIncome)}</td>
                    <td className="py-3 px-4 text-right" style={{ color: '#ef4444' }}>{formatCurrency(fyExpense)}</td>
                    <td className="py-3 px-4 text-right" style={{ color: fyNet >= 0 ? '#22c55e' : '#ef4444' }}>{formatCurrency(fyNet)}</td>
                    <td className="py-3 pl-4 text-right" style={{ color: fyNet >= 0 ? '#22c55e' : '#ef4444' }}>{formatCurrency(fyNet)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Yearly Comparison */}
        {view === 'yearly' && yearlyComparison.length > 1 && (
          <div className="p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Year-over-Year Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th className="text-left py-3 pr-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Year</th>
                    <th className="text-right py-3 px-4 font-semibold" style={{ color: '#22c55e' }}>Income</th>
                    <th className="text-right py-3 px-4 font-semibold" style={{ color: '#ef4444' }}>Expense</th>
                    <th className="text-right py-3 px-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Net</th>
                    <th className="text-right py-3 pl-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Txns</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyComparison.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="py-3 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>{row.label}</td>
                      <td className="py-3 px-4 text-right" style={{ color: '#22c55e' }}>{formatCurrency(row.income)}</td>
                      <td className="py-3 px-4 text-right" style={{ color: '#ef4444' }}>{formatCurrency(row.expense)}</td>
                      <td className="py-3 px-4 text-right font-bold" style={{ color: row.net >= 0 ? '#22c55e' : '#ef4444' }}>
                        {row.net >= 0 ? '+' : ''}{formatCurrency(row.net)}
                      </td>
                      <td className="py-3 pl-4 text-right" style={{ color: 'var(--text-muted)' }}>{row.txCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
