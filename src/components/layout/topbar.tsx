'use client';

import { useTheme } from '@/components/providers/theme-provider';
import { Avatar } from '@/components/ui/avatar';
import { Dropdown, type DropdownMenuEntry } from '@/components/ui/dropdown';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { UI } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Sun, Moon, Search, User, LogOut, Settings } from 'lucide-react';

interface TopbarProps {
  user: { name: string; email: string; avatarUrl?: string | null };
  breadcrumbs?: { label: string; href?: string }[];
  onSearch?: () => void;
  onLogout?: () => void;
}

export function Topbar({ user, breadcrumbs, onSearch, onLogout }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  const userMenuItems: DropdownMenuEntry[] = [
    {
      label: user.name,
      icon: <User className="h-4 w-4" />,
      disabled: true,
    },
    { divider: true },
    {
      label: UI.settings,
      icon: <Settings className="h-4 w-4" />,
      onClick: () => {
        window.location.href = '/settings';
      },
    },
    { divider: true },
    {
      label: UI.logout,
      icon: <LogOut className="h-4 w-4" />,
      onClick: onLogout,
      danger: true,
    },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-14 shrink-0',
        'flex items-center justify-between gap-4 px-4 lg:px-6',
        'bg-bg-base'
      )}
    >
      {/* ── Left: Breadcrumb ──────────────────────────────── */}
      <div className="flex-1 min-w-0 pl-10 lg:pl-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumb items={breadcrumbs} />
        ) : (
          <span className="text-sm text-text-muted">{UI.dashboard}</span>
        )}
      </div>

      {/* ── Right: Actions ────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={onSearch}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-[8px]',
            'bg-bg-elevated border border-border',
            'text-sm text-text-muted hover:text-text-secondary',
            'transition-colors duration-150 cursor-pointer',
            'hidden sm:flex'
          )}
        >
          <Search className="h-4 w-4" />
          <span>{UI.search}</span>
          <kbd className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-bg-surface border border-border text-text-muted">
            Ctrl+K
          </kbd>
        </button>

        {/* Mobile search icon */}
        <button
          onClick={onSearch}
          className="sm:hidden p-2 rounded-[8px] text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
          aria-label={UI.search}
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-[8px] text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
          aria-label={theme === 'dark' ? UI.lightMode : UI.darkMode}
          title={theme === 'dark' ? UI.lightMode : UI.darkMode}
        >
          {theme === 'dark' ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </button>

        {/* User menu */}
        <Dropdown
          trigger={
            <Avatar
              src={user.avatarUrl}
              name={user.name}
              size="sm"
              className="cursor-pointer hover:ring-2 hover:ring-accent/30 transition-shadow"
            />
          }
          items={userMenuItems}
          align="right"
        />
      </div>
    </header>
  );
}
