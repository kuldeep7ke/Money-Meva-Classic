import { Transaction, PartnerAccount, RecurringTx, Budget, Reminder, Adjustment, Goal, ArchiveItemType, ArchivedItem } from '@/types';
import { db } from './db';

// ─── localStorage keys (tiny settings only) ─────────────────
const LS_KEYS = {
  onboarded: 'mm_onboarded',
  pins: 'mm_pins',
  pinsShown: 'mm_pins_shown',
  pinIndex: 'mm_pin_index',
  lockMinutes: 'mm_lock_minutes',
  lastActivity: 'mm_last_activity',
  version: 'mm_version',
};

// ─── In-memory cache (sync reads) ────────────────────────────
let cache: {
  transactions: Transaction[];
  partners: PartnerAccount[];
  recurring: RecurringTx[];
  budgets: Budget[];
  reminders: Reminder[];
  adjustments: Adjustment[];
  goals: Goal[];
} = {
  transactions: [],
  partners: [],
  recurring: [],
  budgets: [],
  reminders: [],
  adjustments: [],
  goals: [],
};

let initialized = false;

// ─── Utilities ───────────────────────────────────────────────
let _uid = 'local-user';
export function setUserId(id: string) { _uid = id; }
function uid() { return _uid; }
function now() { return new Date().toISOString(); }
function id() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

// ─── Init + Migration ────────────────────────────────────────
function localStorageKey(name: string): string {
  const map: Record<string, string> = {
    transactions: 'mm_transactions',
    partners: 'mm_partners',
    recurring: 'mm_recurring',
    budgets: 'mm_budgets',
    reminders: 'mm_reminders',
    adjustments: 'mm_adjustments',
    goals: 'mm_goals',
  };
  return map[name] || `mm_${name}`;
}

async function migrateFromLocalStorage() {
  for (const key of ['transactions', 'partners', 'recurring', 'budgets', 'reminders', 'adjustments', 'goals']) {
    try {
      const raw = localStorage.getItem(localStorageKey(key));
      if (!raw) continue;
      const items = JSON.parse(raw);
      if (!Array.isArray(items) || items.length === 0) continue;
      const table = db[key as keyof typeof db] as any;
      // Batch insert in chunks to avoid Dexie limits
      for (let i = 0; i < items.length; i += 500) {
        await table.bulkPut(items.slice(i, i + 500));
      }
      localStorage.removeItem(localStorageKey(key));
    } catch { /* skip */ }
  }
}

export async function initDB() {
  if (initialized) return;
  // Migrate any remaining localStorage data
  await migrateFromLocalStorage();
  // Hydrate cache from Dexie
  cache.transactions = await db.transactions.toArray();
  cache.partners = await db.partners.toArray();
  cache.recurring = await db.recurring.toArray();
  cache.budgets = await db.budgets.toArray();
  cache.reminders = await db.reminders.toArray();
  cache.adjustments = await db.adjustments.toArray();
  cache.goals = await db.goals.toArray();
  initialized = true;
}

// Re-init (used by Clear All Data)
export async function clearAllDB() {
  await Promise.all([
    db.transactions.clear(),
    db.partners.clear(),
    db.recurring.clear(),
    db.budgets.clear(),
    db.reminders.clear(),
    db.adjustments.clear(),
    db.goals.clear(),
  ]);
  cache.transactions = [];
  cache.partners = [];
  cache.recurring = [];
  cache.budgets = [];
  cache.reminders = [];
  cache.adjustments = [];
  cache.goals = [];
  // Clear localStorage settings
  for (const k of Object.values(LS_KEYS)) {
    try { localStorage.removeItem(k); } catch {}
  }
}

// ─── Transactions ────────────────────────────────────────────
export function getTransactions(type?: string): Transaction[] {
  const all = cache.transactions.filter(t => !t.deletedAt);
  return type ? all.filter(t => t.type === type) : all;
}

export function getArchivedTransactions(): Transaction[] {
  return cache.transactions.filter(t => t.deletedAt);
}

export function getLastDeletedTransaction(): Transaction | null {
  const archived = getArchivedTransactions().sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  return archived[0] || null;
}

