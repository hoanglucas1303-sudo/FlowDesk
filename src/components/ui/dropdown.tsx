'use client';

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownDivider {
  divider: true;
}

export type DropdownMenuEntry = DropdownItem | DropdownDivider;

function isDivider(entry: DropdownMenuEntry): entry is DropdownDivider {
  return 'divider' in entry;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownMenuEntry[];
  align?: 'left' | 'right';
  className?: string;
}

// ── Component ────────────────────────────────────────────────────

export function Dropdown({
  trigger,
  items,
  align = 'right',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: Event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setFocusIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Get actionable items (non-divider, non-disabled)
  const actionableIndices = items
    .map((item, i) => (!isDivider(item) && !item.disabled ? i : -1))
    .filter((i) => i >= 0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setOpen(true);
          setFocusIndex(actionableIndices[0] ?? -1);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setFocusIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex((prev) => {
            const currentPos = actionableIndices.indexOf(prev);
            const next =
              currentPos < actionableIndices.length - 1
                ? actionableIndices[currentPos + 1]
                : actionableIndices[0];
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex((prev) => {
            const currentPos = actionableIndices.indexOf(prev);
            const next =
              currentPos > 0
                ? actionableIndices[currentPos - 1]
                : actionableIndices[actionableIndices.length - 1];
            return next;
          });
          break;
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const item = items[focusIndex];
          if (item && !isDivider(item) && !item.disabled && item.onClick) {
            item.onClick();
            setOpen(false);
            setFocusIndex(-1);
          }
          break;
        }
      }
    },
    [open, focusIndex, items, actionableIndices]
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-flex', className)}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        onClick={() => {
          setOpen(!open);
          if (!open) setFocusIndex(-1);
        }}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </div>

      {/* Menu */}
      {open && (
        <div
          ref={menuRef}
          className={cn(
            'absolute top-full mt-1.5 z-50 min-w-[180px]',
            'py-1.5 rounded-[12px]',
            'bg-bg-surface border border-border',
            'shadow-xl shadow-black/25',
            'animate-fade-in-scale origin-top',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((entry, i) => {
            if (isDivider(entry)) {
              return (
                <div
                  key={`divider-${i}`}
                  className="my-1.5 border-t border-border"
                  role="separator"
                />
              );
            }

            return (
              <button
                key={i}
                role="menuitem"
                disabled={entry.disabled}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left',
                  'transition-colors duration-100 cursor-pointer',
                  entry.danger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-text-primary hover:bg-bg-elevated',
                  entry.disabled && 'opacity-40 pointer-events-none',
                  focusIndex === i && 'bg-bg-elevated'
                )}
                onClick={() => {
                  entry.onClick?.();
                  setOpen(false);
                  setFocusIndex(-1);
                }}
                onMouseEnter={() => setFocusIndex(i)}
              >
                {entry.icon && (
                  <span className="shrink-0 text-text-muted">{entry.icon}</span>
                )}
                {entry.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
