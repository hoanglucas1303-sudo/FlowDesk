'use client';

import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { ToastProvider } from '@/components/ui/toast';

interface DashboardShellProps {
  user: { name: string; email: string; avatarUrl?: string | null };
  projects: {
    id: string;
    name: string;
    icon: string;
    color: string;
    pages?: {
      id: string;
      title: string;
      icon: string;
      children?: { id: string; title: string; icon: string }[];
    }[];
  }[];
  children: ReactNode;
}

export function DashboardShell({
  user,
  projects,
  children,
}: DashboardShellProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar
          projects={projects}
          user={user}
          onNewProject={() => {
            // Will be wired to a modal later
          }}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            user={user}
            onLogout={handleLogout}
          />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
