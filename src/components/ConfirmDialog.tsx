'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [resolve, setResolve] = useState<(value: boolean) => void>(() => {});
  const [options, setOptions] = useState<ConfirmOptions>({ title: '', message: '' });
  const [show, setShow] = useState(false);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((res) => {
      setOptions(opts);
      setResolve(() => res);
      setShow(true);
    });
  }, []);

  const handleConfirm = () => { setShow(false); resolve(true); };
  const handleCancel = () => { setShow(false); resolve(false); };

  if (!show) {
    return (
      <ConfirmDialogContext.Provider value={{ confirm }}>
        {children}
      </ConfirmDialogContext.Provider>
    );
  }

  const variantColors = {
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };
  const color = variantColors[options.variant || 'danger'];

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="w-full max-w-md p-6 rounded-lg border shadow-xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{options.title}</h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{options.message}</p>
          <div className="flex justify-end gap-3">
            <button onClick={handleCancel} className="px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
              {options.cancelText || 'Cancel'}
            </button>
            <button onClick={handleConfirm} className="px-4 py-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: color }}>
              {options.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
}
