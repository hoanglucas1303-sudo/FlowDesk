"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TASK_STATUS_ORDER, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "@/lib/constants";
import type { Task, TaskStatus } from "@/types";
import KanbanColumn from "./kanban-column";
import TaskCard from "./task-card";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  onTaskClick: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
}

export default function KanbanBoard({
  tasks,
  onTaskMove,
  onTaskClick,
  onCreateTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Group tasks by status
  const columns = TASK_STATUS_ORDER.map((status) => ({
    id: status,
    label: TASK_STATUS_LABELS[status],
    color: TASK_STATUS_COLORS[status],
    tasks: tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) {
        setActiveTask(task);
        setHoveredColumnId(task.status);
      }
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;
      if (!over) {
        setHoveredColumnId(null);
        return;
      }

      const overId = over.id as string;
      if (TASK_STATUS_ORDER.includes(overId as TaskStatus)) {
        setHoveredColumnId(overId);
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask) {
          setHoveredColumnId(overTask.status);
        }
      }
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      setHoveredColumnId(null);

      if (!over) return;

      const taskId = active.id as string;
      const overId = over.id as string;

      // Determine target status - either from column id or from another task's status
      let targetStatus: TaskStatus;
      let targetOrder: number;

      // Check if dropped on a column
      if (TASK_STATUS_ORDER.includes(overId as TaskStatus)) {
        targetStatus = overId as TaskStatus;
        const columnTasks = tasks.filter((t) => t.status === targetStatus);
        targetOrder = columnTasks.length;
      } else {
        // Dropped on a task - use that task's status and position
        const overTask = tasks.find((t) => t.id === overId);
        if (!overTask) return;
        targetStatus = overTask.status;
        targetOrder = overTask.sortOrder;
      }

      const activeTask = tasks.find((t) => t.id === taskId);
      if (!activeTask) return;

      // Only trigger if something changed
      if (activeTask.status !== targetStatus || activeTask.sortOrder !== targetOrder) {
        onTaskMove(taskId, targetStatus, targetOrder);
      }
    },
    [tasks, onTaskMove]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            label={column.label}
            color={column.color}
            count={column.tasks.length}
            onCreateTask={() => onCreateTask(column.id as TaskStatus)}
            isOverOverride={hoveredColumnId === column.id}
          >
            <SortableContext
              items={column.tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                />
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80 rotate-2">
            <TaskCard task={activeTask} onClick={() => {}} isDragOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
