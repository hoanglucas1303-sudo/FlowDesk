"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PROJECT_ICONS, PROJECT_COLORS, UI } from "@/lib/constants";

interface ProjectFormProps {
  initialData?: {
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  onSubmit: (data: {
    name: string;
    description: string;
    icon: string;
    color: string;
  }) => void;
  onClose: () => void;
  isEditing?: boolean;
}

export default function ProjectForm({
  initialData,
  onSubmit,
  onClose,
  isEditing = false,
}: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [icon, setIcon] = useState(initialData?.icon || "📁");
  const [color, setColor] = useState(initialData?.color || "#3B82F6");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, description, icon, color });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-xl p-6 shadow-2xl animate-modal-in"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isEditing ? "Chỉnh sửa dự án" : UI.newProject}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon + Name row */}
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Tên dự án *
            </label>
            <div className="flex gap-2">
              <span className="text-2xl p-2 rounded-lg cursor-default" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                {icon}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 text-sm rounded-lg px-3 py-2 border outline-none focus:ring-2 focus:ring-blue-500/30"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
                placeholder="Nhập tên dự án..."
                autoFocus
                required
              />
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
              Biểu tượng
            </label>
            <div className="flex flex-wrap gap-1">
              {PROJECT_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className="p-1.5 text-lg rounded-md transition-all"
                  style={{
                    backgroundColor: icon === emoji ? 'var(--accent)' : 'var(--bg-elevated)',
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
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
              Màu sắc
            </label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? '2px solid white' : 'none',
                    outlineOffset: '2px',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
              {UI.projectDescription}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full text-sm rounded-lg px-3 py-2 border outline-none resize-none"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Mô tả ngắn gọn về dự án..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              {UI.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg font-medium text-white transition-colors bg-blue-600 hover:bg-blue-500"
            >
              {isEditing ? UI.save : "Tạo dự án"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-in {
          animation: modalIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
