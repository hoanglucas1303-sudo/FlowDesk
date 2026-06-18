'use client';

import Link from 'next/link';
import { cn, truncate } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  maxLabelLength?: number;
  className?: string;
}

export function Breadcrumb({
  items,
  maxLabelLength = 28,
  className,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm min-w-0', className)}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const label = truncate(item.label, maxLabelLength);

        return (
          <div key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
            )}
            {isLast || !item.href ? (
              <span
                className={cn(
                  'truncate',
                  isLast
                    ? 'text-text-primary font-medium'
                    : 'text-text-muted'
                )}
              >
                {label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="truncate text-text-secondary hover:text-text-primary transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
