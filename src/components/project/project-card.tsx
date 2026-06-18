"use client";

import Link from "next/link";
import { FileText, CheckSquare } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  pageCount: number;
  taskCount: number;
  updatedAt: string;
}

export default function ProjectCard({
  id,
  name,
  description,
  icon,
  color,
  pageCount,
  taskCount,
  updatedAt,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className="group block rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="p-4">
        {/* Icon + Title */}
        <div className="flex items-start gap-3">
          <span
            className="text-2xl p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className="text-sm font-semibold truncate group-hover:text-blue-400 transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              {name}
            </h3>
            {description && (
              <p
                className="text-xs mt-0.5 line-clamp-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div
          className="flex items-center gap-4 mt-4 pt-3 border-t text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <span className="flex items-center gap-1">
            <FileText size={12} />
            {pageCount} trang
          </span>
          <span className="flex items-center gap-1">
            <CheckSquare size={12} />
            {taskCount} việc
          </span>
          <span className="ml-auto">
            {formatRelativeTime(updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