function archivedItem(type: ArchiveItemType, item: any, label: string, subtitle: string, amount: number, deletedAt: string): ArchivedItem {
  return { id: item.id, type, label, subtitle, amount, deletedAt, original: item };
}

export function getAllArchivedItems(): ArchivedItem[] {
  const items: ArchivedItem[] = [];
  for (const t of getArchivedTransactions()) {
    items.push(archivedItem('transaction', t, t.description || t.category, `${t.type} · ${t.category}`, t.amount, t.deletedAt!));
  }
  for (const p of cache.partners.filter(p => p.deletedAt)) {
    items.push(archivedItem('partner', p, p.name, 'Partner Account', p.initialInvestment || 0, p.deletedAt!));
  }
  for (const r of cache.recurring.filter(r => r.deletedAt)) {
    items.push(archivedItem('recurring', r, r.title, `Recurring · ${r.frequency}`, r.amount, r.deletedAt!));
  }
  for (const r of cache.reminders.filter(r => r.deletedAt)) {
    items.push(archivedItem('reminder', r, r.title, `Reminder · ${r.frequency}`, r.amount, r.deletedAt!));
  }
  for (const b of cache.budgets.filter(b => b.deletedAt)) {
    items.push(archivedItem('budget', b, b.category, `Budget · ${b.period}`, b.limit, b.deletedAt!));
  }
  for (const a of cache.adjustments.filter(a => a.deletedAt)) {
    items.push(archivedItem('adjustment', a, a.notes || 'Adjustment', `Adjustment · ${a.accountType}`, a.amount, a.deletedAt!));
  }
  for (const g of cache.goals.filter(g => g.deletedAt)) {
    items.push(archivedItem('goal', g, g.name, `Goal · ₹${g.target.toLocaleString('en-IN')}`, g.saved, g.deletedAt!));
  }
  return items.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
}

export function restoreArchivedItem(type: ArchiveItemType, id: string) {
  switch (type) {
    case 'transaction': restoreTransaction(id); break;
    case 'partner': restorePartner(id); break;
    case 'recurring': restoreRecurring(id); break;
    case 'reminder': restoreReminder(id); break;
    case 'budget': restoreBudget(id); break;
    case 'adjustment': restoreAdjustment(id); break;
    case 'goal': restoreGoal(id); break;
  }
}

export function permanentDeleteArchivedItem(type: ArchiveItemType, id: string) {
  switch (type) {
    case 'transaction': permanentDeleteTransaction(id); break;
    case 'partner': permanentDeletePartner(id); break;
    case 'recurring': permanentDeleteRecurring(id); break;
    case 'reminder': permanentDeleteReminder(id); break;
    case 'budget': permanentDeleteBudget(id); break;
    case 'adjustment': permanentDeleteAdjustment(id); break;
    case 'goal': permanentDeleteGoal(id); break;
  }
}

export async function permanentDeleteAllArchived() {
  const keepTx = cache.transactions.filter(t => !t.deletedAt);
  const keepPartners = cache.partners.filter(p => !p.deletedAt);
  const keepRecurring = cache.recurring.filter(r => !r.deletedAt);
  const keepReminders = cache.reminders.filter(r => !r.deletedAt);
  const keepBudgets = cache.budgets.filter(b => !b.deletedAt);
  const keepAdjustments = cache.adjustments.filter(a => !a.deletedAt);
  const keepGoals = cache.goals.filter(g => !g.deletedAt);
  cache.transactions = keepTx;
  cache.partners = keepPartners;
  cache.recurring = keepRecurring;
  cache.reminders = keepReminders;
  cache.budgets = keepBudgets;
  cache.adjustments = keepAdjustments;
  cache.goals = keepGoals;
  await Promise.all([
    db.transactions.bulkPut(keepTx),
    db.partners.bulkPut(keepPartners),
    db.recurring.bulkPut(keepRecurring),
    db.reminders.bulkPut(keepReminders),
    db.budgets.bulkPut(keepBudgets),
    db.adjustments.bulkPut(keepAdjustments),
    db.goals.bulkPut(keepGoals),
  ]);
}

