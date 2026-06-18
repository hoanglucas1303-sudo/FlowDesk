'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

// ── Context ──────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ── Icons & styles per type ──────────────────────────────────────

const typeConfig: Record<
  ToastType,
  { icon: typeof CheckCircle; className: string; borderColor: string }
> = {
  success: {
    icon: CheckCircle,
    className: 'text-emerald-400',
    borderColor: 'border-l-emerald-500',
  },
  error: {
    icon: XCircle,
    className: 'text-red-400',
    borderColor: 'border-l-red-500',
  },
  info: {
    icon: Info,
    className: 'text-blue-400',
    borderColor: 'border-l-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-amber-400',
    borderColor: 'border-l-amber-500',
  },
};

// ── Provider ─────────────────────────────────────────────────────

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `toast-${++toastId}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast]
  );

  const value: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    info: (msg) => addToast('info', msg),
    warning: (msg) => addToast('warning', msg),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const config = typeConfig[t.type];
          const Icon = config.icon;
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto w-80 animate-slide-in-right',
                'flex items-start gap-3 p-4 rounded-[12px]',
                'bg-bg-surface border border-border border-l-4',
                'shadow-xl shadow-black/20',
                config.borderColor
              )}
              role="alert"
            >
              <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.className)} />
              <p className="text-sm text-text-primary flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="p-0.5 text-text-muted hover:text-text-primary transition-colors shrink-0 cursor-pointer"
                aria-label="Đóng"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return context;
}
