'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { initDB } from '@/lib/store';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  PiggyBank, 
  TrendingUp, 
  Users, 
  Calendar, 
  SlidersHorizontal,
  BarChart3,
  Settings,
  Info,
  Sun,
  Moon,
  Menu,
  X,
  Archive,
  Lock,
  Unlock,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getAllArchivedItems } from '@/lib/store';
import { updateLastActivity, getAutoLockMinutes, isLocked, setLocked, checkAndLock, validatePin, hasPins, getRemainingPins } from '@/lib/pinStore';
import DataSafetyNotice from '@/components/DataSafetyNotice';
import InstallPrompt from '@/components/InstallPrompt';
import CloudUpgradePopup from '@/components/CloudUpgradePopup';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Income', href: '/dashboard/income', icon: ArrowUpCircle },
  { name: 'Expenses', href: '/dashboard/expenses', icon: ArrowDownCircle },
  { name: 'Savings', href: '/dashboard/savings', icon: PiggyBank },
  { name: 'Investments', href: '/dashboard/investments', icon: TrendingUp },
  { name: 'Partners', href: '/dashboard/partners', icon: Users },
  { name: 'Recurring', href: '/dashboard/recurring', icon: Calendar },
  { name: 'Adjustments', href: '/dashboard/adjustments', icon: SlidersHorizontal },
  { name: 'Summary', href: '/dashboard/summary', icon: BarChart3 },
  { name: 'Archive', href: '/dashboard/archive', icon: Archive },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'About', href: '/dashboard/about', icon: Info },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [archiveCount, setArchiveCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locked, setLockedState] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => { initDB().then(() => setReady(true)); }, []);

  useEffect(() => {
    if (!ready) return;
    const load = () => setArchiveCount(getAllArchivedItems().length);
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [ready]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Session lock: check periodically and track activity
  useEffect(() => {
    setLockedState(isLocked());
    setRemaining(hasPins() ? getRemainingPins() : 0);

    const activity = () => {
      updateLastActivity();
      setLocked(false);
      setLockedState(false);
    };
    window.addEventListener('mousedown', activity);
    window.addEventListener('keydown', activity);
    window.addEventListener('touchstart', activity);
    window.addEventListener('scroll', activity);
    activity();

    const lockInterval = setInterval(() => {
      if (!hasPins()) return;
      if (checkAndLock()) {
        setLockedState(true);
        setRemaining(getRemainingPins());
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousedown', activity);
      window.removeEventListener('keydown', activity);
      window.removeEventListener('touchstart', activity);
      window.removeEventListener('scroll', activity);
      clearInterval(lockInterval);
    };
  }, []);

  const handleUnlock = () => {
    if (validatePin(pinInput)) {
      setLocked(false);
      setLockedState(false);
      setPinInput('');
      setPinError(false);
      updateLastActivity();
      setRemaining(getRemainingPins());
    } else {
      setPinError(true);
    }
  };

  const sidebar = (
    <>
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand">Money Meva</h1>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors md:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium",
                pathname === item.href 
                  ? "bg-brand-secondary dark:bg-brand-muted/30 text-brand dark:text-brand-secondary" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-brand-light dark:hover:bg-brand-muted/50 hover:text-slate-900 dark:hover:text-slate-200"
              )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      {archiveCount > 0 && (
        <Link href="/dashboard/archive" className="mx-4 mb-2">
          <div className="px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex items-center justify-between text-xs hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer">
            <span className="text-amber-700 dark:text-amber-300 font-medium">Archive</span>
            <span className="bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded-full font-bold">{archiveCount}</span>
          </div>
        </Link>
      )}
      <div className="p-4 border-t border-slate-200 dark:border-brand-muted">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-brand-secondary dark:bg-brand-muted flex items-center justify-center text-brand dark:text-brand-secondary font-bold text-xs">
            {profile?.full_name?.[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile?.email || ''}</p>
          </div>
        </div>
      </div>
    </>
  );

  if (!ready) return (
    <div className="flex h-screen items-center justify-center bg-brand-light dark:bg-brand-dark">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-brand-light dark:bg-brand-dark">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-[#2A2522] border-r border-slate-200 dark:border-brand-muted flex-col">
        {sidebar}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#2A2522] flex flex-col shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Floating Nav Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative group">
          <button className="h-14 w-14 rounded-full bg-brand text-white shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors">
            <LayoutDashboard className="h-6 w-6" />
          </button>
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block group-active:block">
            <div className="bg-white dark:bg-[#2A2522] rounded-2xl border border-slate-200 dark:border-brand-muted shadow-xl p-2 min-w-44">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-brand-secondary text-brand-dark"
                        : "text-slate-600 dark:text-slate-400 hover:bg-brand-secondary dark:hover:bg-brand-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" /> {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Session Lock Overlay */}
      {locked && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#2A2522] rounded-2xl max-w-sm w-full p-8 shadow-2xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-secondary dark:bg-brand-muted/30 flex items-center justify-center">
              <Lock className="h-8 w-8 text-brand dark:text-brand-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Session Locked</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your PIN to unlock</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUnlock(); }} className="space-y-4">
              <input type="password" inputMode="numeric" autoFocus maxLength={4} value={pinInput}
                onChange={e => { setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(false); }}
                className={cn("w-full text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-lg border outline-none focus:ring-2",
                  pinError ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-slate-200 dark:border-brand-muted dark:bg-brand-dark dark:text-slate-100 focus:ring-brand"
                )} placeholder="••••" />
              {pinError && <p className="text-xs text-red-500 font-medium">Invalid PIN. Try another one.</p>}
              {remaining > 0 && <p className="text-xs text-slate-400 dark:text-slate-500">{remaining} PIN{remaining > 1 ? 's' : ''} remaining</p>}
              <Button type="submit" className="w-full py-3" disabled={pinInput.length < 4}>
                <Unlock className="h-4 w-4 mr-2" /> Unlock
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 dark:bg-brand-dark">
        <div className="flex items-center gap-3 mb-6 md:hidden">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2522] transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {children}
      </main>

      <DataSafetyNotice delay={8000} />
      <InstallPrompt delay={30000} />
      <CloudUpgradePopup delay={60000} />
    </div>
  );
}
