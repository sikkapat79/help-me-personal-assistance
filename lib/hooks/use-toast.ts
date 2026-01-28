import { toastStore } from '@/lib/toast/toastStore';

interface ToastOptions {
  description?: string;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export function useToast() {
  return {
    success: (title: string, options?: ToastOptions) => {
      return toastStore.addToast({
        title,
        description: options?.description,
        variant: 'success',
        durationMs: options?.durationMs ?? 3000,
        actionLabel: options?.actionLabel,
        onAction: options?.onAction,
      });
    },
    error: (title: string, options?: ToastOptions) => {
      return toastStore.addToast({
        title,
        description: options?.description,
        variant: 'error',
        durationMs: options?.durationMs ?? 5000,
        actionLabel: options?.actionLabel,
        onAction: options?.onAction,
      });
    },
    info: (title: string, options?: ToastOptions) => {
      return toastStore.addToast({
        title,
        description: options?.description,
        variant: 'info',
        durationMs: options?.durationMs ?? 3000,
        actionLabel: options?.actionLabel,
        onAction: options?.onAction,
      });
    },
    dismiss: (id?: string) => {
      if (id) {
        toastStore.removeToast(id);
      }
    },
  };
}
