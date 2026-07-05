'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle, ArrowDownCircle, PiggyBank, TrendingUp, Target, Download, Clock3 } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMonthlySummary, getTransactions, getGoals, getAllArchivedItems } from '@/lib/store';
import { exportSummaryPDF, exportSummaryExcel } from '@/lib/export';

export default function SummaryPage() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, saving: 0, investment: 0 });

  useEffect(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const sm = getMonthlySummary(d.getFullYear(), d.getMonth());
      months.push({ month: d.toLocaleString('default', { month: 'short' }), ...sm });
    }
    setMonthlyData(months);
    setGoals(getGoals());

    const all = getTransactions();
    setTotals({
      income: all.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      saving: all.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0),
      investment: all.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0),
    });

    const transactionHistory = all.map(t => ({
      id: `tx-${t.id}`,
      date: t.createdAt || t.date,
      action: 'Added transaction',
      label: t.description || t.category,
      subtitle: `${t.type} · ${t.category}`,
      amount: t.amount,
    }));
    const archiveHistory = getAllArchivedItems().map(item => ({
      id: `archive-${item.type}-${item.id}`,
      date: item.deletedAt,
      action: 'Archived item',
      label: item.label,
      subtitle: item.subtitle,
      amount: item.amount,
    }));
    setHistory([...transactionHistory, ...archiveHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Monthly Summary</h1>
            <p className="text-slate-500 dark:text-slate-400">Your P&L, goals, and savings at a glance.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => exportSummaryPDF(monthlyData)}><Download className="h-4 w-4" /> PDF</Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => exportSummaryExcel(monthlyData)}><Download className="h-4 w-4" /> Excel</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Income', value: totals.income, icon: ArrowUpCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
            { label: 'Total Expenses', value: totals.expense, icon: ArrowDownCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
            { label: 'Total Savings', value: totals.saving, icon: PiggyBank, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
            { label: 'Investments', value: totals.investment, icon: TrendingUp, color: 'text-brand dark:text-brand-secondary', bg: 'bg-brand-secondary dark:bg-brand-muted/30' },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-[#2A2522] p-5 rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("p-2 rounded-lg", item.bg)}><item.icon className={cn("h-5 w-5", item.color)} /></div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#2A2522] p-6 rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Profit & Loss Trend</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
                <Bar dataKey="saving" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Savings" />
                <Bar dataKey="investment" fill="#6366f1" radius={[4, 4, 0, 0]} name="Investments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2A2522] p-6 rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Goal Progress</h2>
            <Target className="h-5 w-5 text-brand dark:text-brand-secondary" />
          </div>
          {goals.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No goals set yet. Add goals in Settings.</p>
          ) : (
            <div className="space-y-6">
              {goals.map(g => {
                const pct = Math.min(Math.round((g.saved / g.target) * 100), 100);
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{g.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(g.saved)} / {formatCurrency(g.target)}</p>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-brand-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-brand")} style={{ width: `${pct}%` }}></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-slate-400 dark:text-slate-500">{pct}% achieved</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#2A2522] p-6 rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">User Activity History</h2>
            <Clock3 className="h-5 w-5 text-brand dark:text-brand-secondary" />
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {history.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.action}: {item.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleString('en-IN')} · {item.subtitle}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">{formatCurrency(item.amount || 0)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
