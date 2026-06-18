import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Auth check ─────────────────────────────────────────────
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // ── Fetch sidebar data ─────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  const projects = await prisma.project.findMany({
    where: { userId: user.id, status: 'ACTIVE' },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      pages: {
        where: { parentId: null },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          title: true,
          icon: true,
          children: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              title: true,
              icon: true,
            },
          },
        },
      },
    },
  });

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      projects={projects}
    >
      {children}
    </DashboardShell>
  );
}
