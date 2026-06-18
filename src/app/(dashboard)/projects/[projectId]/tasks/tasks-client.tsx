"use client";

import { useState } from "react";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import TaskForm from "@/components/tasks/task-form";
import TaskDetail from "@/components/tasks/task-detail";
import KanbanBoard from "@/components/tasks/kanban-board";

interface Column {
  status: string;
  label: string;
  color: string;
  tasks: Task[];
}

interface TasksClientProps {
  projectId: string;
  columns: Column[];
  allTasks: Task[];
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
  priorityLabels: Record<string, string>;
  priorityColors: Record<string, string>;
  uiLabels: {
    newTask: string;
    empty: string;
    dueDate: string;
    priority: string;
    labels: string;
  };
}

type ViewMode = "kanban" | "table";

export default function TasksClient({
  projectId,
  columns: initialColumns,
  allTasks,
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  uiLabels,
}: TasksClientProps) {
  const [view, setView] = useState<ViewMode>("kanban");
  const [showNewTask, setShowNewTask] = useState(false);
  const [defaultCreateStatus, setDefaultCreateStatus] = useState<TaskStatus>("TODO");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(allTasks);

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
    setCreating(true);
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
        // Append newly created task to state
        setTasks((prev) => [
          ...prev,
          {
            ...newTask,
            dueDate: newTask.dueDate ? newTask.dueDate : null,
            createdAt: newTask.createdAt,
            updatedAt: newTask.updatedAt,
          },
        ]);
        setShowNewTask(false);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTask = async (updates: Partial<Task>) => {
    if (!selectedTask) return;
    const originalTasks = [...tasks];

    // Optimistically update parent state
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

    // Optimistically remove from parent state
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

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              view === "kanban"
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              view === "table"
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            Bảng
          </button>
        </div>

        <button
          onClick={() => handleOpenCreateWithStatus("TODO")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          + {uiLabels.newTask}
        </button>
      </div>

      {showNewTask && (
        <TaskForm
          projectId={projectId}
          defaultStatus={defaultCreateStatus}
          onSubmit={handleCreateTask}
          onClose={() => setShowNewTask(false)}
        />
      )}

      {/* Views */}
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
          statusLabels={statusLabels}
          statusColors={statusColors}
          priorityLabels={priorityLabels}
          priorityColors={priorityColors}
          uiLabels={uiLabels}
          onTaskClick={setSelectedTask}
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



// ── Table View ─────────────────────────────────────────────────

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
      <div className="text-center py-16 text-neutral-400">
        <p className="text-4xl mb-3">📋</p>
        <p>{uiLabels.empty}</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-elevated border-b border-border">
            <th className="text-left font-medium text-neutral-500 px-4 py-3">
              Tiêu đề
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
              <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-200">
                {task.title}
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: statusColors[task.status] || "#6B7280",
                    }}
                  />
                  <span className="text-neutral-600 dark:text-neutral-400">
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
              <td className="px-4 py-3 text-neutral-500">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("vi-VN")
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
