"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  MoreHorizontal,
  Pin,
  Trash2,
  GripVertical,
} from "lucide-react";
import { UI } from "@/lib/constants";
import type { PageTreeNode } from "@/types";

interface PageTreeProps {
  pages: PageTreeNode[];
  projectId: string;
  activePageId?: string;
  onCreatePage: (parentId?: string) => void;
  onDeletePage: (pageId: string) => void;
  onTogglePin: (pageId: string, isPinned: boolean) => void;
}

export default function PageTree({
  pages,
  projectId,
  activePageId,
  onCreatePage,
  onDeletePage,
  onTogglePin,
}: PageTreeProps) {
  return (
    <div className="page-tree">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {UI.documents}
        </span>
        <button
          onClick={() => onCreatePage()}
          className="p-1 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
          title={UI.newPage}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Tree */}
      <div className="space-y-0.5">
        {pages.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            {UI.empty}
            <button
              onClick={() => onCreatePage()}
              className="block mx-auto mt-2 text-xs hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              + {UI.newPage}
            </button>
          </div>
        ) : (
          pages.map((page) => (
            <PageTreeItem
              key={page.id}
              page={page}
              projectId={projectId}
              activePageId={activePageId}
              depth={0}
              onCreatePage={onCreatePage}
              onDeletePage={onDeletePage}
              onTogglePin={onTogglePin}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Recursive tree item ────────────────────────────────────────

interface PageTreeItemProps {
  page: PageTreeNode;
  projectId: string;
  activePageId?: string;
  depth: number;
  onCreatePage: (parentId?: string) => void;
  onDeletePage: (pageId: string) => void;
  onTogglePin: (pageId: string, isPinned: boolean) => void;
}

function PageTreeItem({
  page,
  projectId,
  activePageId,
  depth,
  onCreatePage,
  onDeletePage,
  onTogglePin,
}: PageTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const isActive = page.id === activePageId;
  const hasChildren = page.children && page.children.length > 0;

  return (
    <div>
      <div
        className="group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-100"
        style={{
          paddingLeft: `${depth * 16 + 8}px`,
          backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        }}
      >
        {/* Expand/collapse */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }}
          className="p-0.5 rounded transition-colors"
          style={{
            color: 'var(--text-muted)',
            visibility: hasChildren ? 'visible' : 'hidden',
          }}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Page link */}
        <Link
          href={`/projects/${projectId}/docs/${page.id}`}
          className="flex-1 flex items-center gap-2 min-w-0 text-sm truncate transition-colors"
          style={{
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: isActive ? 500 : 400,
          }}
        >
          <span className="text-base">{page.icon}</span>
          <span className="truncate">{page.title}</span>
          {page.isPinned && (
            <Pin size={10} className="flex-shrink-0" style={{ color: 'var(--accent)' }} />
          )}
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreatePage(page.id);
            }}
            className="p-1 rounded transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
            title="Trang con mới"
          >
            <Plus size={12} />
          </button>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
            >
              <MoreHorizontal size={12} />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-36 rounded-lg py-1 shadow-xl z-20"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  onClick={() => {
                    onTogglePin(page.id, !page.isPinned);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Pin size={12} />
                  {page.isPinned ? "Bỏ ghim" : "Ghim"}
                </button>
                <button
                  onClick={() => {
                    onDeletePage(page.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 size={12} />
                  {UI.delete}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {page.children.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              projectId={projectId}
              activePageId={activePageId}
              depth={depth + 1}
              onCreatePage={onCreatePage}
              onDeletePage={onDeletePage}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
