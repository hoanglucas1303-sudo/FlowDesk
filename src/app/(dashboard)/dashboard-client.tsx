"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Folder, FileText, CheckSquare, Clock, AlertCircle } from "lucide-react";
import ProjectCard from "@/components/project/project-card";
import ProjectForm from "@/components/project/project-form";
import { formatRelativeTime } from "@/lib/utils";

import type { Task, TaskStatus, TaskPriority } from "@/types";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  UI,
} from "@/lib/constants";
import KanbanBoard from "@/components/tasks/kanban-board";
import TaskForm from "@/components/tasks/task-form";
import TaskDetail from "@/components/tasks/task-detail";

interface DashboardClientProps {
  userName: string;
  stats: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
  projects: {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    color: string;
    pageCount: number;
    taskCount: number;
    updatedAt: string;
  }[];
  recentPages: {
    id: string;
    title: string;
    icon: string;
    projectId: string;
    updatedAt: string;
  }[];
  allTasks: Task[];
}

export default function DashboardClient({
  userName,
  stats,
  projects,
  recentPages,
  allTasks,
}: DashboardClientProps) {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Consolidated board state
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [showNewTask, setShowNewTask] = useState(false);
  const [defaultCreateStatus, setDefaultCreateStatus] = useState<TaskStatus>("TODO");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Capitalize Vietnamese date greeting
  const rawDate = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const handleCreateProject = async (data: {
    name: string;
    description: string;
    icon: string;
    color: string;
  }) => {
    setCreating(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowNewProjectModal(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setCreating(false);
    }
  };

  // ── Task Handlers ──────────────────────────────────────────────

  const handleOpenCreateWithStatus = (status: TaskStatus) => {
    setDefaultCreateStatus(status);
    setShowNewTask(true);
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus, newOrder: number) => {
    const originalTasks = [...tasks];

    // Optimistically update parent state
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, sortOrder: newOrder } : t
      )
    );

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          sortOrder: newOrder,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save task position");
      }
    } catch (error) {
      console.error("Failed to move task:", error);
      // Revert state on error
      setTasks(originalTasks);
    }
  };

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    projectId: string;
  }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || null,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
          projectId: data.projectId,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        
        // Find project details to append to newTask
        const proj = projects.find((p) => p.id === data.projectId);
        const projectDetails = proj
          ? { id: proj.id, name: proj.name, icon: proj.icon, color: proj.color }
          : null;

        // Append newly created task to state
        setTasks((prev) => [
          ...prev,
          {
            ...newTask,
            project: projectDetails,
            dueDate: newTask.dueDate ? newTask.dueDate : null,
            createdAt: newTask.createdAt,
            updatedAt: newTask.updatedAt,
          },
        ]);
        setShowNewTask(false);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleUpdateTask = async (updates: Partial<Task>) => {
    if (!selectedTask) return;
    const originalTasks = [...tasks];

    // Optimistically update state
    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTask.id ? { ...t, ...updates } : t))
    );
    // Keep details modal in sync
    setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null));

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      // Revert on error
      setTasks(originalTasks);
      const originalTask = originalTasks.find((t) => t.id === selectedTask.id);
      if (originalTask) setSelectedTask(originalTask);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const originalTasks = [...tasks];

    // Optimistically remove from state
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      // Revert on error
      setTasks(originalTasks);
      const originalTask = originalTasks.find((t) => t.id === taskId);
      if (originalTask) setSelectedTask(originalTask);
    }
  };

  // Map projects for the TaskForm select options
  const formProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    color: p.color,
  }));

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Xin chào, {userName}! 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {formattedDate}
          </p>
        </div>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/10 cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          Dự án mới
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div
          className="rounded-xl p-5 transition-all hover:scale-[1.01]"
          style={{
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            <Folder size={16} className="text-blue-500" />
            <span className="text-xs font-medium">Tổng dự án</span>
          </div>
          <p className="text-3xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
            {stats.totalProjects}
          </p>
        </div>

        {/* Total Tasks */}
        <div
          className="rounded-xl p-5 transition-all hover:scale-[1.01]"
          style={{
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            <CheckSquare size={16} className="text-purple-500" />
            <span className="text-xs font-medium">Tổng công việc</span>
          </div>
          <p className="text-3xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
            {stats.totalTasks}
          </p>
        </div>

        {/* Completed Tasks */}
        <div
          className="rounded-xl p-5 transition-all hover:scale-[1.01]"
          style={{
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            <CheckSquare size={16} className="text-emerald-500" />
            <span className="text-xs font-medium">Hoàn thành</span>
          </div>
          <p className="text-3xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
            {stats.completedTasks}
          </p>
        </div>

        {/* Overdue Tasks */}
        <div
          className="rounded-xl p-5 transition-all hover:scale-[1.01]"
          style={{
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            <AlertCircle size={16} className={stats.overdueTasks > 0 ? "text-red-500 animate-pulse" : "text-neutral-500"} />
            <span className="text-xs font-medium">Quá hạn</span>
          </div>
          <p
            className="text-3xl font-bold mt-2"
            style={{ color: stats.overdueTasks > 0 ? "var(--danger)" : "var(--text-primary)" }}
          >
            {stats.overdueTasks}
          </p>
        </div>
      </div>

      {/* Aggregated Tasks Board Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold tracking-tight flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span>📋</span> Bảng công việc tổng hợp
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Quản lý tất cả công việc từ mọi dự án đang hoạt động
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View switcher: Kanban / Bảng */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-surface border border-border">
              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                  view === "kanban"
                    ? "bg-blue-600 text-white shadow"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setView("table")}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                  view === "table"
                    ? "bg-blue-600 text-white shadow"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                Bảng
              </button>
            </div>

            {/* Create task button */}
            {projects.length > 0 && (
              <button
                onClick={() => handleOpenCreateWithStatus("TODO")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={14} />
                Thêm công việc
              </button>
            )}
          </div>
        </div>

        {/* View render */}
        {view === "kanban" ? (
          <KanbanBoard
            tasks={tasks}
            onTaskMove={handleTaskMove}
            onTaskClick={setSelectedTask}
            onCreateTask={handleOpenCreateWithStatus}
          />
        ) : (
          <TableView
            tasks={tasks}
            statusLabels={TASK_STATUS_LABELS}
            statusColors={TASK_STATUS_COLORS}
            priorityLabels={TASK_PRIORITY_LABELS}
            priorityColors={TASK_PRIORITY_COLORS}
            uiLabels={{
              dueDate: UI.dueDate,
              priority: UI.priority,
              labels: UI.labels,
              empty: UI.empty,
            }}
            onTaskClick={setSelectedTask}
          />
        )}
      </div>

      {/* New Project Form Modal */}
      {showNewProjectModal && (
        <ProjectForm
          onSubmit={handleCreateProject}
          onClose={() => setShowNewProjectModal(false)}
        />
      )}

      {/* New Task Form Modal */}
      {showNewTask && (
        <TaskForm
          projects={formProjects}
          defaultStatus={defaultCreateStatus}
          onSubmit={handleCreateTask}
          onClose={() => setShowNewTask(false)}
        />
      )}

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}

// ── Table View for Dashboard ───────────────────────────────────

function TableView({
  tasks,
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  uiLabels,
  onTaskClick,
}: {
  tasks: Task[];
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
  priorityLabels: Record<string, string>;
  priorityColors: Record<string, string>;
  uiLabels: {
    dueDate: string;
    priority: string;
    labels: string;
    empty: string;
  };
  onTaskClick: (task: Task) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-400 bg-bg-surface border border-border rounded-xl">
        <p className="text-4xl mb-3">📋</p>
        <p>{uiLabels.empty}</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-elevated border-b border-border">
              <th className="text-left font-medium text-neutral-500 px-4 py-3 min-w-[200px]">
                Tiêu đề
              </th>
              <th className="text-left font-medium text-neutral-500 px-4 py-3 min-w-[150px]">
                Dự án
              </th>
              <th className="text-left font-medium text-neutral-500 px-4 py-3">
                Trạng thái
              </th>
              <th className="text-left font-medium text-neutral-500 px-4 py-3">
                {uiLabels.priority}
              </th>
              <th className="text-left font-medium text-neutral-500 px-4 py-3">
                {uiLabels.dueDate}
              </th>
              <th className="text-left font-medium text-neutral-500 px-4 py-3">
                {uiLabels.labels}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {tasks.map((task) => (
              <tr
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="hover:bg-bg-elevated transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 font-semibold text-neutral-800 dark:text-neutral-200">
                  {task.title}
                </td>
                <td className="px-4 py-3">
                  {task.project ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold" style={{
                      backgroundColor: `${task.project.color}15`,
                      color: task.project.color,
                    }}>
                      <span>{task.project.icon}</span>
                      <span>{task.project.name}</span>
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: statusColors[task.status] || "#6B7280",
                      }}
                    />
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                      {statusLabels[task.status]}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      color: priorityColors[task.priority],
                      backgroundColor: priorityColors[task.priority] + "18",
                    }}
                  >
                    {priorityLabels[task.priority]}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-500 font-medium">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("vi-VN")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {task.labels && task.labels.map((label) => (
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
