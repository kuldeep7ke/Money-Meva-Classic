'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Target, Users, CheckCircle, ArrowRight, ArrowLeft, Wallet, BarChart3, Upload } from 'lucide-react';
import { updateProfile } from '@/lib/localAuth';
import { addGoal, addPartner } from '@/lib/store';

const STEPS = [
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'financial', label: 'Financial', icon: Wallet },
  { key: 'business', label: 'Business', icon: Briefcase, optional: true },
  { key: 'partner', label: 'Partner', icon: Users, optional: true },
  { key: 'goals', label: 'Goals', icon: Target, optional: true },
  { key: 'complete', label: 'Done', icon: CheckCircle },
];

const MONTHLY_INCOME_OPTIONS = [
  'Under ₹25,000', '₹25,000 - ₹50,000', '₹50,000 - ₹1,00,000',
  '₹1,00,000 - ₹2,50,000', '₹2,50,000 - ₹5,00,000', 'Above ₹5,00,000',
];

const PRIMARY_GOALS = [
  'Track Expenses', 'Save for a Goal', 'Reduce Debt',
  'Grow Investments', 'Manage Business', 'All of the Above',
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: '',
    currency: 'INR',
    monthly_income: '',
    primary_goal: '',
    occupation: '',
    business_name: '',
    business_type: '',
  });
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [partnerForm, setPartnerForm] = useState<{ name: string; type: string; description: string } | null>(null);
  const [importMessage, setImportMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const canProceed = () => {
    if (step === 1) return form.full_name.trim().length > 0;
    if (step === 2) return form.monthly_income && form.primary_goal;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (user?.id) {
      updateProfile(user.id, {
        full_name: form.full_name,
        phone: form.phone,
        currency: form.currency,
        monthly_income: form.monthly_income,
        primary_goal: form.primary_goal,
        occupation: form.occupation,
        business_name: form.business_name,
        business_type: form.business_type,
        onboarding_step: step + 1,
      });
    }
    if (step === 6) {
      handleComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    if (step === 6 || step >= STEPS.length) {
      handleComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleComplete = () => {
    setLoading(true);
    if (user?.id) {
      updateProfile(user.id, {
        full_name: form.full_name,
        phone: form.phone,
        currency: form.currency,
        monthly_income: form.monthly_income,
        primary_goal: form.primary_goal,
        occupation: form.occupation,
        business_name: form.business_name,
        business_type: form.business_type,
        onboarding_completed: true,
        onboarding_step: 99,
      });
    }
    if (goalName && Number(goalTarget) > 0) {
      addGoal({ name: goalName, target: Number(goalTarget), saved: 0 });
    }
    if (partnerForm?.name.trim()) {
      const today = new Date().toISOString().split('T')[0];
      addPartner({
        name: partnerForm.name.trim(),
        type: partnerForm.type as 'farm' | 'startup' | 'project' | 'other',
        group: 'contact',
        description: partnerForm.description.trim(),
        budgetWindowStart: today,
        budgetWindowEnd: today,
        initialInvestment: 0,
      });
    }
    setTimeout(() => router.push('/dashboard'), 400);
  };

  const handleBackupImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as BackupData;
        if (!data._metadata?.app) {
          setImportMessage('Invalid backup file. Choose a Money Meva JSON export.');
          return;
        }

        const currentUserId = user?.id || 'local-user';
        const imported = importBackupData(data, currentUserId);
        const profile = data.profile || {};

        if (user?.id) {
          updateProfile(user.id, {
            full_name: getString(profile.full_name, form.full_name),
            phone: getString(profile.phone, form.phone),
            currency: getString(profile.currency, form.currency),
            monthly_income: getString(profile.monthly_income, form.monthly_income),
            primary_goal: getString(profile.primary_goal, form.primary_goal),
            occupation: getString(profile.occupation, form.occupation),
            business_name: getString(profile.business_name, form.business_name),
            business_type: getString(profile.business_type, form.business_type),
            onboarding_completed: true,
            onboarding_step: 99,
          });
        }

        setImportMessage(`Imported ${imported} backup items. Opening your dashboard...`);
        setLoading(true);
        setTimeout(() => router.push('/dashboard'), 600);
      } catch {
        setImportMessage('Could not import backup. Make sure the file is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-secondary dark:from-brand-dark dark:via-[#2A2522] dark:to-brand-muted px-4 py-8">
      <div className="max-w-lg w-full">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.filter(s => s.key !== 'complete').map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                step > i + 1 ? "bg-green-500 text-white" :
                step === i + 1 ? "bg-brand text-white ring-4 ring-brand/20" :
                "bg-slate-200 dark:bg-brand-muted text-slate-400 dark:text-slate-500"
              )}>
                {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              {s.key !== 'goals' && <div className={cn("w-8 h-0.5 mx-1", step > i + 1 ? "bg-green-500" : "bg-slate-200 dark:bg-brand-muted")} />}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#2A2522] p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-brand-muted">
          {/* Step 1: Personal Info - Mandatory */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="bg-brand-secondary dark:bg-brand-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-8 w-8 text-brand dark:text-brand-secondary" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Personal Information</h1>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Basic details to personalize your experience.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Full Name <span className="text-red-500">*</span></label>
                <input required value={form.full_name} onChange={e => update('full_name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand" placeholder="+91 98765 43210" />
                 <p className="text-xs text-slate-400 mt-1">Optional; used for backup and reminders.</p>
              </div>
              <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/70 p-4 text-center dark:border-amber-800 dark:bg-amber-900/20">
                <Upload className="mx-auto h-7 w-7 text-amber-600 dark:text-amber-400" />
                <h2 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">Already have a backup?</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Import your Money Meva JSON backup to restore old transactions, budgets, goals, partners, and reminders.</p>
                <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700">
                  <Upload className="mr-2 h-4 w-4" /> Import Backup
                  <input type="file" accept=".json,application/json" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBackupImport(file);
                    e.target.value = '';
                  }} />
                </label>
                {importMessage && <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">{importMessage}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Financial Info - Mandatory */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="bg-brand-secondary dark:bg-brand-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Wallet className="h-8 w-8 text-brand dark:text-brand-secondary" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Financial Profile</h1>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Help us tailor insights for you.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Monthly Income Range <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {MONTHLY_INCOME_OPTIONS.map(o => (
                    <button key={o} type="button" onClick={() => update('monthly_income', o)}
                      className={cn("px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left",
                        form.monthly_income === o
                          ? "border-brand bg-brand-secondary dark:bg-brand-muted/30 text-brand dark:text-brand-secondary"
                          : "border-slate-200 dark:border-brand-muted text-slate-600 dark:text-slate-400 hover:border-brand"
                      )}>{o}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Primary Financial Goal <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIMARY_GOALS.map(o => (
                    <button key={o} type="button" onClick={() => update('primary_goal', o)}
                      className={cn("px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left",
                        form.primary_goal === o
                          ? "border-brand bg-brand-secondary dark:bg-brand-muted/30 text-brand dark:text-brand-secondary"
                          : "border-slate-200 dark:border-brand-muted text-slate-600 dark:text-slate-400 hover:border-brand"
                      )}>{o}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Currency</label>
                <select value={form.currency} onChange={e => update('currency', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand">
                  <option value="INR">Indian Rupee (INR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Business/Work - Optional */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="bg-brand-secondary dark:bg-brand-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Briefcase className="h-8 w-8 text-brand dark:text-brand-secondary" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Work & Business</h1>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Optional — helps with business expense tracking.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Occupation</label>
                <input value={form.occupation} onChange={e => update('occupation', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. Software Engineer, Doctor, Business Owner" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Business Name (if applicable)</label>
                <input value={form.business_name} onChange={e => update('business_name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. My Store, Freelance Studio" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Business Type</label>
                <select value={form.business_type} onChange={e => update('business_type', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand">
                  <option value="">Select...</option>
                  <option value="retail">Retail / Store</option>
                  <option value="freelance">Freelance / Consultant</option>
                  <option value="startup">Startup / Company</option>
                  <option value="agriculture">Agriculture / Farming</option>
                  <option value="investment">Investment / Trading</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Partner Setup - Optional */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="bg-brand-secondary dark:bg-brand-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-brand dark:text-brand-secondary" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Partner Account</h1>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Optional — track shared finances with a partner.</p>
                {partnerForm && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">You can always add partner accounts later from the Partners page.</p>
                  </div>
                )}
              </div>
              {!partnerForm ? (
                <div className="text-center py-4">
                  <Button variant="outline" onClick={() => setPartnerForm({ name: '', type: 'other', description: '' })}>
                    <Users className="h-4 w-4 mr-2" /> Add a Partner Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-slate-50 dark:bg-brand-muted/30 rounded-xl">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Partner Name</label>
                    <input value={partnerForm.name} onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. Joint Venture" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Type</label>
                    <select value={partnerForm.type} onChange={e => setPartnerForm({ ...partnerForm, type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand">
                      <option value="farm">Farm / Agriculture</option>
                      <option value="startup">Startup / Business</option>
                      <option value="project">Project</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                    <input value={partnerForm.description} onChange={e => setPartnerForm({ ...partnerForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand" placeholder="Brief description" />
                  </div>
                  {partnerForm.name && (
                    <p className="text-xs text-slate-400">Partner will be created when you complete setup</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Quick Goal - Optional */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="bg-brand-secondary dark:bg-brand-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <BarChart3 className="h-8 w-8 text-brand dark:text-brand-secondary" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quick Savings Goal</h1>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Optional — set a savings target to track from day one.</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Quick Savings Goal</label>
                <div className="flex items-center gap-3">
                  <input value={goalName} onChange={e => setGoalName(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. New Laptop" />
                  <input value={goalTarget} onChange={e => setGoalTarget(e.target.value)} type="number"
                    className="w-28 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand" placeholder="Target ₹" />
                  {goalName && goalTarget && (
                    <button onClick={() => { setGoalName(''); setGoalTarget(''); }}
                      className="text-xs text-slate-400 hover:text-red-500">Remove</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Complete */}
          {step === 6 && (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 dark:bg-green-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">All Set!</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Welcome, <span className="font-semibold text-slate-700 dark:text-slate-300">{form.full_name}</span>!
                {form.primary_goal && ` Your primary goal is to "${form.primary_goal}".`}
              </p>
              <div className="bg-brand-light dark:bg-brand-muted/30 rounded-xl p-4 space-y-2 text-left">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Summary</p>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p>💼 {form.occupation || 'Occupation not set'} {form.business_name ? `· ${form.business_name}` : ''}</p>
                  <p>💰 Income: {form.monthly_income || 'Not specified'}</p>
                  <p>🎯 Goal: {form.primary_goal || 'Not set'}</p>
                  {goalName && <p>🏆 Goal: {goalName} (₹{Number(goalTarget).toLocaleString()})</p>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-brand-muted">
            <div>
              {step > 1 && step < 6 && (
                <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {[2, 3, 4, 5].includes(step) && (
                <Button variant="ghost" onClick={handleSkip} className="text-slate-400 text-sm">
                  Skip for now
                </Button>
              )}
              <Button onClick={handleNext} disabled={(step < 2 && !canProceed()) || loading} className="gap-1 min-w-[120px]">
                {loading ? 'Saving...' : step === 6 ? 'Go to Dashboard' : step === 1 ? 'Continue' : step === 5 ? 'Save & Continue' : 'Next'}
                {!loading && step < 6 && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          Step {step} of 6 · {STEPS[step - 1]?.label || 'Complete'}
        </p>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type BackupRecord = Record<string, unknown> & { id?: string };

type BackupData = {
  _metadata?: { app?: string; version?: string; exportDate?: string };
  profile?: BackupRecord;
  transactions?: BackupRecord[];
  budgets?: BackupRecord[];
  goals?: BackupRecord[];
  reminders?: BackupRecord[];
  recurring?: BackupRecord[];
  partners?: BackupRecord[];
  adjustments?: BackupRecord[];
};

function getString(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}

function importBackupData(data: BackupData, currentUserId: string) {
  let imported = 0;
  const merge = (key: string, items?: BackupRecord[]) => {
    if (!Array.isArray(items) || items.length === 0) return;
    const existing = parseStoredRecords(key);
    const existingIds = new Set(existing.map(item => item.id).filter(Boolean));
    const newItems = items
      .map(item => ({ ...item, userId: currentUserId }))
      .filter(item => !existingIds.has(item.id));

    if (newItems.length > 0) {
      localStorage.setItem(key, JSON.stringify([...existing, ...newItems]));
      imported += newItems.length;
    }
  };

  merge('mm_transactions', data.transactions);
  merge('mm_budgets', data.budgets);
  merge('mm_goals', data.goals);
  merge('mm_reminders', data.reminders);
  merge('mm_recurring', data.recurring);
  merge('mm_partners', data.partners);
  merge('mm_adjustments', data.adjustments);

  return imported;
}

function parseStoredRecords(key: string): BackupRecord[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
