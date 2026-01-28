'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { toastStore, type Toast } from '@/lib/toast/toastStore';
import { X, CheckCircle2, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

function ToastIcon({ variant }: Readonly<{ variant: Toast['variant'] }>) {
  switch (variant) {
    case 'success':
      return (
        <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
      );
    case 'error':
      return <XCircle className='h-5 w-5 text-red-600 dark:text-red-400' />;
    case 'info':
      return <Info className='h-5 w-5 text-primary' />;
    default:
      return null;
  }
}

function ToastItem({
  toast,
  onDismiss,
}: Readonly<{ toast: Toast; onDismiss: () => void }>) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.durationMs);

    return () => clearTimeout(timer);
  }, [toast.durationMs, onDismiss]);

  const variantStyles = {
    default: 'border-border bg-background',
    success: 'border-green-500/20 bg-green-50 dark:bg-green-950/30',
    error: 'border-red-500/20 bg-red-50 dark:bg-red-950/30',
    info: 'border-primary/20 bg-primary/5',
  };

  return (
    <div
      id={`toast-${toast.id}`}
      className={cn(
        'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full',
        variantStyles[toast.variant],
      )}
      role='alert'
    >
      <ToastIcon variant={toast.variant} />
      <div className='flex-1'>
        <p className='text-sm font-semibold text-foreground'>{toast.title}</p>
        {toast.description && (
          <p className='mt-1 text-xs text-muted-foreground'>
            {toast.description}
          </p>
        )}
        {toast.actionLabel && toast.onAction && (
          <button
            onClick={toast.onAction}
            className='mt-2 text-xs font-medium text-primary hover:underline'
          >
            {toast.actionLabel}
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className='rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        aria-label='Close'
      >
        <X className='h-4 w-4' />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useSyncExternalStore(
    (callback) => toastStore.subscribe(callback),
    () => toastStore.getSnapshot(),
    () => toastStore.getSnapshot(),
  );

  const handleDismiss = (id: string) => {
    toastStore.removeToast(id);
  };

  return (
    <div
      id='toaster'
      className='fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:top-auto sm:bottom-0 sm:right-0 sm:flex-col md:max-w-[420px]'
      aria-live='polite'
      aria-atomic='true'
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => handleDismiss(toast.id)}
        />
      ))}
    </div>
  );
}
