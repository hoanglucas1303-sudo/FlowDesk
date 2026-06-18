"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, Calendar, Flag, FileText, Tag, Trash2, Folder } from "lucide-react";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_ORDER,
  UI,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/types";

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskDetail({ task, onClose, onUpdate, onDelete }: TaskDetailProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split("T")[0] : "");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSave = () => {
    onUpdate({
      title,
      description: description || null,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-md shadow-2xl overflow-y-auto animate-slide-in-right"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b sticky top-0"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border)',
          }}
        >
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Chi tiết công việc
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-md transition-colors hover:bg-red-500/10 text-red-400"
              title={UI.delete}
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Đóng"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="w-full text-lg font-semibold bg-transparent border-none outline-none placeholder:text-[var(--text-muted)]"
            style={{ color: 'var(--text-primary)' }}
            placeholder="Tiêu đề công việc"
          />

          {/* Status */}
          <div className="flex items-center gap-3">
            <Flag size={16} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm w-24" style={{ color: 'var(--text-secondary)' }}>
              Trạng thái
            </span>
            <select
              value={status}
              onChange={(e) => {
                const val = e.target.value as TaskStatus;
                setStatus(val);
                onUpdate({ status: val });
              }}
              className="text-sm px-2 py-1 rounded-md border outline-none"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: TASK_STATUS_COLORS[status],
              }}
            >
              {TASK_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
 
          {/* Priority */}
          <div className="flex items-center gap-3">
            <Flag size={16} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm w-24" style={{ color: 'var(--text-secondary)' }}>
              {UI.priority}
            </span>
            <select
              value={priority}
              onChange={(e) => {
                const val = e.target.value as TaskPriority;
                setPriority(val);
                onUpdate({ priority: val });
              }}
              className="text-sm px-2 py-1 rounded-md border outline-none"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: TASK_PRIORITY_COLORS[priority],
              }}
            >
              {(["LOW", "MEDIUM", "HIGH", "URGENT"] as TaskPriority[]).map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
 
          {/* Due date */}
          <div className="flex items-center gap-3">
            <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm w-24" style={{ color: 'var(--text-secondary)' }}>
              {UI.dueDate}
            </span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                const val = e.target.value;
                setDueDate(val);
                onUpdate({ dueDate: val ? new Date(val).toISOString() : null });
              }}
              className="text-sm px-2 py-1 rounded-md border outline-none"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex items-start gap-3">
              <Tag size={16} className="mt-0.5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm w-24" style={{ color: 'var(--text-secondary)' }}>
                {UI.labels}
              </span>
              <div className="flex flex-wrap gap-1">
                {task.labels.map((label) => (
                  <span
                    key={label.id}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${label.color}25`,
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Linked project */}
          {task.project && (
            <div className="flex items-center gap-3">
              <Folder size={16} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm w-24" style={{ color: 'var(--text-secondary)' }}>
                Dự án
              </span>
              <Link
                href={`/projects/${task.project.id}`}
                className="text-sm hover:underline font-semibold"
                style={{ color: task.project.color || 'var(--accent)' }}
              >
                {task.project.icon} {task.project.name}
              </Link>
            </div>
          )}

          {/* Linked page */}
          {task.page && (
            <div className="flex items-center gap-3">
              <FileText size={16} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm w-24" style={{ color: 'var(--text-secondary)' }}>
                {UI.assignedPage}
              </span>
              <a
                href={`/projects/${task.projectId}/docs/${task.pageId}`}
                className="text-sm hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                {task.page.icon} {task.page.title}
              </a>
            </div>
          )}

          {/* Description */}
          <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              rows={6}
              className="w-full text-sm rounded-lg p-3 border outline-none resize-none"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Thêm mô tả cho công việc..."
            />
          </div>

          {/* Timestamps */}
          <div className="pt-3 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Tạo lúc: {formatDate(task.createdAt)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Cập nhật: {formatDate(task.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s ease-out;
        }
      `}</style>
    </div>,
    document.body
  );
}
