"use client";

import { useState } from "react";
import { User, Mail, Moon, Sun } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface SettingsClientProps {
  initialUser: {
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export default function SettingsClient({ initialUser }: SettingsClientProps) {
  const { success, info } = useToast();
  const [name, setName] = useState(initialUser.name);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success("Thông tin cá nhân đã được cập nhật.");
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Profile settings card */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Thông tin cá nhân
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>
              Họ và tên
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm rounded-lg pl-10 pr-3 py-2 border outline-none focus:ring-2 focus:ring-blue-500/30"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>
              Địa chỉ Email (Không thể thay đổi)
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3" style={{ color: "var(--text-muted)" }} />
              <input
                type="email"
                value={initialUser.email}
                disabled
                className="w-full text-sm rounded-lg pl-10 pr-3 py-2 border opacity-60 cursor-not-allowed outline-none"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>

      {/* Theme preferences card */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Tùy chỉnh hệ thống
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Chế độ hiển thị
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Thay đổi giao diện sáng hoặc tối cho ứng dụng.
            </p>
          </div>

          <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("flowdesk_theme", "light");
                info("Đã chuyển sang giao diện Sáng.");
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all text-neutral-700 hover:bg-white dark:text-neutral-400 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <Sun size={14} className="text-yellow-500" />
              Sáng
            </button>
            <button
              onClick={() => {
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("flowdesk_theme", "dark");
                info("Đã chuyển sang giao diện Tối.");
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all text-neutral-400 hover:bg-neutral-100 dark:text-neutral-200 dark:bg-neutral-900 cursor-pointer"
            >
              <Moon size={14} className="text-indigo-400" />
              Tối
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
