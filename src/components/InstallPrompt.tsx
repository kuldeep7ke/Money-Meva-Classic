'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Wifi, Zap, Shield, Smartphone } from 'lucide-react';

const LAST_SHOWN_KEY = 'mm_install_prompt_last_shown';
const MIN_DAYS = 4;
const MAX_DAYS = 7;
const SHOW_CHANCE = 0.4;

function shouldShow(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return false;
  if ((window.navigator as any).standalone) return false;
  if (Math.random() > SHOW_CHANCE) return false;
  const lastShown = localStorage.getItem(LAST_SHOWN_KEY);
  if (!lastShown) return true;
  const last = new Date(lastShown).getTime();
  const now = Date.now();
  const daysSince = (now - last) / (1000 * 60 * 60 * 24);
  const randomDays = MIN_DAYS + Math.random() * (MAX_DAYS - MIN_DAYS);
  return daysSince >= randomDays;
}

export default function InstallPrompt({ delay = 30000 }: { delay?: number }) {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const shownRef = useRef(false);

  useEffect(() => {
    const check = () => {
      if (shownRef.current) return;
      if (shouldShow()) {
        shownRef.current = true;
        const randomDelay = delay + Math.random() * 10000;
        setTimeout(() => setShow(true), randomDelay);
      }
    };

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      check();
    };

    window.addEventListener('beforeinstallprompt', handler);
    check();
    const interval = setInterval(check, 6 * 60 * 60 * 1000);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearInterval(interval);
    };
  }, [delay]);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString());
    setShow(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString());
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4" onClick={dismiss}>
      <div className="bg-white dark:bg-[#2A2522] rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-brand-secondary dark:bg-brand-muted/30">
              <Download className="h-5 w-5 text-brand dark:text-brand-secondary" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Install Money Meva</h3>
          </div>
          <button onClick={dismiss} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Install Money Meva on your device for a better experience — just like a native app!
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-brand-light dark:bg-brand-muted rounded-xl">
            <Zap className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Faster Access</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Open directly from your home screen — no browser needed</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-brand-light dark:bg-brand-muted rounded-xl">
            <Wifi className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Works Offline</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Use the app without internet — data stays on your device</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-brand-light dark:bg-brand-muted rounded-xl">
            <Shield className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">More Secure</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Runs in its own window — separate from browser tabs</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-brand-light dark:bg-brand-muted rounded-xl">
            <Smartphone className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Native App Feel</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Full screen, no address bar — feels like a real app</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            <strong>How to install:</strong> Click the <span className="inline-flex items-center mx-1 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">⬇️ Install</span> icon in your browser&apos;s address bar, or use the browser menu → &quot;Install app&quot;
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={dismiss}>Maybe Later</Button>
          <Button className="flex-1" onClick={handleInstall}>
            <Download className="h-4 w-4 mr-1" /> Install App
          </Button>
        </div>
      </div>
    </div>
  );
}
