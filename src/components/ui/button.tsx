'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-accent text-white hover:bg-blue-600 active:bg-blue-700 shadow-sm shadow-blue-500/20',
  secondary:
    'bg-bg-elevated text-text-primary border border-border hover:bg-[var(--bg-surface)] active:bg-bg-base',
  danger:
    'bg-danger text-white hover:bg-red-600 active:bg-red-700 shadow-sm shadow-red-500/20',
  ghost:
    'bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary active:bg-bg-surface',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-[6px]',
  md: 'h-9 px-4 text-sm gap-2 rounded-[8px]',
  lg: 'h-11 px-6 text-sm gap-2.5 rounded-[8px]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      iconLeft,
      iconRight,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
          'disabled:opacity-50 disabled:pointer-events-none',
          'cursor-pointer select-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : iconLeft ? (
          <span className="shrink-0">{iconLeft}</span>
        ) : null}
        {children}
        {iconRight && !loading && (
          <span className="shrink-0">{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
