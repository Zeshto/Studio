'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onDismiss: () => void;
}

export function Toast({ message, type = 'success', onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm transition-all
        ${type === 'success' ? 'bg-teal-600' : 'bg-red-500'}`}
    >
      {type === 'success' ? '✅ ' : '❌ '}{message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const show = (message: string, type: 'success' | 'error' = 'success') =>
    setToast({ message, type });

  const dismiss = () => setToast(null);

  return { toast, show, dismiss };
}
