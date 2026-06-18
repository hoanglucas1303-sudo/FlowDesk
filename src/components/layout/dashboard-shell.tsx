'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { ToastProvider } from '@/components/ui/toast';
import ProjectForm from '@/components/project/project-form';

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
  const [projectsState, setProjectsState] = useState(projects);
  const [showNewProject, setShowNewProject] = useState(false);

  useEffect(() => {
    setProjectsState(projects);
  }, [projects]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  const handleCreateProject = async (data: {
    name: string;
    description: string;
    icon: string;
    color: string;
  }) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjectsState((prev) => [
          ...prev,
          { ...newProject, pages: [] },
        ]);
        setShowNewProject(false);
        router.push(`/projects/${newProject.id}`);
        router.refresh();
      } else {
        const err = await response.json();
        alert(err.error || 'Không thể tạo dự án');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Lỗi kết nối');
    }
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar
          projects={projectsState}
          user={user}
          onNewProject={() => setShowNewProject(true)}
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

      {showNewProject && (
        <ProjectForm
          onSubmit={handleCreateProject}
          onClose={() => setShowNewProject(false)}
        />
      )}
    </ToastProvider>
  );
}
