'use client';

import { useEffect, useState } from 'react';
import { idbStorage } from '@/lib/idbStorage';
import { migrationService } from '@/lib/migration';

export default function IDBInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await migrationService.migrate();
      await idbStorage.init();
      setReady(true);
    };
    init();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Loading data...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
