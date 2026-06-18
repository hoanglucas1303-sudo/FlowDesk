"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { PROJECT_ICONS, PROJECT_COLORS, UI } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";

interface ProjectSettingsClientProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    color: string;
  };
}

export default function ProjectSettingsClient({ project }: ProjectSettingsClientProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [icon, setIcon] = useState(project.icon);
  const [color, setColor] = useState(project.color);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, icon, color }),
      });

      if (response.ok) {
        success("Thông tin dự án đã được cập nhật.");
        router.refresh();
      }
    } catch {
      error("Không thể cập nhật dự án.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteText !== project.name) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        success("Đã xóa dự án thành công.");
        router.push("/");
        router.refresh();
      }
    } catch {
      error("Không thể xóa dự án.");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Form */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Icon + Name row */}
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
              Tên dự án *
            </label>
            <div className="flex gap-2">
              <span className="text-2xl p-2 rounded-lg cursor-default" style={{ backgroundColor: "var(--bg-elevated)" }}>
                {icon}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 text-sm rounded-lg px-3 py-2 border outline-none focus:ring-2 focus:ring-blue-500/30"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                required
              />
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
              Biểu tượng
            </label>
            <div className="flex flex-wrap gap-1">
              {PROJECT_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className="p-1.5 text-lg rounded-md transition-all cursor-pointer"
                  style={{
                    backgroundColor: icon === emoji ? "var(--accent)" : "var(--bg-elevated)",
                    opacity: icon === emoji ? 1 : 0.7,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
              Màu sắc
            </label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all cursor-pointer"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? "2px solid white" : "none",
                    outlineOffset: "2px",
                    transform: color === c ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
              {UI.projectDescription}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full text-sm rounded-lg px-3 py-2 border outline-none resize-none"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="Mô tả ngắn gọn về dự án..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg font-medium text-white transition-colors bg-blue-600 hover:bg-blue-500 cursor-pointer"
            >
              {saving ? "Đang lưu..." : UI.save}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div
        className="rounded-xl border border-red-500/20 p-5 space-y-4"
        style={{
          backgroundColor: "var(--bg-surface)",
        }}
      >
        <div className="flex items-center gap-2 text-red-500">
          <AlertTriangle size={18} />
          <h2 className="text-sm font-bold uppercase tracking-wider">Khu vực nguy hiểm</h2>
        </div>

        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Việc xóa dự án sẽ xóa vĩnh viễn toàn bộ các tài liệu (pages), danh sách công việc (tasks) và các nhãn (labels) liên kết. Hành động này không thể hoàn tác.
        </p>

        <div className="pt-2 space-y-3">
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            Nhập <span className="font-semibold select-all" style={{ color: "var(--text-primary)" }}>{project.name}</span> để xác nhận:
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
              placeholder="Nhập chính xác tên dự án..."
              className="flex-1 text-sm rounded-lg px-3 py-2 border outline-none border-red-500/30"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={handleDelete}
              disabled={confirmDeleteText !== project.name || deleting}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 size={16} />
              {deleting ? "Đang xóa..." : "Xóa dự án"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
