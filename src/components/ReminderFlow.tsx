'use client';

import { useState, useEffect } from 'react';
import BackupReminder from './BackupReminder';
import InstallReminder from './InstallReminder';

const BACKUP_KEY = 'money_meva_backup_reminder';
const INSTALL_KEY = 'money_meva_install_reminder';

function shouldShow(key: string, chance = 0.4): boolean {
  const last = localStorage.getItem(key);
  if (!last) return Math.random() < chance;
  const daysSince = (Date.now() - Number(last)) / (1000 * 60 * 60 * 24);
  return daysSince >= 7 && Math.random() < chance;
}

export default function ReminderFlow() {
  const [step, setStep] = useState<'idle' | 'backup' | 'install' | 'done'>('idle');

  useEffect(() => {
    const showBackup = shouldShow(BACKUP_KEY);
    const showInstall = shouldShow(INSTALL_KEY);
    if (!showBackup && !showInstall) { setStep('done'); return; }

    const t1 = setTimeout(() => {
      if (showBackup) {
        setStep('backup');
      } else if (showInstall) {
        setStep('install');
      }
    }, 4000);

    return () => clearTimeout(t1);
  }, []);

  const handleBackupDismiss = () => {
    setStep('idle');
    const showInstall = shouldShow(INSTALL_KEY, 0.5);
    if (showInstall) {
      setTimeout(() => setStep('install'), 2500);
    } else {
      setStep('done');
    }
  };

  const handleInstallDismiss = () => {
    setStep('done');
  };

  if (step === 'done') return null;

  return (
    <>
      {step === 'backup' && <BackupReminder force onDismiss={handleBackupDismiss} />}
      {step === 'install' && <InstallReminder onDismiss={handleInstallDismiss} />}
    </>
  );
}