function upsertCacheAndWrite<T extends { id: string }>(table: string, list: T[], item: T) {
  const idx = list.findIndex(x => x.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  (db as any)[table].put(item).catch(() => {});
}

function deleteFromCacheAndWrite<T extends { id: string }>(table: string, list: T[], id: string) {
  const idx = list.findIndex(x => x.id === id);
  if (idx >= 0) list.splice(idx, 1);
  (db as any)[table].delete(id).catch(() => {});
}

export function addTransaction(tx: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Transaction {
  const t: Transaction = { ...tx, id: id(), userId: uid(), createdAt: now(), updatedAt: now() };
  cache.transactions.push(t);
  db.transactions.put(t).catch(() => {});
  return t;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  const idx = cache.transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  cache.transactions[idx] = { ...cache.transactions[idx], ...updates, updatedAt: now() };
  db.transactions.put(cache.transactions[idx]).catch(() => {});
  return cache.transactions[idx];
}

export function deleteTransaction(id: string) {
  return updateTransaction(id, { deletedAt: now() });
}

export function restoreTransaction(id: string) {
  return updateTransaction(id, { deletedAt: undefined });
}

export function permanentDeleteTransaction(id: string) {
  deleteFromCacheAndWrite('transactions', cache.transactions, id);
}

export function checkDuplicateTransaction(tx: { amount: number; type: string; category: string; description: string; date: string; partnerAccountId?: string }): Transaction | null {
  const match = cache.transactions.find(t =>
    !t.deletedAt &&
    t.date === tx.date &&
    t.type === tx.type &&
    t.amount === tx.amount &&
    t.category === tx.category &&
    (t.partnerAccountId || undefined) === (tx.partnerAccountId || undefined)
  );
  return match || null;
}

// ─── Partners ────────────────────────────────────────────────
export function getPartners(): PartnerAccount[] {
  return cache.partners.filter(p => !p.deletedAt);
}

export function addPartner(p: Omit<PartnerAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): PartnerAccount {
  const partner: PartnerAccount = { ...p, id: id(), userId: uid(), createdAt: now(), updatedAt: now() };
  cache.partners.push(partner);
  db.partners.put(partner).catch(() => {});
  return partner;
}

export function updatePartner(id: string, updates: Partial<PartnerAccount>) {
  const idx = cache.partners.findIndex(p => p.id === id);
  if (idx === -1) return null;
  cache.partners[idx] = { ...cache.partners[idx], ...updates, updatedAt: now() };
  db.partners.put(cache.partners[idx]).catch(() => {});
  return cache.partners[idx];
}

export function deletePartner(id: string) {
  return updatePartner(id, { deletedAt: now() });
}

export function restorePartner(id: string) {
  return updatePartner(id, { deletedAt: undefined });
}

export function permanentDeletePartner(id: string) {
  deleteFromCacheAndWrite('partners', cache.partners, id);
}

export function getPartnerPnL(partnerId: string) {
  const txs = getTransactions().filter(t => t.partnerAccountId === partnerId);
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, net: income - expense };
}

// ─── Recurring ───────────────────────────────────────────────
export function getRecurring(): RecurringTx[] {
  return cache.recurring.filter(r => !r.deletedAt);
}

export function addRecurring(r: Omit<RecurringTx, 'id' | 'userId' | 'createdAt'>): RecurringTx {
  const rec: RecurringTx = { ...r, id: id(), userId: uid(), createdAt: now() };
  cache.recurring.push(rec);
  db.recurring.put(rec).catch(() => {});
  return rec;
}

export function updateRecurring(id: string, updates: Partial<RecurringTx>) {
  const idx = cache.recurring.findIndex(r => r.id === id);
  if (idx === -1) return null;
  cache.recurring[idx] = { ...cache.recurring[idx], ...updates };
  db.recurring.put(cache.recurring[idx]).catch(() => {});
  return cache.recurring[idx];
}

export function deleteRecurring(id: string) {
  const idx = cache.recurring.findIndex(r => r.id === id);
  if (idx === -1) return;
  cache.recurring[idx] = { ...cache.recurring[idx], deletedAt: now() };
  db.recurring.put(cache.recurring[idx]).catch(() => {});
}

export function restoreRecurring(id: string) {
  const idx = cache.recurring.findIndex(r => r.id === id);
  if (idx === -1) return;
  cache.recurring[idx] = { ...cache.recurring[idx], deletedAt: undefined };
  db.recurring.put(cache.recurring[idx]).catch(() => {});
}

export function permanentDeleteRecurring(id: string) {
  deleteFromCacheAndWrite('recurring', cache.recurring, id);
}

// ─── Budgets ─────────────────────────────────────────────────
export function getBudgets(): Budget[] {
  return cache.budgets.filter(b => !b.deletedAt);
}

export function setBudgets(budgets: Budget[]) {
  cache.budgets = budgets.map(b => ({ ...b, userId: uid() }));
  db.budgets.clear().catch(() => {});
  db.budgets.bulkPut(cache.budgets).catch(() => {});
}

export function deleteBudget(id: string) {
  const idx = cache.budgets.findIndex(b => b.id === id);
  if (idx === -1) return;
  cache.budgets[idx] = { ...cache.budgets[idx], deletedAt: now() };
  db.budgets.put(cache.budgets[idx]).catch(() => {});
}

export function restoreBudget(id: string) {
  const idx = cache.budgets.findIndex(b => b.id === id);
  if (idx === -1) return;
  cache.budgets[idx] = { ...cache.budgets[idx], deletedAt: undefined };
  db.budgets.put(cache.budgets[idx]).catch(() => {});
}

export function permanentDeleteBudget(id: string) {
  deleteFromCacheAndWrite('budgets', cache.budgets, id);
}

export function upsertBudget(b: { category: string; limit: number; period: 'monthly' | 'yearly'; id?: string }): Budget {
  if (b.id) {
    const idx = cache.budgets.findIndex(x => x.id === b.id);
    if (idx >= 0) {
      cache.budgets[idx] = { ...cache.budgets[idx], ...b };
      db.budgets.put(cache.budgets[idx]).catch(() => {});
      return cache.budgets[idx];
    }
  }
  const nb: Budget = { ...b, id: id(), userId: uid(), createdAt: now() };
  cache.budgets.push(nb);
  db.budgets.put(nb).catch(() => {});
  return nb;
}

// ─── Reminders ───────────────────────────────────────────────
export function getReminders(): Reminder[] {
  return cache.reminders.filter(r => !r.deletedAt);
}

export function addReminder(r: Omit<Reminder, 'id' | 'userId' | 'createdAt'>): Reminder {
  const rem: Reminder = { ...r, id: id(), userId: uid(), createdAt: now() };
  cache.reminders.push(rem);
  db.reminders.put(rem).catch(() => {});
  return rem;
}

function computeNextDate(from: string, frequency: string): string | null {
  if (frequency === 'once') return null;
  const d = new Date(from);
  switch (frequency) {
    case 'daily': d.setDate(d.getDate() + 1); break;
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'quarterly': d.setMonth(d.getMonth() + 3); break;
    case 'half-yearly': d.setMonth(d.getMonth() + 6); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
    default: return null;
  }
  return d.toISOString().split('T')[0];
}

export function completeAndRescheduleReminder(id: string) {
  const idx = cache.reminders.findIndex(r => r.id === id);
  if (idx === -1) return;
  const rem = cache.reminders[idx];
  if (rem.frequency === 'once') {
    cache.reminders[idx].status = 'completed';
  } else {
    const next = computeNextDate(rem.dueDate, rem.frequency);
    if (next) {
      cache.reminders[idx].dueDate = next;
    } else {
      cache.reminders[idx].status = 'completed';
    }
  }
  db.reminders.put(cache.reminders[idx]).catch(() => {});
}

export function deleteReminder(id: string) {
  const idx = cache.reminders.findIndex(r => r.id === id);
  if (idx === -1) return;
  cache.reminders[idx] = { ...cache.reminders[idx], deletedAt: now() };
  db.reminders.put(cache.reminders[idx]).catch(() => {});
}

export function restoreReminder(id: string) {
  const idx = cache.reminders.findIndex(r => r.id === id);
  if (idx === -1) return;
  cache.reminders[idx] = { ...cache.reminders[idx], deletedAt: undefined };
  db.reminders.put(cache.reminders[idx]).catch(() => {});
}

export function permanentDeleteReminder(id: string) {
  deleteFromCacheAndWrite('reminders', cache.reminders, id);
}

// ─── Adjustments ─────────────────────────────────────────────
export function getAdjustments(): Adjustment[] {
  return cache.adjustments.filter(a => !a.deletedAt);
}

export function addAdjustment(a: Omit<Adjustment, 'id' | 'userId' | 'createdAt'>): Adjustment {
  const adj: Adjustment = { ...a, id: id(), userId: uid(), createdAt: now() };
  cache.adjustments.push(adj);
  db.adjustments.put(adj).catch(() => {});
  return adj;
}

export function deleteAdjustment(id: string) {
  const idx = cache.adjustments.findIndex(a => a.id === id);
  if (idx === -1) return;
  cache.adjustments[idx] = { ...cache.adjustments[idx], deletedAt: now() };
  db.adjustments.put(cache.adjustments[idx]).catch(() => {});
}

export function restoreAdjustment(id: string) {
  const idx = cache.adjustments.findIndex(a => a.id === id);
  if (idx === -1) return;
  cache.adjustments[idx] = { ...cache.adjustments[idx], deletedAt: undefined };
  db.adjustments.put(cache.adjustments[idx]).catch(() => {});
}

export function permanentDeleteAdjustment(id: string) {
  deleteFromCacheAndWrite('adjustments', cache.adjustments, id);
}

// ─── Goals ───────────────────────────────────────────────────
export function getGoals(): Goal[] {
  return cache.goals.filter(g => !g.deletedAt);
}

export function addGoal(g: Omit<Goal, 'id' | 'userId' | 'createdAt'>): Goal {
  const goal: Goal = { ...g, id: id(), userId: uid(), createdAt: now() };
  cache.goals.push(goal);
  db.goals.put(goal).catch(() => {});
  return goal;
}

export function updateGoal(id: string, updates: Partial<Goal>) {
  const idx = cache.goals.findIndex(g => g.id === id);
  if (idx === -1) return null;
  cache.goals[idx] = { ...cache.goals[idx], ...updates };
  db.goals.put(cache.goals[idx]).catch(() => {});
  return cache.goals[idx];
}

export function deleteGoal(id: string) {
  const idx = cache.goals.findIndex(g => g.id === id);
  if (idx === -1) return;
  cache.goals[idx] = { ...cache.goals[idx], deletedAt: now() };
  db.goals.put(cache.goals[idx]).catch(() => {});
}

export function restoreGoal(id: string) {
  const idx = cache.goals.findIndex(g => g.id === id);
  if (idx === -1) return;
  cache.goals[idx] = { ...cache.goals[idx], deletedAt: undefined };
  db.goals.put(cache.goals[idx]).catch(() => {});
}

export function permanentDeleteGoal(id: string) {
  deleteFromCacheAndWrite('goals', cache.goals, id);
}

// ─── Summary helpers ─────────────────────────────────────────
export function getMonthlySummary(year: number, month: number) {
  const txs = getTransactions().filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  return {
    income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    saving: txs.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0),
    investment: txs.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0),
    total: txs.reduce((s, t) => s + (t.type === 'income' || t.type === 'saving' ? t.amount : -t.amount), 0),
  };
}

