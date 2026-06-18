"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, FileText, CheckSquare, FolderOpen, ArrowRight } from "lucide-react";
import { useKeyboardShortcut, useClickOutside } from "@/hooks";
import { UI } from "@/lib/constants";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/lib/constants";
import type { SearchResults } from "@/types";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ projects: [], pages: [], tasks: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Ctrl+K to toggle
  useKeyboardShortcut("k", () => setIsOpen((prev) => !prev), { ctrl: true });

  // Escape to close
  useKeyboardShortcut("Escape", () => setIsOpen(false));

  useClickOutside(panelRef, () => setIsOpen(false));

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults({ projects: [], pages: [], tasks: [] });
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], pages: [], tasks: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.data || { projects: [], pages: [], tasks: [] });
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Build flat list of all results for keyboard navigation
  const allItems = [
    ...results.projects.map((p) => ({ type: "project" as const, ...p })),
    ...results.pages.map((p) => ({ type: "page" as const, ...p })),
    ...results.tasks.map((t) => ({ type: "task" as const, ...t })),
  ];

  const handleSelect = useCallback(
    (item: (typeof allItems)[number]) => {
      setIsOpen(false);
      if (item.type === "project") {
        router.push(`/projects/${item.id}`);
      } else if (item.type === "page") {
        router.push(`/projects/${(item as any).projectId}/docs/${item.id}`);
      } else if (item.type === "task") {
        router.push(`/projects/${(item as any).projectId}/tasks`);
      }
    },
    [router]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && allItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(allItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  const hasResults = allItems.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-command-in"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={UI.searchPlaceholder}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          <kbd
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                {UI.loading}
              </div>
            ) : !hasResults ? (
              <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                {UI.noResults}
              </div>
            ) : (
              <>
                {/* Projects */}
                {results.projects.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                      {UI.projects}
                    </div>
                    {results.projects.map((project, i) => {
                      const globalIndex = i;
                      return (
                        <button
                          key={project.id}
                          onClick={() => handleSelect({ type: "project", ...project })}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                          style={{
                            backgroundColor: selectedIndex === globalIndex ? 'var(--bg-elevated)' : 'transparent',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <FolderOpen size={16} style={{ color: project.color }} />
                          <span className="text-sm">{project.icon} {project.name}</span>
                          <ArrowRight size={14} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Pages */}
                {results.pages.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                      {UI.documents}
                    </div>
                    {results.pages.map((page, i) => {
                      const globalIndex = results.projects.length + i;
                      return (
                        <button
                          key={page.id}
                          onClick={() => handleSelect({ type: "page", ...page })}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                          style={{
                            backgroundColor: selectedIndex === globalIndex ? 'var(--bg-elevated)' : 'transparent',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <FileText size={16} style={{ color: 'var(--accent)' }} />
                          <span className="text-sm">{page.icon} {page.title}</span>
                          <ArrowRight size={14} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tasks */}
                {results.tasks.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                      {UI.tasks}
                    </div>
                    {results.tasks.map((task, i) => {
                      const globalIndex = results.projects.length + results.pages.length + i;
                      return (
                        <button
                          key={task.id}
                          onClick={() => handleSelect({ type: "task", ...task })}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                          style={{
                            backgroundColor: selectedIndex === globalIndex ? 'var(--bg-elevated)' : 'transparent',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <CheckSquare size={16} style={{ color: 'var(--success)' }} />
                          <span className="text-sm">{task.title}</span>
                          <ArrowRight size={14} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer hint */}
        <div
          className="flex items-center justify-between px-4 py-2 text-xs border-t"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <span>↑↓ để di chuyển · Enter để chọn</span>
          <span>Ctrl+K để đóng</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes commandIn {
          from { opacity: 0; transform: scale(0.98) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-command-in {
          animation: commandIn 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}
