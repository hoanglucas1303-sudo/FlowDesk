'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UI } from '@/lib/constants';
import { Avatar } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  CheckSquare,
  Settings,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  LogOut,
  Lock,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────

interface ProjectItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  pages?: PageItem[];
}

interface PageItem {
  id: string;
  title: string;
  icon: string;
  children?: PageItem[];
}

interface SidebarProps {
  projects: ProjectItem[];
  user: { name: string; email: string; avatarUrl?: string | null };
  onNewProject?: () => void;
}

// ── Nav Items ────────────────────────────────────────────────────

const navItems = [
  { href: '/', label: UI.dashboard, icon: LayoutDashboard },
  { href: '#projects', label: UI.projects, icon: FolderOpen },
  { href: '#documents', label: UI.documents, icon: FileText },
  { href: '#tasks', label: UI.tasks, icon: CheckSquare },
  { href: '/vault', label: UI.vault, icon: Lock },
];

// ── Page Tree Item ───────────────────────────────────────────────

function PageTreeItem({
  page,
  projectId,
  depth = 0,
}: {
  page: PageItem;
  projectId: string;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const href = `/projects/${projectId}/docs/${page.id}`;
  const isActive = pathname === href;
  const hasChildren = page.children && page.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1.5 py-1 px-2 rounded-[6px] text-sm cursor-pointer',
          'transition-colors duration-100',
          isActive
            ? 'bg-bg-elevated text-accent font-semibold'
            : 'text-neutral-800 dark:text-white hover:bg-bg-elevated hover:text-accent dark:hover:text-white'
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 hover:bg-bg-elevated rounded cursor-pointer"
          >
            <ChevronRight
              className={cn(
                'h-3 w-3 transition-transform duration-150',
                expanded && 'rotate-90'
              )}
            />
          </button>
        ) : (
          <span className="w-4" />
        )}
        <Link href={href} className="flex items-center gap-2 flex-1 truncate text-inherit hover:text-inherit">
          <span className="text-sm">{page.icon}</span>
          <span className="truncate">{page.title}</span>
        </Link>
      </div>
      {expanded &&
        hasChildren &&
        page.children!.map((child) => (
          <PageTreeItem
            key={child.id}
            page={child}
            projectId={projectId}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────

export function Sidebar({ projects, user, onNewProject }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Auto-expand project if URL matches
  useEffect(() => {
    const match = pathname.match(/^\/projects\/([^/]+)/);
    if (match) {
      setExpandedProject(match[1]);
    }
  }, [pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 h-14 shrink-0 border-b border-border">
        <div className="h-8 w-8 rounded-[8px] gradient-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
          F
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-neutral-800 dark:text-white tracking-tight">
            {UI.appName}
          </span>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {/* Main nav items */}
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium',
                'transition-all duration-150',
                isActive
                  ? 'bg-bg-elevated text-accent font-semibold'
                  : 'text-neutral-800 dark:text-white hover:bg-bg-elevated hover:text-accent dark:hover:text-white',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* ── Projects Section ─────────────────────────────── */}
        {!collapsed && (
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {UI.projects}
              </span>
              {onNewProject && (
                <button
                  onClick={onNewProject}
                  className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  title={UI.newProject}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-0.5">
              {projects.map((project) => {
                const isExpanded = expandedProject === project.id;
                const isProjectActive = pathname.startsWith(
                  `/projects/${project.id}`
                );

                return (
                  <div key={project.id}>
                    <div
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-1.5 rounded-[8px] text-sm cursor-pointer',
                        'transition-all duration-100',
                        isProjectActive
                          ? 'bg-bg-elevated text-accent font-semibold'
                          : 'text-neutral-800 dark:text-white hover:bg-bg-elevated hover:text-accent dark:hover:text-white'
                      )}
                      onClick={() =>
                        setExpandedProject(isExpanded ? null : project.id)
                      }
                    >
                      <span className="text-base shrink-0">{project.icon}</span>
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex-1 truncate text-inherit hover:text-inherit"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {project.name}
                      </Link>
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.pages && project.pages.length > 0 && (
                        <ChevronDown
                          className={cn(
                            'h-3 w-3 text-inherit transition-transform duration-150',
                            !isExpanded && '-rotate-90'
                          )}
                        />
                      )}
                    </div>

                    {/* Pages tree */}
                    {isExpanded && project.pages && (
                      <div className="ml-1 mt-0.5 space-y-0.5">
                        {project.pages.map((page) => (
                          <PageTreeItem
                            key={page.id}
                            page={page}
                            projectId={project.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {projects.length === 0 && (
                <p className="px-3 py-2 text-xs text-text-muted italic">
                  {UI.empty}
                </p>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Bottom: User & Collapse ───────────────────────── */}
      <div className="shrink-0 border-t border-border p-2 space-y-1">
        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm',
            pathname === '/settings'
              ? 'bg-bg-elevated text-accent font-semibold'
              : 'text-neutral-800 dark:text-white hover:bg-bg-elevated hover:text-accent dark:hover:text-white',
            'transition-colors duration-150',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? UI.settings : undefined}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>{UI.settings}</span>}
        </Link>

        {/* User */}
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-[8px]',
            collapsed && 'justify-center px-2'
          )}
        >
          <Avatar
            src={user.avatarUrl}
            name={user.name}
            size="sm"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-800 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'hidden lg:flex items-center gap-3 w-full px-3 py-2 rounded-[8px] text-sm',
            'text-neutral-500 dark:text-neutral-400 hover:bg-bg-elevated hover:text-accent dark:hover:text-white',
            'transition-colors duration-150 cursor-pointer',
            collapsed && 'justify-center px-2'
          )}
        >
          {collapsed ? (
            <PanelLeft className="h-[18px] w-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="h-[18px] w-[18px]" />
              <span>Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside
        className={cn(
          'hidden lg:flex flex-col shrink-0 h-screen sticky top-0',
          'bg-bg-surface border-r border-border',
          'transition-all duration-200 ease-out',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile Hamburger Button ─────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-3 z-40 p-2 rounded-[8px] bg-bg-surface border border-border text-text-primary shadow-lg cursor-pointer"
        aria-label="Mở menu"
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      {/* ── Mobile Overlay ──────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          {/* Slide-in sidebar */}
          <aside className="relative w-72 h-full bg-bg-surface border-r border-border animate-slide-in-left">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-[6px] text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
              aria-label="Đóng menu"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
