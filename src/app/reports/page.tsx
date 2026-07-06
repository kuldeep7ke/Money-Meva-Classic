'use client';

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Transaction } from '@/modules/transactions/types';
import { storage } from '@/modules/transactions/services/storage';
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS, TransactionType } from '@/constants';
import { formatCurrency } from '@/utils';
import { exportService } from '@/modules/transactions/services/export';
import Link from 'next/link';
import { Home, Download, Calendar, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Activity, Users, Tag, CalendarRange } from 'lucide-react';

const ReportsCharts = lazy(() => import('@/modules/transactions/components/ReportsCharts'));

type ReportType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'partner' | 'category' | 'type';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [dateRange, setDateRange] = useState({ from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    setTransactions(storage.transactions.getAll());
  }, []);

  const filteredTransactions = useMemo(() => transactions.filter((t) => { const d = new Date(t.date); return d >= new Date(dateRange.from) && d <= new Date(dateRange.to); }), [transactions, dateRange]);

  const stats = useMemo(() => {
    let income = 0, expense = 0;
    filteredTransactions.forEach((t) => { if (t.type === 'income') income += t.amount; if (t.type === 'expense' || t.type === 'split_bills') expense += t.amount; });
    return { income, expense, balance: income - expense, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.forEach((t) => { map[t.type] = (map[t.type] || 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name: TRANSACTION_TYPE_LABELS[name as TransactionType] || name, value, color: TRANSACTION_TYPE_COLORS[name as TransactionType] || '#FF8A3D' }));
  }, [filteredTransactions]);

  const dailyData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    filteredTransactions.forEach((t) => {
      const day = new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (!map[day]) map[day] = { income: 0, expense: 0 };
      if (t.type === 'income') map[day].income += t.amount;
      if (t.type === 'expense' || t.type === 'split_bills') map[day].expense += t.amount;
    });
    return Object.entries(map).map(([date, data]) => ({ date, ...data }));
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.forEach((t) => { const cat = t.categoryId || 'Uncategorized'; map[cat] = (map[cat] || 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [filteredTransactions]);

  const partnerData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    filteredTransactions.forEach((t) => {
      const partner = t.partnerId || 'No Partner';
      if (!map[partner]) map[partner] = { income: 0, expense: 0 };
      if (t.type === 'income') map[partner].income += t.amount;
      if (t.type === 'expense' || t.type === 'split_bills') map[partner].expense += t.amount;
    });
    return Object.entries(map).map(([name, data]) => ({ name, ...data, balance: data.income - data.expense })).sort((a, b) => b.balance - a.balance);
  }, [filteredTransactions]);

  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let from: Date;
    switch (preset) {
      case 'today': from = today; break;
      case 'week': from = new Date(today.setDate(today.getDate() - 7)); break;
      case 'month': from = new Date(today.getFullYear(), today.getMonth(), 1); break;
      case 'quarter': from = new Date(today.getFullYear(), today.getMonth() - 3, 1); break;
      case 'year': from = new Date(today.getFullYear(), 0, 1); break;
      default: from = today;
    }
    setDateRange({ from: from.toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] });
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (format === 'csv') exportService.downloadCSV(filteredTransactions, `report_${reportType}`);
    else if (format === 'excel') exportService.toExcel(filteredTransactions, `report_${reportType}`);
    else exportService.toPDF(filteredTransactions, `report_${reportType}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Reports</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Financial insights and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/reports/financial-year" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: '#6366f1', color: '#6366f1', backgroundColor: '#6366f108' }}>
              <CalendarRange className="w-5 h-5" /> Financial Year
            </Link>
            <Link href="/" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
              <Home className="w-5 h-5" /> Home
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: 'var(--brand)' }}>
                <Download className="w-5 h-5" /> Export
              </button>
              <div className="absolute right-0 top-full mt-1 border rounded-lg shadow-lg z-10 min-w-[120px] hidden group-hover:block" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 text-left hover:opacity-80" style={{ color: 'var(--text-primary)' }}>CSV</button>
                <button onClick={() => handleExport('excel')} className="w-full px-4 py-2 text-left hover:opacity-80" style={{ color: 'var(--text-primary)' }}>Excel</button>
                <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2 text-left hover:opacity-80" style={{ color: 'var(--text-primary)' }}>PDF</button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Date Range:</span>
            </div>
            <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            <div className="flex gap-2">
              {[{ label: 'Today', value: 'today' }, { label: '7 Days', value: 'week' }, { label: 'Month', value: 'month' }, { label: 'Quarter', value: 'quarter' }, { label: 'Year', value: 'year' }].map((p) => (
                <button key={p.value} onClick={() => handleDatePreset(p.value)} className="px-3 py-1.5 text-sm border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{p.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#22c55e' }}><TrendingUp className="w-5 h-5 text-white" /></div>
              <div><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Income</p><p className="text-lg font-bold" style={{ color: '#22c55e' }}>{formatCurrency(stats.income)}</p></div>
            </div>
          </div>
          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#ef4444' }}><TrendingDown className="w-5 h-5 text-white" /></div>
              <div><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Expense</p><p className="text-lg font-bold" style={{ color: '#ef4444' }}>{formatCurrency(stats.expense)}</p></div>
            </div>
          </div>
          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--brand)' }}><Activity className="w-5 h-5 text-white" /></div>
              <div><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Balance</p><p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(stats.balance)}</p></div>
            </div>
          </div>
          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#FFCF9A' }}><BarChart3 className="w-5 h-5" style={{ color: '#1B1B1D' }} /></div>
              <div><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Transactions</p><p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.count}</p></div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex gap-2">
            {([ { value: 'daily', label: 'Daily', icon: Calendar }, { value: 'monthly', label: 'Monthly', icon: BarChart3 }, { value: 'category', label: 'Category', icon: Tag }, { value: 'partner', label: 'Partner', icon: Users }, { value: 'type', label: 'By Type', icon: PieChartIcon } ] as const).map((rt) => (
              <button key={rt.value} onClick={() => setReportType(rt.value as ReportType)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: reportType === rt.value ? 'var(--brand)' : 'var(--bg-secondary)', color: reportType === rt.value ? '#FFFFFF' : 'var(--text-primary)' }}>
                <rt.icon className="w-4 h-4" /> {rt.label}
              </button>
            ))}
          </div>
        </div>

        <Suspense fallback={<div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading charts...</div>}>
          <ReportsCharts reportType={reportType} dailyData={dailyData} categoryData={categoryData} partnerData={partnerData} typeData={typeData} />
        </Suspense>
      </div>
    </div>
  );
}
