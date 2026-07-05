'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Upload, Download, Trash2, AlertTriangle, Database, AlertCircle, Shield, Key, Clock, Eye, EyeOff, Cloud, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addTransaction, getTransactions, getBudgets, getGoals, getReminders, getRecurring, getPartners, getAdjustments } from '@/lib/store';
import { exportAllDataPDF, exportAllDataExcel } from '@/lib/export';
import { switchUser, getAllUsers, getSession } from '@/lib/localAuth';
import { clearAllDB } from '@/lib/store';
import { db } from '@/lib/db';
import { generatePins, getPins, arePinsShown, markPinsShown, hasPins, getRemainingPins, getAutoLockMinutes, setAutoLockMinutes } from '@/lib/pinStore';

export default function SettingsPage() {

  const [clearStep, setClearStep] = useState<'idle' | 'confirm' | 'captcha'>('idle');
  const [clearMode, setClearMode] = useState<'user-data' | 'all-data'>('all-data');
  const [pins, setPins] = useState<string[]>([]);
  const [pinsGenerated, setPinsGenerated] = useState(false);
  const [pinsShown, setPinsShown] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [autoLock, setAutoLock] = useState(0);

  useEffect(() => {
    if (hasPins()) {
      setPins(getPins());
      setPinsGenerated(true);
      setPinsShown(arePinsShown());
      setRemaining(getRemainingPins());
    }
    setAutoLock(getAutoLockMinutes());
  }, []);
  const [captchaA, setCaptchaA] = useState(0);
  const [captchaB, setCaptchaB] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [importConfirm, setImportConfirm] = useState<{
    data: any;
    backupUser: string;
    backupId: string;
    currentUser: string;
    currentId: string;
    isFresh: boolean;
    itemCount: number;
  } | null>(null);

  const startClearData = (mode: 'user-data' | 'all-data') => {
    setClearMode(mode);
    setCaptchaA(Math.floor(Math.random() * 10) + 1);
    setCaptchaB(Math.floor(Math.random() * 10) + 1);
    setCaptchaAnswer('');
    setCaptchaError(false);
    setClearStep('captcha');
  };

  const handleClearData = async () => {
    const correct = captchaA + captchaB;
    if (Number(captchaAnswer) !== correct) {
      setCaptchaError(true);
      return;
    }
    setClearing(true);

    const userDataKeys = ['mm_transactions', 'mm_partners', 'mm_recurring', 'mm_budgets', 'mm_reminders', 'mm_adjustments', 'mm_goals'];

    if (clearMode === 'user-data') {
      userDataKeys.forEach(k => localStorage.removeItem(k));
      await Promise.all([
        db.transactions.clear(),
        db.partners.clear(),
        db.recurring.clear(),
        db.budgets.clear(),
        db.reminders.clear(),
        db.adjustments.clear(),
        db.goals.clear(),
      ]);
      setClearing(false);
      setClearStep('idle');
      setCaptchaAnswer('');
      alert('All user-created data has been cleared. Your account and login remain intact.');
      window.location.reload();
    } else {
      await clearAllDB();
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith('mm_') || k.startsWith('money_meva_'));
      allKeys.forEach(k => localStorage.removeItem(k));
      setClearing(false);
      setClearStep('idle');
      setCaptchaAnswer('');
      alert('All data has been permanently deleted. App has been reset to factory defaults.');
      window.location.reload();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div><h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1><p className="text-slate-500 dark:text-slate-400">Import, export, and manage your data</p></div>

        {/* CSV Import / Export */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">CSV Import / Export</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#2A2522] p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-brand-muted shadow-sm text-center space-y-4">
            <Upload className="h-12 w-12 text-brand mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Import CSV</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Upload transactions from a CSV file</p>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
              Choose CSV File
              <input type="file" accept=".csv" className="hidden" name="csv-import" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const text = reader.result as string;
                  const lines = text.split('\n').filter(l => l.trim());
                  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                  const dateIdx = headers.findIndex(h => h === 'date');
                  const amountIdx = headers.findIndex(h => h === 'amount');
                  const catIdx = headers.findIndex(h => h === 'category');
                  const descIdx = headers.findIndex(h => h === 'description' || h === 'desc' || h === 'note' || h === 'notes');
                  const typeIdx = headers.findIndex(h => h === 'type');
                  let imported = 0;
                  for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',').map(c => c.trim());
                    const date = dateIdx >= 0 ? cols[dateIdx] : new Date().toISOString().split('T')[0];
                    const amount = parseFloat(amountIdx >= 0 ? cols[amountIdx] : '0');
                    const category = catIdx >= 0 ? cols[catIdx] : 'Other';
                    const description = descIdx >= 0 ? cols[descIdx] : '';
                    let type = typeIdx >= 0 ? cols[typeIdx].toLowerCase() : 'expense';
                    type = ['income', 'expense', 'saving', 'investment'].includes(type) ? type : 'expense';
                    if (!amount || isNaN(amount)) continue;
                    addTransaction({ amount, type: type as any, category, description, date, partnerAccountId: undefined, isRecurring: false });
                    imported++;
                  }
                  alert(`Imported ${imported} transaction(s) from CSV.`);
                  e.target.value = '';
                };
                reader.readAsText(file);
              }} />
            </label>
            <p className="text-xs text-slate-400 dark:text-slate-500 pt-2">Headers: date, amount, category, description, type (income/expense/saving/investment)</p>
              <Button variant="ghost" size="sm" className="text-xs text-brand dark:text-brand-secondary" onClick={() => {
                const csv = 'date,amount,category,description,type\n2024-01-15,5000,Salary,January salary,income\n2024-01-16,200,Groceries,Weekly groceries,expense';
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'money-meva-template.csv'; a.click();
                URL.revokeObjectURL(url);
              }}>Download Template</Button>
          </div>
          <div className="bg-white dark:bg-[#2A2522] p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-brand-muted shadow-sm text-center space-y-4">
            <Download className="h-12 w-12 text-brand mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Export CSV</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Download all transactions as CSV</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="primary" size="sm" className="gap-2" onClick={() => {
                const txs = getTransactions();
                const csv = ['date,type,category,description,amount,partnerId'];
                txs.forEach(t => csv.push(`${t.date},${t.type},${t.category},${t.description},${t.amount},${t.partnerAccountId || ''}`));
                const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'money-meva-export.csv'; a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button variant="primary" size="sm" className="gap-2" onClick={exportAllDataPDF}>
                <Download className="h-4 w-4" /> PDF
              </Button>
              <Button variant="primary" size="sm" className="gap-2" onClick={exportAllDataExcel}>
                <Download className="h-4 w-4" /> Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Cloud Upgrade */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Need Cloud Backup?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Want your data backed up automatically and accessible from multiple devices? We offer paid cloud versions with Supabase integration.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">Cloud Sync</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">WordPress Plugin</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">Supabase Version</span>
              </div>
              <a href="https://t.me/marathimeva" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                Contact on Telegram <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Full JSON Backup */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Full Data Backup</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Export or restore all your data including profile, budgets, goals, partners, and transactions</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#2A2522] p-8 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800 shadow-sm text-center space-y-4">
            <Download className="h-12 w-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Export Full Backup (JSON)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Download everything — profile, transactions, budgets, goals, partners, reminders, recurring, adjustments</p>
            <Button variant="primary" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
              const version = document.querySelector('meta[name="app-version"]')?.getAttribute('content') || '4.0.1';
              const session = JSON.parse(localStorage.getItem('money_meva_session') || '{}');
              const exportData = {
                _metadata: {
                  app: 'Money Meva',
                  version,
                  exportDate: new Date().toISOString(),
                  exportedBy: session.full_name || session.email || 'unknown',
                },
                profile: session,
                transactions: getTransactions(),
                budgets: getBudgets(),
                goals: getGoals(),
                reminders: getReminders(),
                recurring: getRecurring(),
                partners: getPartners(),
                adjustments: getAdjustments(),
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `money-meva-backup-${new Date().toISOString().split('T')[0]}.json`; a.click();
              URL.revokeObjectURL(url);
            }}><Download className="h-4 w-4" /> Export JSON</Button>
          </div>
          <div className="bg-white dark:bg-[#2A2522] p-8 rounded-2xl border-2 border-dashed border-amber-200 dark:border-amber-800 shadow-sm text-center space-y-4">
            <Upload className="h-12 w-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Import Full Backup (JSON)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Restore everything from a backup file. Duplicates are skipped, cross-user data reassigned.</p>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700">
              <Upload className="mr-2 h-4 w-4" /> Choose Backup File
              <input type="file" accept=".json,application/json" className="hidden" name="json-import" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const data = JSON.parse(reader.result as string);
                    if (!data._metadata || !data._metadata.app) { alert('Invalid backup file'); return; }
                    const session = JSON.parse(localStorage.getItem('money_meva_session') || '{}');
                    const currentId = session.id || 'local-user';
                    const currentName = session.full_name || session.email || 'Current User';
                    const backupId = data.profile?.id || 'unknown';
                    const backupUser = data.profile?.full_name || data._metadata.exportedBy || 'Unknown';

                    let itemCount = 0;
                    ['transactions', 'budgets', 'goals', 'reminders', 'recurring', 'partners', 'adjustments'].forEach(k => {
                      if (data[k]?.length) itemCount += data[k].length;
                    });

                    const isFresh = !localStorage.getItem('mm_transactions') ||
                      JSON.parse(localStorage.getItem('mm_transactions') || '[]').length === 0;

                    if (backupId !== currentId) {
                      setImportConfirm({
                        data, backupUser, backupId, currentUser: currentName,
                        currentId, isFresh, itemCount,
                      });
                    } else {
                      doImport(data, currentId);
                    }
                  } catch (err) {
                    alert('Error importing backup. Make sure the file is a valid JSON backup file.');
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }} />
            </label>
            <p className="text-xs text-slate-400 dark:text-slate-500 pt-2">Only import files exported from Money Meva</p>
          </div>
        </div>

        {/* Security: PIN & Session Lock */}
        <div className="border-t border-slate-200 dark:border-brand-muted pt-8 mt-8">
          <div className="bg-white dark:bg-[#2A2522] rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-brand shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Security</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage PINs and session auto-lock</p>
              </div>
            </div>

            {/* PIN Generation */}
            <div className="bg-slate-50 dark:bg-brand-muted/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-brand shrink-0" />
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Access PINs</h4>
              </div>

              {!pinsGenerated ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Generate a set of one-time PINs for sensitive actions (archiving, restoring, editing entries).</p>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-sm space-y-1">
                    <p className="font-medium text-amber-800 dark:text-amber-300">⚠ Important</p>
                    <ul className="list-disc list-inside text-amber-700 dark:text-amber-400 text-xs space-y-1">
                      <li>PINs are shown <strong>only once</strong> after generation</li>
                      <li><strong>Save, write down, or print</strong> your PINs before closing</li>
                      <li>Each PIN is one-time use — after all are used, the cycle restarts</li>
                      <li>There is no recovery option if you lose all PINs</li>
                    </ul>
                  </div>
                  <Button onClick={() => {
                    const newPins = generatePins(10);
                    setPins(newPins);
                    setPinsGenerated(true);
                    setPinsShown(false);
                    setShowPins(true);
                    setRemaining(10);
                  }} className="gap-2"><Key className="h-4 w-4" /> Generate PINs</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {pinsShown ? 'PINs have been viewed. Cycle restarts when all are used.' : 'Your PINs have not been viewed yet.'}
                    </p>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-secondary dark:bg-brand-muted/30 text-brand dark:text-brand-secondary">{remaining} remaining</span>
                  </div>

                  {showPins && (
                    <div className="bg-white dark:bg-brand-dark rounded-xl border border-slate-200 dark:border-brand-muted p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Your PINs — save these now</p>
                        <button onClick={() => setShowPins(!showPins)} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          {showPins ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {pins.map((pin, i) => (
                          <div key={i} className="text-center font-mono font-bold text-lg text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-brand-muted/30 rounded-lg py-2 px-1">
                            {showPins ? pin : '••••'}
                            <span className="block text-[10px] text-slate-400 font-normal">#{i + 1}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => {
                          const text = pins.map((p, i) => `#${i + 1}: ${p}`).join('\n');
                          const blob = new Blob([text], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url; a.download = 'money-meva-pins.txt'; a.click();
                          URL.revokeObjectURL(url);
                        }} className="text-xs">Download as Text</Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          const win = window.open('', '_blank');
                          if (win) {
                            win.document.write(`<html><head><title>Money Meva PINs</title><style>body{font-family:monospace;padding:40px;text-align:center}h2{margin-bottom:20px}.pin{display:inline-block;margin:8px;padding:12px 20px;border:2px solid #ccc;border-radius:8px;font-size:24px;letter-spacing:4px}span{display:block;font-size:12px;color:#888}</style></head><body><h2>Money Meva — Access PINs</h2><p style="color:#888;margin-bottom:24px">Keep these safe. Each PIN can be used once.</p>${pins.map((p, i) => `<div class="pin">${p}<span>#${i + 1}</span></div>`).join('')}<p style="margin-top:40px;color:#aaa;font-size:12px">Generated: ${new Date().toLocaleString()}</p></body></html>`);
                            win.document.close();
                            win.print();
                          }
                        }} className="text-xs">Print</Button>
                      </div>
                      {!pinsShown && (
                        <Button size="sm" className="mt-3 w-full" onClick={() => {
                          markPinsShown();
                          setPinsShown(true);
                        }}>I have saved my PINs</Button>
                      )}
                    </div>
                  )}

                  {!showPins && (
                    <Button variant="outline" size="sm" onClick={() => setShowPins(true)} className="gap-2">
                      <Eye className="h-4 w-4" /> {pinsShown ? 'View PINs' : 'View & Save PINs'}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Auto-Lock Timer */}
            <div className="bg-slate-50 dark:bg-brand-muted/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand shrink-0" />
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Session Auto-Lock</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automatically lock the app after inactivity. A valid PIN is required to unlock.</p>
              <select value={autoLock} onChange={e => {
                const val = Number(e.target.value);
                setAutoLock(val);
                setAutoLockMinutes(val);
              }} className="w-full max-w-xs px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand">
                <option value={0}>Never</option>
                <option value={1}>After 1 minute</option>
                <option value={5}>After 5 minutes</option>
                <option value={15}>After 15 minutes</option>
                <option value={30}>After 30 minutes</option>
                <option value={60}>After 1 hour</option>
              </select>
              {!pinsGenerated && autoLock > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">Generate PINs above to use auto-lock</p>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-red-200 dark:border-red-800 pt-8 mt-8">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h3>
                <p className="text-sm text-red-600 dark:text-red-300">Destructive actions that cannot be undone</p>
              </div>
            </div>

            {clearStep === 'idle' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-red-900/30 rounded-xl p-4 text-sm space-y-2 border border-red-100 dark:border-red-800">
                  <p className="font-medium text-red-700 dark:text-red-300">Before proceeding:</p>
                  <ul className="list-disc list-inside text-red-600 dark:text-red-400 space-y-1">
                    <li>All actions <strong>cannot be reversed</strong></li>
                    <li>Make sure to <strong>export your data</strong> first (CSV / PDF / Excel / JSON)</li>
                  </ul>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="danger" onClick={() => startClearData('user-data')} className="gap-2">
                    <Trash2 className="h-4 w-4" /> Clear User Data
                  </Button>
                  <Button variant="danger" onClick={() => startClearData('all-data')} className="gap-2">
                    <Trash2 className="h-4 w-4" /> Clear All Data
                  </Button>
                </div>
              </div>
            )}

            {clearStep === 'captcha' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-red-900/30 rounded-xl p-4 border border-red-100 dark:border-red-800 space-y-4">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    {clearMode === 'user-data'
                      ? 'This will permanently delete all your user-created data. Solve the captcha to confirm:'
                      : 'This will factory reset the app — all data and accounts will be lost. Solve the captcha to confirm:'}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{captchaA} + {captchaB} = ?</span>
                    <input autoFocus value={captchaAnswer} onChange={e => { setCaptchaAnswer(e.target.value); setCaptchaError(false); }}
                      className={cn("w-20 px-3 py-2 rounded-lg border text-center text-lg font-bold outline-none focus:ring-2",
                        captchaError ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 focus:ring-brand"
                      )} placeholder="?" />
                  </div>
                  {captchaError && <p className="text-xs text-red-500 font-medium">Incorrect answer. Try again.</p>}
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setClearStep('idle')}>Cancel</Button>
                  <Button variant="danger" onClick={handleClearData} disabled={!captchaAnswer || clearing} className="gap-2">
                    {clearing ? 'Deleting...' : clearMode === 'user-data' ? 'Permanently Clear User Data' : 'Permanently Delete All Data'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Warning Modal */}
      {importConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setImportConfirm(null)}>
          <div className="bg-white dark:bg-[#2A2522] rounded-2xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-brand-muted">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/30">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Different User Backup</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">This backup belongs to another user</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 space-y-2 text-sm border border-amber-100 dark:border-amber-800">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Backup owner:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{importConfirm.backupUser}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Current user:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{importConfirm.currentUser}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Items in backup:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{importConfirm.itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Your account:</span>
                  <span className={cn("font-medium", importConfirm.isFresh ? "text-green-600" : "text-amber-600")}>
                    {importConfirm.isFresh ? 'Fresh (no data yet)' : 'Has existing data'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                <p className="font-medium mb-1">What will happen:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>All items will be <strong>reassigned to your user ID</strong></li>
                  <li>Duplicate IDs will be <strong>skipped</strong> (existing data preserved)</li>
                  <li>Your existing data <strong>will not be removed</strong></li>
                  {importConfirm.isFresh && <li>Since you have no data, this will be like starting with the backup</li>}
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setImportConfirm(null)}>Cancel</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                  if (switchUser(importConfirm.backupId)) {
                    window.location.reload();
                  } else {
                    alert('This user does not have a local account. Use "Import & Reassign" instead.');
                  }
                }}>
                  Switch to This User
                </Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => {
                  doImport(importConfirm.data, importConfirm.currentId);
                  setImportConfirm(null);
                }}>
                  Import & Reassign
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function doImport(data: any, currentUserId: string) {
  let imported = 0;
  const remap = (items: any[]) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map(item => {
      if (item.userId && item.userId !== currentUserId) {
        return { ...item, userId: currentUserId };
      }
      return item;
    });
  };
  const merge = (key: string, items: any[], idKey = 'id') => {
    const remapped = remap(items);
    if (!remapped.length) return;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const existingIds = new Set(existing.map((x: any) => x[idKey]));
    const newItems = remapped.filter((x: any) => !existingIds.has(x[idKey]));
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
  alert(`Imported ${imported} items from backup (${data._metadata.app} v${data._metadata.version}, exported ${new Date(data._metadata.exportDate).toLocaleDateString()})`);
  window.location.reload();
}
