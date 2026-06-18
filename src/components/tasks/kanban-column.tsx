"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  id: string;
  label: string;
  color: string;
  count: number;
  children: React.ReactNode;
  onCreateTask: () => void;
  isOverOverride?: boolean;
}

export default function KanbanColumn({
  id,
  label,
  color,
  count,
  children,
  onCreateTask,
  isOverOverride,
}: KanbanColumnProps) {
  const { isOver: isOverDroppable, setNodeRef } = useDroppable({ id });
  const isOver = isOverOverride !== undefined ? isOverOverride : isOverDroppable;

  return (
    <div
      ref={setNodeRef}
      className="kanban-column flex flex-col min-w-[280px] w-[280px] rounded-xl transition-all duration-200"
      style={{
        backgroundColor: isOver ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        border: isOver ? `1px solid ${color}40` : '1px solid var(--border)',
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {label}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {count}
          </span>
        </div>
        <button
          onClick={onCreateTask}
          className="p-1 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
          title="Việc mới"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)]">
        {children}
        {count === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            Kéo thả công việc vào đây
          </div>
        )}
      </div>
    </div>
  );
}
