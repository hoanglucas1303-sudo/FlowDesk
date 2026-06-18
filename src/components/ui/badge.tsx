'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const variantStyles = {
  default:
    'bg-bg-elevated text-text-secondary border-border',
  success:
    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning:
    'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger:
    'bg-red-500/15 text-red-400 border-red-500/30',
  info:
    'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export interface BadgeProps {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  dot?: boolean;
  dotColor?: string;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  dotColor,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        'whitespace-nowrap select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{
            backgroundColor:
              dotColor ||
              (variant === 'success'
                ? '#10B981'
                : variant === 'warning'
                  ? '#F59E0B'
                  : variant === 'danger'
                    ? '#EF4444'
                    : variant === 'info'
                      ? '#3B82F6'
                      : '#94A3B8'),
          }}
        />
      )}
      {children}
    </span>
  );
}
