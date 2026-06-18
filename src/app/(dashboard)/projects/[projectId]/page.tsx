import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  UI,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from "@/lib/constants";

interface ProjectOverviewProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectOverview({
  params,
}: ProjectOverviewProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;

  // Fetch project with all data for stats
  const [project, tasks, pinnedPages, recentTasks] = await Promise.all([
    prisma.project.findFirst({
      where: { id: projectId, userId: session.userId },
    }),
    prisma.task.findMany({
      where: { projectId },
      select: { status: true, dueDate: true },
    }),
    prisma.page.findMany({
      where: { projectId, isPinned: true },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, icon: true },
    }),
    prisma.task.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        labels: true,
      },
    }),
  ]);

  if (!project) redirect("/");

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
  ).length;

  const stats = [
    {
      label: UI.totalTasks,
      value: totalTasks,
      color: "#3B82F6",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: UI.completedTasks,
      value: completedTasks,
      color: "#10B981",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Đang làm",
      value: inProgressTasks,
      color: "#F59E0B",
      bg: "bg-amber-50 dark:bg-amber-950",
    },
    {
      label: UI.overdueTasks,
      value: overdueTasks,
      color: "#EF4444",
      bg: "bg-red-50 dark:bg-red-950",
    },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-xl p-4 border border-neutral-200 dark:border-neutral-800`}
          >
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {stat.label}
            </p>
            <p
              className="text-3xl font-bold mt-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pinned pages */}
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            📌 {UI.pinnedPages}
          </h2>
          {pinnedPages.length === 0 ? (
            <p className="text-sm text-text-muted">{UI.empty}</p>
          ) : (
            <div className="space-y-2">
              {pinnedPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/projects/${projectId}/docs/${page.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-elevated transition-colors"
                >
                  <span>{page.icon}</span>
                  <span className="text-sm text-text-secondary">
                    {page.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent tasks */}
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            ⚡ Công việc gần đây
          </h2>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-text-muted">{UI.empty}</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-elevated transition-colors"
                >
                  {/* Status dot */}
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        TASK_STATUS_COLORS[task.status] || "#6B7280",
                    }}
                    title={TASK_STATUS_LABELS[task.status]}
                  />
                  <span className="text-sm text-text-secondary flex-1 truncate">
                    {task.title}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      color: TASK_PRIORITY_COLORS[task.priority],
                      backgroundColor:
                        TASK_PRIORITY_COLORS[task.priority] + "18",
                    }}
                  >
                    {TASK_PRIORITY_LABELS[task.priority]}
                  </span>
                  {task.labels.map((label) => (
                    <span
                      key={label.id}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        color: label.color,
                        backgroundColor: label.color + "18",
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
