'use client';

import { useState, useEffect } from 'react';
import { recurringService } from '@/modules/transactions/services/recurring';
import { Transaction } from '@/modules/transactions/types';
import { formatCurrency, formatDate } from '@/utils';
import { RefreshCw, Calendar, Clock, Play, Pause } from 'lucide-react';

export default function RecurringPanel() {
  const [upcoming, setUpcoming] = useState<Transaction[]>([]);
  const [generated, setGenerated] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ activeCount: 0, monthlyEstimate: 0, upcoming: [] as Transaction[] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUpcoming(recurringService.getUpcoming(30));
    setStats(recurringService.getStats());
  };

  const handleGenerate = () => {
    setLoading(true);
    const result = recurringService.generateDue('user-1', 'default');
    setGenerated(result);
    loadData();
    setLoading(false);
  };

  if (stats.activeCount === 0) {
    return (
      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5" style={{ color: 'var(--brand)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recurring Transactions</h2>
        </div>
        <p className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
          No recurring transactions yet. Mark a transaction as recurring when creating it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Active</span>
          </div>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.activeCount}</p>
        </div>
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Monthly Estimate</span>
          </div>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--brand)' }}>{formatCurrency(stats.monthlyEstimate)}</p>
        </div>
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Due This Week</span>
          </div>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.upcoming.length}</p>
        </div>
      </div>

      <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recurring Transactions</h2>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            <Play className="w-4 h-4" />
            {loading ? 'Generating...' : 'Generate Due'}
          </button>
        </div>

        {generated.length > 0 && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#22c55e22', border: '1px solid #22c55e' }}>
            <p style={{ color: '#22c55e' }}>Generated {generated.length} transaction(s)</p>
          </div>
        )}

        <div className="space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No upcoming transactions</p>
          ) : (
            upcoming.map((t) => (
              <div key={t.id + t.date} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand)' }}>
                    <RefreshCw className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{t.description}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {t.recurringFrequency?.charAt(0).toUpperCase() + (t.recurringFrequency?.slice(1) || '')} · Due {t.date}
                    </p>
                  </div>
                </div>
                <span className="font-semibold" style={{ color: t.type === 'income' ? '#22c55e' : '#ef4444' }}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
