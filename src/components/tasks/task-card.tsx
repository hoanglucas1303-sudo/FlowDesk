"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical } from "lucide-react";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants";
import { formatDate, isOverdue } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragOverlay?: boolean;
}

export default function TaskCard({ task, onClick, isDragOverlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = isOverdue(task.dueDate) && task.status !== "DONE";

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      className="task-card group rounded-lg p-3 cursor-pointer transition-all duration-150 hover:shadow-md"
      onClick={onClick}
      {...(!isDragOverlay ? attributes : {})}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
      aria-label={task.title}
    >
      <style jsx>{`
        .task-card {
          background-color: var(--bg-elevated);
          border: 1px solid var(--border);
        }
        .task-card:hover {
          border-color: var(--accent);
        }
      `}</style>

      {/* Drag handle */}
      <div className="flex items-start gap-2">
        {!isDragOverlay && (
          <button
            className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            style={{ color: 'var(--text-muted)' }}
            {...listeners}
            aria-label="Kéo thả"
          >
            <GripVertical size={14} />
          </button>
        )}

        <div className="flex-1 min-w-0">
          {/* Title */}
          <p
            className="text-sm font-medium truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {task.title}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Project badge */}
            {task.project && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1"
                style={{
                  backgroundColor: `${task.project.color}18`,
                  color: task.project.color,
                }}
              >
                <span>{task.project.icon}</span>
                <span className="truncate max-w-[80px]">{task.project.name}</span>
              </span>
            )}

            {/* Priority badge */}
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: `${TASK_PRIORITY_COLORS[task.priority]}20`,
                color: TASK_PRIORITY_COLORS[task.priority],
              }}
            >
              {TASK_PRIORITY_LABELS[task.priority]}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span
                className="flex items-center gap-1 text-xs"
                style={{
                  color: overdue ? "#EF4444" : "var(--text-muted)",
                }}
              >
                <Calendar size={11} />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {task.labels.map((label) => (
                <span
                  key={label.id}
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${label.color}25`,
                    color: label.color,
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