export function getAggregates() {
  const txs = getTransactions();
  return {
    balance: txs.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0),
    income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    saving: txs.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0),
    investment: txs.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0),
  };
}

// ─── Notifications ───────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: 'recurring' | 'trash' | 'budget' | 'reminder';
  title: string;
  message: string;
  severity: 'danger' | 'warning' | 'info';
  amount: number;
}

export function getRecurringNotifications(): AppNotification[] {
  const recs = getRecurring().filter(r => r.status === 'active');
  const today = new Date();
  const notifs: AppNotification[] = [];
  for (const r of recs) {
    const nextDate = new Date(r.nextDate);
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) continue;
    if (diffDays <= r.reminderDays) {
      notifs.push({
        id: `rec-${r.id}`,
        type: 'recurring',
        title: r.title,
        message: diffDays === 0 ? 'Due today!' : `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`,
        severity: diffDays === 0 ? 'danger' : diffDays <= 2 ? 'warning' : 'info',
        amount: r.amount,
      });
    }
  }
  return notifs;
}

export function getArchiveNotifications(): AppNotification[] {
  const all = getAllArchivedItems();
  if (all.length === 0) return [];
  const last = all[0];
  return [{
    id: `arch-${last.id}-${last.type}`,
    type: 'trash',
    title: `"${last.label}" archived`,
    message: `${last.type} · Deleted ${new Date(last.deletedAt).toLocaleDateString('en-IN')}`,
    severity: 'info',
    amount: last.amount,
  }];
}

