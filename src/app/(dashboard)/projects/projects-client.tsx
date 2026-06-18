"use client";

import { useState, useMemo } from "react";
import ProjectCard from "@/components/project/project-card";
import ProjectForm from "@/components/project/project-form";
import { Plus, Search, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProjectsClientProps {
  initialProjects: {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    color: string;
    pageCount: number;
    taskCount: number;
    updatedAt: string;
  }[];
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || descMatch;
    });
  }, [projects, searchQuery]);

  const handleCreateProject = async (data: {
    name: string;
    description: string;
    icon: string;
    color: string;
  }) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newProj = await response.json();
        const formatted = {
          ...newProj,
          pageCount: 0,
          taskCount: 0,
          updatedAt: new Date().toISOString(),
        };
        setProjects((prev) => [...prev, formatted]);
        setShowNewModal(false);
        router.refresh();
      } else {
        const err = await response.json();
        alert(err.error || "Không thể tạo dự án");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Lỗi kết nối");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary flex items-center gap-2.5">
            <Folder className="text-accent h-6 w-6" />
            Danh sách Dự án
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Tổng quan và quản lý tất cả các không gian làm việc đang hoạt động của bạn.
          </p>
        </div>
        <div>
          <Button
            size="sm"
            iconLeft={<Plus size={16} />}
            onClick={() => setShowNewModal(true)}
          >
            Dự án mới
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Tìm kiếm dự án..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-9 pl-9 pr-4 rounded-[8px] bg-bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-bg-surface border border-border rounded-[12px]">
          <Folder size={40} className="mx-auto text-text-muted opacity-50 mb-3" />
          <h3 className="text-lg font-bold text-text-primary">Không tìm thấy dự án</h3>
          <p className="text-sm text-text-muted mt-1">
            Thử tìm kiếm khác hoặc thêm mới dự án của bạn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((proj) => (
            <ProjectCard key={proj.id} {...proj} />
          ))}
        </div>
      )}

      {/* Project Form Modal */}
      {showNewModal && (
        <ProjectForm
          onSubmit={handleCreateProject}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </div>
  );
}
