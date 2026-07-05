'use client';

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ROLE_LABELS, ROLE_COLORS } from "@/modules/auth/types";
import { storage } from "@/modules/transactions/services/storage";
import { loanService } from "@/modules/loans/services/storage";
import { recurringService } from "@/modules/transactions/services/recurring";
import { ArrowRightLeft, Users, Settings, Sun, Moon, Wallet, Shield, LogOut, Plus, Home as HomeIcon, Grid3X3, Tag, CreditCard, Archive, FileText, Bell, AlertCircle, Clock, CalendarClock, X, Download, Smartphone } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from 'next/dynamic';

const DashboardWidgets = dynamic(() => import('@/modules/dashboard/components/DashboardWidgets'), { ssr: false });
import ReminderFlow from '@/components/ReminderFlow';

export default function Home() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, logout, hasPermission } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const notifications = useMemo(() => {
    if (!mounted) return [];
    const notifs: { id: string; type: 'danger' | 'warning' | 'info'; text: string; href: string; icon: React.ReactNode }[] = [];
    const today = new Date().toISOString().split('T')[0];

    const loans = loanService.getActive();
    const overdueLoans = loans.filter((l) => l.nextPaymentDate < today);
    if (overdueLoans.length > 0) {
      notifs.push({ id: 'overdue', type: 'danger', text: `${overdueLoans.length} overdue EMI payment(s)`, href: '/loans', icon: <AlertCircle className="w-5 h-5" /> });
    }
    const upcomingLoans = loans.filter((l) => {
      const d = new Date(l.nextPaymentDate);
      const now = new Date();
      const diff = d.getTime() - now.getTime();
      return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
    });
    upcomingLoans.forEach((l) => {
      notifs.push({ id: `emi-${l.id}`, type: 'warning', text: `EMI due: ${l.title} on ${l.nextPaymentDate}`, href: '/loans', icon: <Clock className="w-5 h-5" /> });
    });

    const upcomingRecurring = recurringService.getUpcoming(7);
    if (upcomingRecurring.length > 0) {
      notifs.push({ id: 'recurring', type: 'info', text: `${upcomingRecurring.length} recurring payment(s) due this week`, href: '/transactions', icon: <CalendarClock className="w-5 h-5" /> });
    }

    const day = new Date().getDay();
    if (day === 0 || day === 6) {
      notifs.push({ id: 'weekend-backup', type: 'warning', text: 'Weekend reminder: Backup your data to stay safe', href: '/backup', icon: <Download className="w-5 h-5" /> });
      notifs.push({ id: 'weekend-install', type: 'info', text: 'Install Money Meva on your device for offline access', href: '/install', icon: <Smartphone className="w-5 h-5" /> });
    }

    return notifs;
  }, [mounted]);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const mainNav = [
    { href: '/transactions', icon: <ArrowRightLeft className="w-5 h-5" />, label: 'Transactions', color: '#FF8A3D' },
    { href: '/accounts', icon: <Wallet className="w-5 h-5" />, label: 'Accounts', color: '#3b82f6' },
    { href: '/partners', icon: <Users className="w-5 h-5" />, label: 'Partners', color: '#8b5cf6' },
    { href: '/categories', icon: <Tag className="w-5 h-5" />, label: 'Categories', color: '#f59e0b' },
    { href: '/loans', icon: <CreditCard className="w-5 h-5" />, label: 'Loans', color: '#ec4899' },
    { href: '/archive', icon: <Archive className="w-5 h-5" />, label: 'Archive', color: '#f97316' },
    { href: '/audit', icon: <FileText className="w-5 h-5" />, label: 'Audit', color: '#8b5cf6' },
    { href: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings', color: '#6366f1' },
    { href: '/more', icon: <Grid3X3 className="w-5 h-5" />, label: 'More', color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-40 px-4 py-3" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand)' }}>
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Money Meva</h1>
              {user && (
                <p className="text-xs" style={{ color: ROLE_COLORS[user.role] }}>{ROLE_LABELS[user.role]}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/transactions/new" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: 'var(--brand)' }}>
              <Plus className="w-4 h-4" /> New
            </Link>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <Bell className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 border rounded-xl shadow-xl z-50" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                    <button onClick={() => setShowNotifs(false)}><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((n) => (
                      <Link key={n.id} href={n.href} onClick={() => setShowNotifs(false)} className="flex items-start gap-3 px-4 py-3 hover:opacity-80" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: n.type === 'danger' ? '#ef4444' : n.type === 'warning' ? '#f59e0b' : '#3b82f6' }}>{n.icon}</span>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{n.text}</p>
                      </Link>
                    )) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <Link href="/loans" onClick={() => setShowNotifs(false)} className="block px-4 py-2.5 text-center text-sm font-medium" style={{ color: 'var(--brand)' }}>
                      View All
                    </Link>
                  )}
                </div>
              )}
            </div>

            <button onClick={cycleTheme} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              {mounted && resolvedTheme === 'dark' ? <Moon className="w-4 h-4" style={{ color: 'var(--text-primary)' }} /> : <Sun className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />}
            </button>
            {user && (
              <button onClick={logout} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <LogOut className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <DashboardWidgets />

        <div className="mt-8 grid grid-cols-3 sm:grid-cols-5 gap-3">
          {mainNav.map((item, i) => (
            <Link key={i} href={item.href} className="flex flex-col items-center gap-2.5 p-4 rounded-xl hover:opacity-80 transition-all" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                <span style={{ color: item.color }}>{item.icon}</span>
              </div>
              <span className="text-sm font-medium text-center" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </main>

      <ReminderFlow />

      <footer className="max-w-5xl mx-auto px-4 py-4 mt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>© {new Date().getFullYear()} Money Meva v1.1.0</span>
          <div className="flex gap-4">
            <Link href="/about" className="hover:opacity-80">About</Link>
            <Link href="/contact" className="hover:opacity-80">Contact</Link>
            <Link href="/privacy" className="hover:opacity-80">Privacy</Link>
            <Link href="/terms" className="hover:opacity-80">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
