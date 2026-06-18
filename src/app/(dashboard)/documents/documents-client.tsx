"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, FileText } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface PageWithProject {
  id: string;
  title: string;
  icon: string;
  projectId: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

interface DocumentsClientProps {
  initialPages: PageWithProject[];
}

export default function DocumentsClient({ initialPages }: DocumentsClientProps) {
  const [pages] = useState(initialPages);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPages = useMemo(() => {
    return pages.filter((page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary flex items-center gap-2.5">
            <FileText className="text-accent h-6 w-6" />
            Tài liệu của tôi
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Tổng hợp toàn bộ tài liệu và ghi chú của bạn từ tất cả các dự án.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Tìm kiếm tài liệu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-9 pl-9 pr-4 rounded-[8px] bg-bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Table view */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-16 bg-bg-surface border border-border rounded-[12px]">
          <FileText size={40} className="mx-auto text-text-muted opacity-50 mb-3" />
          <h3 className="text-lg font-bold text-text-primary">Không tìm thấy tài liệu</h3>
          <p className="text-sm text-text-muted mt-1">
            Thử tìm kiếm khác hoặc bắt đầu viết tài liệu trong một dự án.
          </p>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border rounded-[12px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-elevated/40 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <th className="py-3 px-4">Tài liệu</th>
                  <th className="py-3 px-4">Dự án liên kết</th>
                  <th className="py-3 px-4 text-right">Cập nhật lần cuối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-bg-elevated/10 transition-colors text-sm">
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      <Link
                        href={`/projects/${page.projectId}/docs/${page.id}`}
                        className="flex items-center gap-2 text-text-primary hover:text-accent font-semibold transition-colors w-fit"
                      >
                        <span className="text-base">{page.icon}</span>
                        <span className="truncate max-w-[300px] md:max-w-[500px]">
                          {page.title || "Tài liệu chưa đặt tên"}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/projects/${page.projectId}`}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: `${page.project.color}15`,
                          color: page.project.color,
                        }}
                      >
                        <span>{page.project.icon}</span>
                        <span>{page.project.name}</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-right text-text-muted">
                      {formatRelativeTime(page.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