export function getBudgetNotifications(): AppNotification[] {
  const budgets = getBudgets();
  const notifs: AppNotification[] = [];
  for (const b of budgets) {
    const txs = getTransactions().filter(t => t.type === 'expense' && t.category === b.category);
    const spent = txs.reduce((s, t) => s + t.amount, 0);
    const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
    if (pct >= 80) {
      notifs.push({
        id: `budget-${b.id}`,
        type: 'budget',
        title: `Budget alert: ${b.category}`,
        message: `${pct}% of limit used (₹${Math.round(spent).toLocaleString('en-IN')})`,
        severity: pct >= 100 ? 'danger' : 'warning',
        amount: b.limit - spent,
      });
    }
  }
  return notifs;
}

export function getAllNotifications(): AppNotification[] {
  const today = new Date().toISOString().split('T')[0];
  const reminderNotifs: AppNotification[] = getReminders()
    .filter(r => r.status === 'pending' && r.dueDate <= today)
    .map(r => ({
      id: `rem-${r.id}`,
      type: 'reminder',
      title: r.title,
      message: `Due: ${r.dueDate}`,
      severity: 'info',
      amount: r.amount,
    }));
  return [
    ...getRecurringNotifications(),
    ...getArchiveNotifications(),
    ...getBudgetNotifications(),
    ...reminderNotifs,
    ...getWeekendReminders(),
  ];
}

