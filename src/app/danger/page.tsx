'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { storage } from '@/modules/transactions/services/storage';
import { accountService } from '@/modules/accounts/services/storage';
import { categoryService } from '@/modules/categories/services/storage';
import { partnerService } from '@/modules/partners/services/storage';
import { loanService } from '@/modules/loans/services/storage';
import { auditService } from '@/modules/transactions/services/audit';
import { authService } from '@/modules/auth/services/storage';
import { archiveService } from '@/modules/archive/services/storage';
import { idbStorage } from '@/lib/idbStorage';
import MathCaptcha from '@/components/MathCaptcha';
import { AlertTriangle, Trash2, Shield, ArrowLeft, CheckCircle, RotateCcw, Users, Tag, FolderOpen, HandCoins, CreditCard, Database, FileText, Archive } from 'lucide-react';
import Link from 'next/link';

type ActionState = 'idle' | 'captcha' | 'done';

interface DangerAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  confirmWord: string;
  deleteItems: string[];
  preserveItems?: string[];
  action: () => void;
}

export default function DangerZonePage() {
  const { user, hasPermission, refreshUser } = useAuth();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [actionStep, setActionStep] = useState<ActionState>('idle');
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const canDelete = hasPermission('danger.clean_all');

  if (!canDelete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 mx-auto" style={{ color: '#ef4444' }} />
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Access Denied</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Only administrators can access the Danger Zone.</p>
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--brand)' }}>Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const resetAction = () => {
    setActiveAction(null);
    setActionStep('idle');
    setCaptchaVerified(false);
  };

  const startAction = (id: string) => {
    setActiveAction(id);
    setActionStep('captcha');
    setCaptchaVerified(false);
  };

  const executeAction = (action: DangerAction) => {
    action.action();
    auditService.logBackup('Cleared', user?.id || '', 'default', `${action.title} executed from Danger Zone`);
    setCompletedActions((prev) => [...prev, action.id]);
    setActionStep('done');
  };

  const actions: DangerAction[] = [
    {
      id: 'restore_defaults',
      title: 'Restore Default Settings',
      description: 'Reset all app settings (currency, date format, theme, session timeout) to factory defaults. Your data is safe.',
      icon: <RotateCcw className="w-5 h-5" />,
      color: '#f59e0b',
      confirmWord: 'RESTORE',
      deleteItems: ['All custom settings'],
      preserveItems: ['All transactions', 'All accounts', 'All partners', 'All users'],
      action: () => {
        idbStorage.clear('settings', 'settings');
        localStorage.removeItem('money_meva_theme');
      },
    },
    {
      id: 'clear_transactions',
      title: 'Clear All Transactions',
      description: 'Delete every transaction record. Accounts, partners, categories, and users remain intact.',
      icon: <FileText className="w-5 h-5" />,
      color: '#ef4444',
      confirmWord: 'TRANSACTIONS',
      deleteItems: ['All transactions', 'All transaction tags'],
      preserveItems: ['All accounts', 'All partners', 'All categories', 'All users'],
      action: () => { storage.transactions.clear(); },
    },
    {
      id: 'clear_partners',
      title: 'Clear All Partners',
      description: 'Delete all partners (customers, vendors, friends, family, workers). Transaction links to partners will be cleared.',
      icon: <HandCoins className="w-5 h-5" />,
      color: '#ec4899',
      confirmWord: 'PARTNERS',
      deleteItems: ['All partners', 'All partner groups'],
      preserveItems: ['All transactions', 'All accounts', 'All categories', 'All users'],
      action: () => {
        partnerService.clear();
        partnerService.groups.clear();
      },
    },
    {
      id: 'clear_categories',
      title: 'Clear All Categories',
      description: 'Delete all custom categories. Default categories will be restored on next use.',
      icon: <Tag className="w-5 h-5" />,
      color: '#8b5cf6',
      confirmWord: 'CATEGORIES',
      deleteItems: ['All custom categories', 'Category usage stats'],
      preserveItems: ['All transactions', 'All accounts', 'All partners', 'All users'],
      action: () => { categoryService.clear(); },
    },
    {
      id: 'clear_accounts',
      title: 'Clear All Accounts',
      description: 'Delete all accounts (Cash, Bank, UPI, Wallet). Default accounts will be restored. Transaction account links will be cleared.',
      icon: <FolderOpen className="w-5 h-5" />,
      color: '#3b82f6',
      confirmWord: 'ACCOUNTS',
      deleteItems: ['All accounts', 'Account balances'],
      preserveItems: ['All transactions', 'All partners', 'All categories', 'All users'],
      action: () => { accountService.clear(); },
    },
    {
      id: 'clear_loans',
      title: 'Clear All Loans & EMIs',
      description: 'Delete all loan records, EMI tracking, investments, and savings entries.',
      icon: <CreditCard className="w-5 h-5" />,
      color: '#06b6d4',
      confirmWord: 'LOANS',
      deleteItems: ['All loans', 'All EMIs', 'All investments', 'All savings'],
      preserveItems: ['All transactions', 'All accounts', 'All partners', 'All users'],
      action: () => { loanService.clear(); },
    },
    {
      id: 'clear_archive',
      title: 'Clear Archive',
      description: 'Permanently delete all archived items. They cannot be restored after this.',
      icon: <Archive className="w-5 h-5" />,
      color: '#f97316',
      confirmWord: 'ARCHIVE',
      deleteItems: ['All archived transactions', 'All archived partners', 'All archived categories'],
      preserveItems: ['Active data', 'All users'],
      action: () => { archiveService.clear(); },
    },
    {
      id: 'clear_audit',
      title: 'Clear Audit Logs',
      description: 'Delete all activity logs. You will lose the history of changes.',
      icon: <FileText className="w-5 h-5" />,
      color: '#6366f1',
      confirmWord: 'AUDIT',
      deleteItems: ['All audit logs'],
      preserveItems: ['All transactions', 'All accounts', 'All users'],
      action: () => { storage.audit.clear(); },
    },
    {
      id: 'clear_users',
      title: 'Clear All Users',
      description: 'Delete ALL user accounts including admin. You will need to re-onboard.',
      icon: <Users className="w-5 h-5" />,
      color: '#ef4444',
      confirmWord: 'USERS',
      deleteItems: ['All user accounts', 'All sessions', 'Login data'],
      preserveItems: ['All transactions', 'All accounts', 'All partners', 'All settings'],
      action: () => {
        authService.clear();
        authService.logout();
        refreshUser();
      },
    },
    {
      id: 'clear_everything',
      title: 'Nuclear Option — Delete Everything',
      description: 'Permanently wipe ALL data including users, transactions, accounts, partners, categories, loans, settings, and logs. Complete factory reset.',
      icon: <Database className="w-5 h-5" />,
      color: '#dc2626',
      confirmWord: 'NUKE',
      deleteItems: ['ALL data', 'All users', 'All transactions', 'All accounts', 'All partners', 'All categories', 'All loans', 'All settings', 'All logs'],
      action: () => {
        storage.transactions.clear();
        partnerService.clear();
        partnerService.groups.clear();
        categoryService.clear();
        accountService.clear();
        loanService.clear();
        archiveService.clear();
        auditService.clear();
        authService.clear();
        authService.logout();
        refreshUser();
      },
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:px-6 md:px-8 py-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/settings" className="p-3 rounded-xl hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#ef4444' }}>Danger Zone</h1>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>Irreversible actions. Admin access required.</p>
          </div>
        </div>

        {completedActions.length > 0 && (
          <div className="p-3 rounded-xl border" style={{ backgroundColor: '#22c55e12', borderColor: '#22c55e33' }}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
              <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>Completed Actions</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {completedActions.map((id) => {
                const a = actions.find((x) => x.id === id);
                return a ? <span key={id} className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#22c55e18', color: '#22c55e' }}>{a.title}</span> : null;
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {actions.map((action) => {
            const isActive = activeAction === action.id;
            const isDone = completedActions.includes(action.id);
            return (
              <div key={action.id} className="rounded-xl border overflow-hidden" style={{ borderColor: isActive ? action.color : isDone ? '#22c55e44' : 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${action.color}18` }}>
                      <span style={{ color: action.color }}>{action.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{action.title}</h3>
                        {isDone && <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: '#22c55e18', color: '#22c55e' }}>DONE</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{action.description}</p>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {action.deleteItems.map((item) => (
                          <span key={item} className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#ef444415', color: '#ef4444' }}>✕ {item}</span>
                        ))}
                      </div>
                      {action.preserveItems && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {action.preserveItems.map((item) => (
                            <span key={item} className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#22c55e12', color: '#22c55e' }}>✓ {item}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isDone && !isActive && (
                    <div className="flex justify-end mt-3">
                      <button onClick={() => startAction(action.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: action.color }}>
                        <Trash2 className="w-3.5 h-3.5" /> Execute
                      </button>
                    </div>
                  )}

                  {isActive && (
                    <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                      {actionStep === 'captcha' && (
                        <div className="space-y-3">
                          {!captchaVerified ? (
                            <>
                              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Complete the captcha to continue:</p>
                              <MathCaptcha onVerify={(v) => setCaptchaVerified(v)} />
                              <button onClick={resetAction} className="text-xs" style={{ color: 'var(--text-muted)' }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <div className="p-4 rounded-xl border-2" style={{ backgroundColor: `${action.color}08`, borderColor: action.color }}>
                                <div className="flex items-center gap-3 mb-3 pb-3 border-b" style={{ borderColor: `${action.color}33` }}>
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${action.color}20` }}>
                                    <Shield className="w-5 h-5" style={{ color: action.color }} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold" style={{ color: action.color }}>Final Confirmation</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>This action cannot be undone</p>
                                  </div>
                                </div>

                                {user && (
                                  <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Administrator</p>
                                    </div>
                                  </div>
                                )}

                                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>You are about to delete:</p>
                                <div className="space-y-1 mb-3">
                                  {action.deleteItems.map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-xs" style={{ color: action.color }}>
                                      <span>✕</span> {item}
                                    </div>
                                  ))}
                                </div>

                                {action.preserveItems && action.preserveItems.length > 0 && (
                                  <>
                                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Will be preserved:</p>
                                    <div className="space-y-1 mb-3">
                                      {action.preserveItems.map((item) => (
                                        <div key={item} className="flex items-center gap-2 text-xs" style={{ color: '#22c55e' }}>
                                          <span>✓</span> {item}
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}

                                <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: `${action.color}33` }}>
                                  <button onClick={() => executeAction(action)} className="flex items-center gap-1.5 px-4 py-2 text-xs text-white rounded-lg font-medium" style={{ backgroundColor: action.color }}>
                                    <Trash2 className="w-3.5 h-3.5" /> Confirm & Execute
                                  </button>
                                  <button onClick={resetAction} className="text-xs px-3 py-2 rounded-lg" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>Cancel</button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {actionStep === 'done' && (
                        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#22c55e15' }}>
                          <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                          <span className="text-sm font-medium" style={{ color: '#22c55e' }}>{action.title} completed successfully.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
