import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch user details
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  });
  if (!user) redirect("/login");

  // Query stats
  const [totalProjects, totalTasks, completedTasks, recentPages, projects, allTasks] = await Promise.all([
    prisma.project.count({
      where: { userId: session.userId, status: "ACTIVE" },
    }),
    prisma.task.count({
      where: { project: { userId: session.userId, status: "ACTIVE" } },
    }),
    prisma.task.count({
      where: { status: "DONE", project: { userId: session.userId, status: "ACTIVE" } },
    }),
    prisma.page.findMany({
      where: { project: { userId: session.userId, status: "ACTIVE" } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        icon: true,
        projectId: true,
        updatedAt: true,
      },
    }),
    prisma.project.findMany({
      where: { userId: session.userId, status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { pages: true, tasks: true },
        },
      },
    }),
    prisma.task.findMany({
      where: { project: { userId: session.userId, status: "ACTIVE" } },
      include: {
        labels: true,
        project: {
          select: { id: true, name: true, icon: true, color: true },
        },
        page: {
          select: { id: true, title: true, icon: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Query overdue tasks
  const overdueTasks = await prisma.task.count({
    where: {
      dueDate: { lt: new Date() },
      status: { not: "DONE" },
      project: { userId: session.userId, status: "ACTIVE" },
    },
  });

  const stats = {
    totalProjects,
    totalTasks,
    completedTasks,
    overdueTasks,
  };

  const serializedProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    icon: p.icon,
    color: p.color,
    pageCount: p._count.pages,
    taskCount: p._count.tasks,
    updatedAt: p.updatedAt.toISOString(),
  }));

  const serializedRecentPages = recentPages.map((p) => ({
    id: p.id,
    title: p.title,
    icon: p.icon,
    projectId: p.projectId,
    updatedAt: p.updatedAt.toISOString(),
  }));

  const serializedTasks = allTasks.map((t) => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return (
    <DashboardClient
      userName={user.name}
      stats={stats}
      projects={serializedProjects}
      recentPages={serializedRecentPages}
      allTasks={serializedTasks}
    />
  );
}