function getWeekendReminders(): AppNotification[] {
  const day = new Date().getDay();
  const notWeekend = day !== 0 && day !== 6;
  const lastShown = localStorage.getItem('mm_weekend_notif_last_shown');
  const today = new Date().toISOString().split('T')[0];
  if (lastShown === today) return [];
  if (notWeekend) return [];
  localStorage.setItem('mm_weekend_notif_last_shown', today);
  return [
    {
      id: 'weekend-backup',
      type: 'reminder',
      title: 'Weekly Backup Reminder',
      message: 'It\'s the weekend! Back up your data from Settings → Export.',
      severity: 'warning',
      amount: 0,
    },
    {
      id: 'weekend-install',
      type: 'reminder',
      title: 'Install Money Meva',
      message: 'Install as an app for faster access and offline use.',
      severity: 'info',
      amount: 0,
    },
    ...getCloudUpgradeNotif(),
  ];
}

function getCloudUpgradeNotif(): AppNotification[] {
  const MIN_DAYS = 3;
  const MAX_DAYS = 4;
  const lastShown = localStorage.getItem('mm_cloud_notif_last_shown');
  const today = new Date().toISOString().split('T')[0];
  if (lastShown === today) return [];
  if (lastShown) {
    const last = new Date(lastShown).getTime();
    const now = Date.now();
    const daysSince = (now - last) / (1000 * 60 * 60 * 24);
    const randomDays = MIN_DAYS + Math.random() * (MAX_DAYS - MIN_DAYS);
    if (daysSince < randomDays) return [];
  }
  localStorage.setItem('mm_cloud_notif_last_shown', today);
  return [
    {
      id: 'cloud-upgrade',
      type: 'reminder',
      title: 'Cloud Version Available',
      message: 'Want data backup & multi-device sync? Contact us on Telegram!',
      severity: 'info',
      amount: 0,
    },
  ];
}

// ─── Carry forward ───────────────────────────────────────────
export function getCarryForward() {
  const txs = getTransactions();
  const now = new Date();
  const currentMonth = txs.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const lastMonth = txs.filter(t => {
    const d = new Date(t.date);
    const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return d.getFullYear() === ly && d.getMonth() === lm;
  });
  const lastMonthBal = lastMonth.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
  const currentBal = currentMonth.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
  return { lastMonthCarry: Math.max(0, lastMonthBal), currentStart: lastMonthBal, currentBalance: currentBal };
}
