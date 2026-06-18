import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UI, TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS, TASK_STATUS_ORDER } from "@/lib/constants";
import TasksClient from "./tasks-client";

interface TasksPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function TasksPage({ params }: TasksPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      labels: true,
      page: {
        select: { id: true, title: true, icon: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const serializedTasks = tasks.map((t) => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  // Group tasks by status for kanban
  const columns = TASK_STATUS_ORDER.map((status) => ({
    status,
    label: TASK_STATUS_LABELS[status],
    color: TASK_STATUS_COLORS[status],
    tasks: serializedTasks.filter((t) => t.status === status),
  }));

  return (
    <TasksClient
      projectId={projectId}
      columns={columns}
      allTasks={serializedTasks}
      statusLabels={TASK_STATUS_LABELS}
      statusColors={TASK_STATUS_COLORS}
      priorityLabels={TASK_PRIORITY_LABELS}
      priorityColors={TASK_PRIORITY_COLORS}
      uiLabels={{
        newTask: UI.newTask,
        empty: UI.empty,
        dueDate: UI.dueDate,
        priority: UI.priority,
        labels: UI.labels,
      }}
    />
  );
}
