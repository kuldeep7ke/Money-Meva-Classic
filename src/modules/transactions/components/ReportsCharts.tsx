'use client';

import { formatCurrency } from '@/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#FF8A3D', '#FFCF9A', '#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

interface ReportsChartsProps {
  reportType: string;
  dailyData: any[];
  categoryData: any[];
  partnerData: any[];
  typeData: any[];
}

export default function ReportsCharts({ reportType, dailyData, categoryData, partnerData, typeData }: ReportsChartsProps) {
  const tooltipStyle = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' };

  if (reportType === 'daily' || reportType === 'monthly') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Income vs Expense</h3>
          {dailyData.length === 0 ? <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /><XAxis dataKey="date" stroke="var(--text-muted)" /><YAxis stroke="var(--text-muted)" /><Tooltip contentStyle={tooltipStyle} /><Legend /><Bar dataKey="income" fill="#22c55e" name="Income" /><Bar dataKey="expense" fill="#ef4444" name="Expense" /></BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Cash Flow Trend</h3>
          {dailyData.length === 0 ? <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /><XAxis dataKey="date" stroke="var(--text-muted)" /><YAxis stroke="var(--text-muted)" /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="income" stroke="#22c55e" fill="#22c55e33" name="Income" /><Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#ef444433" name="Expense" /></AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  if (reportType === 'category') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Spending by Category</h3>
          {categoryData.length === 0 ? <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /><XAxis type="number" stroke="var(--text-muted)" /><YAxis dataKey="name" type="category" width={100} stroke="var(--text-muted)" /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="value" fill="var(--brand)" /></BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Category Distribution</h3>
          {categoryData.length === 0 ? <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={100} fill="#8884d8" dataKey="value">{categoryData.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  if (reportType === 'partner') {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Partner Summary</h3>
          {partnerData.length === 0 ? <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={partnerData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /><XAxis dataKey="name" stroke="var(--text-muted)" /><YAxis stroke="var(--text-muted)" /><Tooltip contentStyle={tooltipStyle} /><Legend /><Bar dataKey="income" fill="#22c55e" name="Income" /><Bar dataKey="expense" fill="#ef4444" name="Expense" /></BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}><h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Partner Details</h3></div>
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {partnerData.length === 0 ? <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No data</div> : partnerData.map((p: any) => (
              <div key={p.name} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ backgroundColor: 'var(--brand)' }}>{p.name.charAt(0)}</div><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</span></div>
                <div className="flex items-center gap-6 text-sm"><span style={{ color: '#22c55e' }}>+{formatCurrency(p.income)}</span><span style={{ color: '#ef4444' }}>-{formatCurrency(p.expense)}</span><span className="font-semibold" style={{ color: p.balance >= 0 ? '#22c55e' : '#ef4444' }}>{formatCurrency(p.balance)}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (reportType === 'type') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Transaction Types</h3>
          {typeData.length === 0 ? <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No data</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={typeData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={100} fill="#8884d8" dataKey="value">{typeData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}><h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Type Breakdown</h3></div>
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {typeData.length === 0 ? <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No data</div> : typeData.map((t: any) => (
              <div key={t.name} className="flex items-center justify-between p-4"><div className="flex items-center gap-3"><span className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color }} /><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</span></div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(t.value)}</span></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
